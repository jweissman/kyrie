import { ItemNames } from './item-names';
import { Canon } from './canon/canon';
import { ItemCatalog } from './item-catalog';
import type { Attribute, Creature } from './creature';
import type { Instance } from './lang/module';

export interface Overlay {
  role: 'background' | 'profession'; name: string;
  attributes: Partial<Record<Attribute, number>>; gold: number; requiredClass?: string;
  skills?: string[]; gear?: string[]; offers?: { kind: string; text: string; fee: number }[]; routine?: string;
  contact?: { channel: 'tavern' | 'temple' | 'market' | 'road'; text: string };
}
export interface Contribution { kind: 'skill' | 'gear' | 'gold' | 'attribute' | 'offer'; value: string; source: string }

// Professions and backgrounds adapted from Orsino's backgroundModifier table. An overlay contributes typed effects to
// one canonical character, each tagged with its source; it never defines a second kind of actor.
export class Overlays {
  static readonly catalog: Record<string, Overlay> = Object.fromEntries(Object.entries(Canon.backgrounds)
    .map(([id, b]) => [id, { role: b.use, name: b.name, attributes: b.attributes, gold: b.gold,
      ...b.requiredClass ? { requiredClass: b.requiredClass } : {}, ...b.skills ? { skills: b.skills } : {},
      ...b.gear ? { gear: b.gear } : {}, ...b.offers ? { offers: b.offers } : {},
      ...b.routine ? { routine: b.routine } : {}, ...b.contact ? { contact: b.contact } : {} }]));
  static has(id: string, role?: Overlay['role']): boolean {
    const o = this.catalog[id];
    return !!o && (!role || o.role === role);
  }
  static get(id: string): Overlay {
    const o = this.catalog[id];
    if (!o) { throw new Error(`Unknown overlay ${id}`); }
    return o;
  }
  static of(c: { backgroundId?: string; professionId?: string }): [string, Overlay][] {
    return [c.backgroundId, c.professionId].filter((id): id is string => !!id && this.has(id))
      .map(id => [id, this.get(id)]);
  }
  static gearId(creatureId: string, kind: string): string { return `${creatureId}__${kind}`; }
  // Orsino prices adventuring in tens of gold pieces; Kyr's local economy prices a meal at two coins.
  static readonly coinScale = 10;
  static coins(o: Overlay): number { return Math.round(o.gold / this.coinScale); }
  // Conflicts are errors: wrong role, a class requirement the character lacks, unknown gear.
  static validate(context: { classId?: string; backgroundId?: string; professionId?: string }, who: string) {
    for (const [field, role] of [['backgroundId', 'background'], ['professionId', 'profession']] as const) {
      const id = context[field];
      if (id && this.catalog[id] && this.catalog[id].role !== role) { throw new Error(`${who}: ${id} is a ${this.catalog[id].role}, not a ${role}`); }
      if (field === 'professionId' && id && !this.has(id, 'profession')) { throw new Error(`${who}: unknown profession ${id}`); }
    }
    for (const [id, o] of this.of(context)) {
      const cls = context.classId ?? '';
      if (o.requiredClass && cls !== o.requiredClass && !cls.includes(o.requiredClass)) {
        throw new Error(`${who}: the ${id} overlay requires the ${o.requiredClass} class`);
      }
      for (const kind of o.gear ?? []) { ItemCatalog.get(kind); }
    }
  }
  static apply(creature: Creature) {
    for (const [, o] of this.of(creature)) {
      for (const [k, v] of Object.entries(o.attributes)) {
        creature.base[k as Attribute] = Math.max(1, creature.base[k as Attribute] + v);
      }
      creature.state.gold += this.coins(o);
      for (const kind of o.gear ?? []) {
        const id = this.gearId(creature.id, kind);
        const inventory = creature.state.inventory ??= [];
        if (!inventory.some(i => i.id === id)) { inventory.push({ id, definition: kind }); }
      }
    }
  }
  // Equipment a person is authored to carry: one instance of each kind, equipped where its slot is free.
  static carry(creature: Creature, kinds: string[]) {
    if (!kinds.length) { return; }
    const inventory = creature.state.inventory ??= [];
    for (const kind of kinds.map(k => Canon.resolve('items', k))) {
      const slot = ItemCatalog.get(kind).slot, id = this.gearId(creature.id, kind);
      if (inventory.some(i => i.id === id)) { continue; }
      const free = slot && !inventory.some(i => i.equipped && ItemCatalog.get(i.definition).slot === slot);
      inventory.push({ id, definition: kind, ...free ? { equipped: true } : {} });
    }
  }
  // What a person of a class carries from the start besides arms and armour, as Orsino's classes do (a warrior's
  // torch and pole, a thief's tools): those the item catalog has.
  static classGear(c: { raceId?: string; classId?: string }): string[] {
    if (!c.classId || (c.raceId && Canon.isSpecies(c.raceId))) { return []; }
    const klass = Canon.classes[Canon.resolve('classes', c.classId)];
    return (klass?.startingGear ?? []).filter(k => Canon.items[k]);
  }
  // The weapons and armour a person might start with: Orsino draws them from the class's tables during creation, so
  // every candidate is declared and only the drawn ones are ever owned.
  static startingCandidates(c: { raceId?: string; classId?: string; weapon?: string; armor?: string }): string[] {
    if (c.raceId && Canon.isSpecies(c.raceId)) { return []; }
    const classes = c.classId ? [Canon.classes[Canon.resolve('classes', c.classId)]!]
      : Object.values(Canon.classes).filter(k => k.adventuring !== false);
    const tables = [...c.weapon ? [c.weapon] : classes.flatMap(k => k.weapons),
      ...c.armor ? [c.armor] : classes.flatMap(k => k.armor)];
    return [...new Set(tables.filter(k => Canon.items[k] && !Canon.items[k]!.weapon?.natural))];
  }
  static contributions(c: { backgroundId?: string; professionId?: string }): Contribution[] {
    return this.of(c).flatMap(([id, o]) => [
      ...(o.skills ?? []).map(value => ({ kind: 'skill' as const, value, source: id })),
      ...(o.gear ?? []).map(value => ({ kind: 'gear' as const, value, source: id })),
      ...(o.offers ?? []).map(value => ({ kind: 'offer' as const, value: value.kind, source: id })),
      ...Object.entries(o.attributes).map(([k, v]) => ({ kind: 'attribute' as const, value: `${k} ${v > 0 ? '+' : ''}${v}`, source: id })),
      { kind: 'gold' as const, value: String(this.coins(o)), source: id }]);
  }
  static skills(c: { backgroundId?: string; professionId?: string }): string[] {
    return this.contributions(c).filter(x => x.kind === 'skill').map(x => x.value);
  }
  // Gear exists in the world as item entities so that rules can see who holds what.
  static declareGear(instance: Instance) {
    const module = instance.module;
    for (const c of instance.campaign?.creatures ?? []) {
      const carried = (c.context.gear ?? []).map(k => Canon.resolve('items', k));
      const gear = [...this.of(c.context).map(([, o]) => o.gear ?? []), carried, this.startingCandidates(c.context),
        this.classGear(c.context)];
      for (const kinds of gear) {
        for (const kind of kinds) {
          const id = this.gearId(c.id, kind);
          if (module.entities.some(e => e.id === id)) { continue; }
          if (!module.entities.some(e => e.id === kind)) {
            module.entities.push({ id: kind, type: 'itemkind', name: ItemCatalog.get(kind).name });
          }
          module.entities.push({ id, type: 'item', name: ItemNames.called(ItemCatalog.get(kind).name) });
          module.initial.push({ kind: 'assert', call: { kind: 'call', name: 'itemKind', args: [id, kind] } });
        }
      }
    }
  }
}
