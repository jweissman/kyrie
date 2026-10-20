import { ActionSchemas } from '../src/campaign/action-schemas';
import { PlaySession } from '../src/session/play-session';
import { ItemCatalog } from '../src/item-catalog';
import { Canon } from '../src/canon/canon';
import { Spatial } from '../src/spatial';
import type { Entity, Module } from '../src/lang/module';
import type { World } from '../src/lang/world';
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
    for (const p of this.module.entities.filter(e => e.type === 'place' && e.space?.kind === 'room' && !reached.has(e.id))) {
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
