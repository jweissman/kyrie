import { ItemCatalog } from '../item-catalog';
import { Overlays } from '../overlays';
import { WorldConstructs } from '../lang/world-constructs';
import { ModuleWriter } from '../lang/module-writer';
import { Content, type CreatureGenerationContext } from '../content';
import type { Module, Person } from '../lang/module';

export type Provenance = Record<string, 'authored' | 'generated' | 'default'>;
export interface CastMember { id: string; context: CreatureGenerationContext; gold: number; provenance?: Provenance }

// Who the people of a module are. Authored fields win, generated fields fill what the author left open, defaults fill
// the rest; each field records where it came from. A generator may only contribute fields a person actually has.
export class Cast {
  static readonly fields = ['raceId', 'classId', 'level', 'backgroundId', 'professionId', 'traits', 'gear'] as const;
  static person(p: Person, generated: Record<string, unknown> = {}, conflicts: string[] = []): CastMember {
    for (const key of Object.keys(generated)) {
      if (!['name', 'parameters', 'role'].includes(key) && !(this.fields as readonly string[]).includes(key)) {
        throw new Error(`Generated casting for ${p.id} sets ${key}, which is not a field of a person`);
      }
    }
    const authored = new Set(p.authored ?? []);
    const context: Record<string, unknown> = { name: typeof generated.name === 'string' ? generated.name : p.name };
    const provenance: Provenance = { name: typeof generated.name === 'string' ? 'generated' : 'authored' };
    for (const field of this.fields) {
      const mine = (p as unknown as Record<string, unknown>)[field], theirs = generated[field];
      if (authored.has(field)) {
        context[field] = mine; provenance[field] = 'authored';
        if (theirs !== undefined && theirs !== mine) {
          conflicts.push(`${p.id}.${field}: generated ${String(theirs)} ignored; authored ${String(mine)} kept`);
        }
      } else if (theirs !== undefined) { context[field] = theirs; provenance[field] = 'generated'; }
      else if (mine !== undefined) { context[field] = mine; provenance[field] = 'default'; }
    }
    // People of a module are Orsino NPCs: they prepare spells rather than choosing them as a player character does.
    context.prepared = true;
    // Creature constraints: generation may fill them in (a scenario's terrain or body); authored ones win.
    const offered = Object.entries((generated.parameters ?? {}) as Record<string, unknown>)
      .filter(([, v]) => v != null);
    const parameters = { ...Object.fromEntries(offered), ...p.creature };
    if (Object.keys(parameters).length) {
      context.parameters = parameters; provenance.parameters = p.creature ? 'authored' : 'generated';
    }
    return { id: `${p.id}_person`, context: context as CreatureGenerationContext, gold: 0, provenance };
  }
  // Every creature of a person's group: one unless the person Numbers more. Each has its own identity and draws.
  static group(p: Person, generated: Record<string, unknown> = {}, conflicts: string[] = []): CastMember[] {
    const first = this.person(p, generated, conflicts), count = p.count ?? 1;
    if (p.names && p.names.length !== count) { throw new Error(`${p.id}: Called names ${p.names.length} of ${count}`); }
    if (count === 1) { return [first]; }
    return Array.from({ length: count }, (_, i) => ({ ...structuredClone(first), id: i ? `${first.id}_${i + 1}` : first.id,
      context: { ...structuredClone(first.context), name: p.names?.[i] ?? this.numbered(p, generated, i) } }));
  }
  // Members of a group no one has named are told apart by their role and number ("Cave spider 2"), or, when the
  // role describes the whole group ("a sow bear and her grown cub"), by their kind ("Bear 2").
  private static numbered(p: Person, generated: Record<string, unknown>, i: number): string {
    const role = typeof generated.role === 'string' ? generated.role : p.role;
    const species = Content.races[p.raceId as keyof typeof Content.races]?.name;
    const kind = !role || / and |,/.test(role) ? species ?? p.name : role;
    const bare = kind.replace(/^(a|an|the) /i, '');
    return `${bare.charAt(0).toUpperCase()}${bare.slice(1)} ${i + 1}`;
  }
  // What a profession means for a person in the world: what they offer, and where they spend their day.
  static professions(module: Module, people: Person[]) {
    for (const p of people) {
      const id = p.professionId;
      if (!id || !Overlays.has(id, 'profession')) { continue; }
      const o = Overlays.get(id);
      // An authored offer of the same kind replaces the profession's default, including after a writer round trip.
      const own = new Set((p.offers ?? []).map(x => x.kind));
      const offers = (o.offers ?? []).filter(x => !own.has(x.kind)
        && !module.entities.some(e => e.id === `${p.id}_${x.kind}` && e.type === 'service'));
      if (offers.length && module.relations.some(r => r.name === 'offers')) {
        WorldConstructs.offers(module, { id: p.id, place: p.place, offers },
          kind => ItemCatalog.definitions[kind]?.name);
      }
      if (o.routine && !module.pursuits?.some(x => x.actor === p.id && x.id === `${p.id}_routine`)) {
        (module.pursuits ??= []).push({ id: `${p.id}_routine`, actor: p.id, label: o.routine, priority: 1,
          when: { kind: 'boolean', value: true }, target: ModuleWriter.call('at', p.id, p.place) });
      }
    }
  }
  // The player's company: an actor whose members are chosen at character creation.
  static company(module: Module) {
    const c = module.company;
    if (!c) { return undefined; }
    const members = Array.from({ length: c.size }, (_, i) => `${c.id}_${i + 1}`);
    if (module.relations.some(r => r.name === 'eats')) {
      module.initial.push({ kind: 'assert', call: ModuleWriter.call('eats', c.id) },
        { kind: 'set', call: ModuleWriter.call('nextMeal', c.id), value: ModuleWriter.number(72) });
    }
    return { actor: { id: c.id, members, player: true, horizon: 4, actions: ['*'], goals: [] },
      creatures: members.map(id => ({ id, context: { level: 1, population: 'pc' as const }, gold: 0 })) };
  }
  // Catalog item kinds referenced by facts exist as canonical entities without a separate declaration.
  static itemKinds(module: Module) {
    for (const c of module.initial) {
      const kind = c.kind === 'assert' && ['itemKind', 'needs'].includes(c.call.name) ? c.call.args[1] : undefined;
      if (kind && ItemCatalog.definitions[kind] && !module.entities.some(e => e.id === kind)) {
        module.entities.push({ id: kind, type: 'itemkind', name: ItemCatalog.get(kind).name });
      }
    }
  }
}
