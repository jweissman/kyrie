import { ActionSchemas } from '../campaign/action-schemas';
import { PlaySession } from '../session/play-session';
import { ItemCatalog } from '../item-catalog';
import { Canon } from '../canon/canon';
import { Spatial } from '../spatial';
import { Effects } from '../effects';
import { parseAbility } from '../lang/parse';
import type { Entity, Module } from '../lang/module';
import type { World } from '../lang/world';
import type { Finding } from './kyr-lint';

// One campaign's findings, gathered by named checks over its loaded world.
export class CampaignLint {
  static readonly implementationWords = new RegExp('\\b(flags?|teleports?|persists?|persistent|generated|canonical'
    + '|the engine|remains available|does not reset|state flag)\\b', 'i');
  readonly findings: Finding[] = [];
  readonly entities: Map<string, Entity>;
  constructor(readonly path: string, readonly session: PlaySession) {
    this.entities = new Map(session.campaign.module.entities.map(e => [e.id, e]));
  }
  get module(): Module { return this.session.campaign.module; }
  get world(): World { return this.session.campaign.world; }
  add(level: Finding['level'], check: string, message: string) {
    this.findings.push({ level, check, where: this.path, message });
  }
  relations(name: string) { return this.world.snapshot.relations.filter(r => r.name === name); }
  identity() {
    for (const c of this.session.campaign.save().definition?.conflicts ?? []) { this.add('error', 'identity', c); }
  }
  // A name a module has that the shared rules have too is the module's own within it: worth knowing, not an error.
  shadows() {
    for (const s of this.session.campaign.save().definition?.shadows ?? []) { this.add('warning', 'shadow', s); }
  }
  // A hazard's effect is checked as it will be struck with: a condition that is no condition, or a damage type that
  // is none ("fyre"), is an error here, not when it strikes.
  hazards() {
    const abilities = Object.keys(Canon.abilities);
    for (const h of this.module.entities.filter(e => e.type === 'hazard' && e.effect)) {
      try { for (const e of parseAbility(h.id, h.name, h.effect!).effects) { Effects.validate(e, abilities); } }
      catch (error) { this.add('error', 'hazard', `${h.id}: ${error instanceof Error ? error.message : String(error)}`); }
    }
  }
  // A name in braces names something: an entity, or what an action is done with or a rule is about. One that names
  // nothing ("Let {winchh} run out") reaches the player as the bare word.
  placeholders() {
    for (const a of this.module.actions) {
      const bound = new Set((a.parameters ?? []).map(p => p.name));
      for (const text of [a.name, a.description, a.report, a.otherwise]) { this.named(text, a.id, bound); }
    }
    for (const o of this.module.observations ?? []) { this.named(o.text, o.id, new Set()); }
    for (const r of this.module.rules ?? []) { this.named(r.say, r.id, new Set()); }
    for (const e of this.module.entities.filter(x => x.type === 'fact')) { this.named(e.name, e.id, new Set()); }
  }
  private named(text: string | undefined, where: string, bound: Set<string>) {
    for (const [, ref] of (text ?? '').matchAll(/\{([A-Za-z_?][\w?]*)\}/g)) {
      if (!ref!.startsWith('?') && !bound.has(ref!) && !this.entities.has(ref!)) {
        this.add('error', 'placeholder', `${where}: {${ref}} names nothing`);
      }
    }
  }
  containment() {
    for (const p of this.module.entities.filter(e => e.type === 'place' && !e.space)) {
      this.add('warning', 'containment', `${p.id} has no place in the containment tree`);
    }
  }
  private needs(way: string): string {
    return this.relations('needs').filter(r => r.args[0] === way).map(r => r.args[1]).join(',');
  }
  passages() {
    const seen = new Map<string, string>();
    for (const c of this.relations('connects')) {
      const [way, a, b] = c.args as [string, string, string];
      for (const end of [a, b]) {
        if (this.entities.get(end)?.type !== 'place') { this.add('error', 'passage', `${way} ends at ${end}, which is not a place`); }
      }
      const key = [a, b].sort().join('|');
      // Two ways between the same places are alternatives only if they ask for different things (a rope, a lock).
      if (seen.has(key) && seen.get(key) !== way && this.needs(way) === this.needs(seen.get(key)!)) {
        this.add('warning', 'passage', `${way} duplicates ${seen.get(key)} between ${a} and ${b}`);
      }
      seen.set(key, way);
      this.passageKind(way, a, b);
    }
  }
  // A passage kind promises something about its ends: stairs change level, roads stay outdoors.
  passageKind(way: string, a: string, b: string) {
    const kind = this.relations('passageKind').find(r => r.args[0] === way)?.args[1] ?? '';
    if (['way_stair', 'way_ladder', 'way_shaft', 'way_incline'].includes(kind) && this.level(a) === this.level(b)) {
      this.add('warning', 'passage', `${way} is a ${kind.slice(4)} but does not change level`);
    }
    if (['way_road', 'way_path', 'way_track', 'way_ford'].includes(kind) && (this.indoors(a) || this.indoors(b))) {
      this.add('warning', 'passage', `${way} is a ${kind.slice(4)} but ends indoors`);
    }
  }
  level(id: string) { return Spatial.ancestry(this.entities, id).find(e => e.space?.kind === 'level')?.id; }
  indoors(id: string) { return this.world.test({ kind: 'call', name: 'indoors', args: [id] }); }
  traversal() {
    const legacy = ['route', 'gate', 'hazardPassage', 'climbingPassage', 'informedPassage', 'footway'];
    const count = this.world.snapshot.relations.filter(r => legacy.includes(r.name)).length;
    if (count) { this.add('warning', 'traversal', `${count} legacy directed traversal facts (migrate to Passage)`); }
  }
  geography() {
    const connects = this.relations('connects');
    if (!connects.length) { return; }
    const start = this.relations('at').find(r => r.args[0] === this.session.campaign.playerActor)?.args[1];
    const reached = new Set(start ? [start] : []);
    for (let grew = true; grew;) {
      grew = false;
      for (const [, from, to] of connects.map(c => c.args)) {
        if (reached.has(from!) && !reached.has(to!)) { reached.add(to!); grew = true; }
      }
    }
    // A room with no way in or out at all is off-stage by design: where the dead sleep, where a power's agents set out.
    const joined = new Set(connects.flatMap(c => [c.args[1]!, c.args[2]!]));
    for (const p of this.module.entities.filter(e => e.type === 'place' && e.space?.kind === 'room' && !reached.has(e.id)
      && joined.has(e.id))) {
      this.add('warning', 'geography', `${p.id} cannot be reached from where the company starts`);
    }
  }
  applicability() {
    // Campaigns ground actions on demand; lint asks once, statically, which schemas have no target at all.
    const grounded = ActionSchemas.targeted(this.module, this.session.campaign.actors);
    for (const schema of this.session.campaign.schemas.filter(x => x.id.includes('__'))) {
      if (!grounded.has(schema.id)) {
        this.add('warning', 'applicability', `action ${schema.id} has no possible target in this world`);
      }
    }
  }
  // A choice names what tells it apart from another: an action over any item of a kind (a flask of lamp oil) that
  // leaves the item out of its label offers two choices of one name once two such items are carried.
  labels() {
    for (const schema of this.session.campaign.schemas) {
      const shown = ActionSchemas.placeholders(schema.name), text = JSON.stringify(schema.requires ?? {});
      for (const p of (schema.parameters ?? []).filter(x => x.type === 'item' && !shown.includes(x.name))) {
        if (text.includes(`"name":"itemKind","args":["${p.name}"`)) {
          this.add('error', 'label', `action ${schema.id} takes any ${p.name} of a kind, but "${schema.name}" does not name it`);
        }
      }
    }
  }
  items() {
    for (const e of this.module.entities.filter(x => x.type === 'item')) {
      const kind = this.relations('itemKind').find(r => r.args[0] === e.id)?.args[1];
      if (kind && !ItemCatalog.definitions[kind]) {
        this.add('error', 'item-identity', `${e.id} is of kind ${kind}, missing from the item catalog`);
      }
    }
  }
  // Category errors in who the people are, and use of quarantined or renamed content. A species takes no calling;
  // a person of an ancestry takes a class that ancestry allows.
  domain() {
    for (const c of this.session.campaign.state.creatures) {
      const where = c.id;
      if (Canon.isSpecies(c.raceId)) {
        if (c.classId !== undefined) { this.add('error', 'category', `${where}: species ${c.raceId} cannot take the class ${c.classId}`); }
      } else if (Canon.isAncestry(c.raceId)) {
        if (!c.classId) { this.add('error', 'category', `${where}: a ${c.raceId} needs a class`); }
        else if (Canon.isSpecies(c.classId)) { this.add('error', 'category', `${where}: ${c.classId} is a species, not a class`); }
        else if (!Canon.ancestries[c.raceId]!.classes.includes(c.classId)) {
          this.add('error', 'category', `${where}: a ${c.raceId} cannot be a ${c.classId}`);
        }
      } else { this.add('error', 'category', `${where}: ${c.raceId} is neither an ancestry nor a species`); }
    }
  }
  prose() {
    const texts = new Map<string, string>([
      ...(this.module.observations ?? []).map(o => [o.id, o.text] as [string, string]),
      ...(this.module.rules ?? []).filter(r => r.say).map(r => [r.id, r.say!] as [string, string]),
      ...this.module.actions.filter(a => a.report).map(a => [a.schema ?? a.id, a.report!] as [string, string])]);
    for (const [id, text] of texts) {
      const word = CampaignLint.implementationWords.exec(text);
      if (word) { this.add('warning', 'prose', `${id} explains the implementation ("${word[0]}")`); }
    }
  }
}
