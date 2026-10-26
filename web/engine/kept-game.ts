import type { SessionCheckpoint } from '../../src/session/play-session';
import type { CampaignSave } from '../../src/campaign/campaign-types';
import type { Call, WorldState } from '../../src/lang/module';
import type { Entry } from './protocol';
import type { World } from '../../src/lang/world';
import { BuildStamp } from '../../src/session/build-stamp';

// A game as the browser keeps it. What the company has done and where it stands changes with every command and is
// kept after each; the world it does it in (the compiled module, the campaign's definition, and every fact as it stood
// when that world was first kept) changes only when the country grows (a march crossed, a country beyond drawn), and
// is kept once, under a key made from its contents. The state names the world it belongs to, and holds only what
// differs from it. A save file taken elsewhere is still the whole game in one.
export interface WorldPart { module: CampaignSave['module']; definition?: CampaignSave['definition']; base?: Call[] }
// What differs from the facts a world was kept with, in the order the world holds them: the kept facts the world still
// holds untouched stay where they were; every fact asserted since follows, in the order it was asserted. So a world
// put back together holds its facts in exactly the order it did (an order rules can see).
export interface Facts { removed: number[]; tail: Call[]; measures: WorldState['measures'] }
type State = CampaignSave['state'];
export interface KeptState {
  version: 2; world: string; log?: Entry[];
  // The build that kept it (BuildStamp): a game kept by another build is checked as it is opened, not trusted.
  build?: string;
  checkpoint: Omit<SessionCheckpoint, 'save'> & {
    save: Omit<CampaignSave, 'module' | 'definition' | 'state'> & { state: Omit<State, 'world'>; facts: Facts } };
}
export interface Whole { checkpoint: SessionCheckpoint; log?: Entry[] }
// A world as the host holds it while it plays: its part, its key, where each of its facts stood, and how each relation
// last differed from it (see `differLive`).
export interface Keyed { key: string; part: WorldPart; index: Map<string, number>; relations?: Relations }
interface Relation { list: readonly Call[]; removed: number[]; tail: Call[] }
interface Relations { positions: Map<string, number[]>; by: Map<string, Relation> }

export class KeptGame {
  static keyed(checkpoint: SessionCheckpoint): Keyed & { text: string } {
    const save = checkpoint.save, base = save.state.world.relations;
    const part: WorldPart = { module: save.module, ...save.definition ? { definition: save.definition } : {}, base };
    const text = JSON.stringify(part);
    return { key: this.key(text), part, index: this.index(base), text };
  }
  static index(base: Call[]): Map<string, number> { return new Map(base.map((c, i) => [this.fact(c), i])); }
  // A checkpoint as kept: its state, with the world's key, and its facts as they differ from the world's.
  // Given the world the checkpoint was taken of (live), its facts are read from it relation by relation.
  static split(checkpoint: SessionCheckpoint, world: Keyed, log: Entry[], live?: World): KeptState {
    const save = checkpoint.save, { world: facts, ...state } = save.state;
    return { version: 2, world: world.key, build: BuildStamp.current, log, checkpoint: { ...checkpoint, save: {
      version: save.version,
      ...save.actionFormat ? { actionFormat: save.actionFormat } : {}, state, creatures: save.creatures,
      events: save.events, encounter: save.encounter, observations: save.observations,
      facts: live ? this.differLive(live, facts.measures, world) : this.differ(facts, world) } } };
  }
  // The same, from the world itself. A relation it still shares with the last world kept (the same list of facts: a
  // world shares a relation with the world it was forked from until it writes it) differs as it did then, so only
  // the relations written since are gone through, not every fact (Mission 15: 63 ms a command in a country of
  // several regions).
  private static differLive(live: World, measures: WorldState['measures'], world: Keyed): Facts {
    const kept = world.relations ??= { positions: this.positions(world.part.base ?? []), by: new Map() };
    const removed: number[] = [], tail: Call[] = [], held = new Set<string>();
    for (const name of live.relationNames()) {
      const list = live.related(name);
      let relation = kept.by.get(name);
      if (relation?.list !== list) {
        relation = this.relation(list, world.index, kept.positions.get(name) ?? []); kept.by.set(name, relation);
      }
      held.add(name); removed.push(...relation.removed); tail.push(...relation.tail);
    }
    for (const [name, positions] of kept.positions) { if (!held.has(name)) { removed.push(...positions); } }
    return { removed: removed.sort((a, b) => a - b), tail, measures };
  }
  // Where each relation's facts stood among the world's.
  private static positions(base: Call[]): Map<string, number[]> {
    const positions = new Map<string, number[]>();
    base.forEach((c, n) => {
      const those = positions.get(c.name);
      if (those) { those.push(n); } else { positions.set(c.name, [n]); }
    });
    return positions;
  }
  // One relation's facts as they differ from the world's (see `differ`).
  private static relation(list: readonly Call[], index: Map<string, number>, positions: number[]): Relation {
    const kept = new Set<number>(), tail: Call[] = [];
    let last = -1, broken = false;
    for (const r of list) {
      const at = broken ? undefined : index.get(this.fact(r));
      if (at !== undefined && at > last) { kept.add(at); last = at; continue; }
      broken = true; tail.push(r);
    }
    return { list, removed: positions.filter(n => !kept.has(n)), tail };
  }
  // How a state's facts differ from its world's, relation by relation: the world's facts of a relation it still holds,
  // in the world's order, are kept by place; from the first fact of that relation that is new or out of that order,
  // the rest of the relation's facts are the tail. Put back together, each relation's facts come in the order they
  // were held, which is the order the world's rules read them in. (By relation, not over all facts at once: a world
  // lists its facts relation by relation, so a new fact stands among the others of its relation, not at the end.)
  private static differ(facts: WorldState, world: Keyed): Facts {
    const kept = new Set<number>(), tail: Call[] = [], last = new Map<string, number>(), broken = new Set<string>();
    for (const r of facts.relations) {
      const at = broken.has(r.name) ? undefined : world.index.get(this.fact(r));
      if (at !== undefined && at > (last.get(r.name) ?? -1)) { kept.add(at); last.set(r.name, at); continue; }
      broken.add(r.name); tail.push(r);
    }
    const removed: number[] = [];
    for (let n = 0; n < (world.part.base?.length ?? 0); n++) { if (!kept.has(n)) { removed.push(n); } }
    return { removed, tail, measures: facts.measures };
  }
  // A kept state and its world, put back together; or a save that was whole already.
  static join(parsed: KeptState | Whole | SessionCheckpoint, world?: WorldPart): Whole {
    if ('version' in parsed && parsed.version === 2) {
      if (!world) { throw new Error('The world this game was played in is no longer kept in this browser.'); }
      const { facts, state, ...rest } = parsed.checkpoint.save, gone = new Set(facts.removed);
      const relations = [...(world.base ?? []).filter((_, n) => !gone.has(n)), ...facts.tail];
      const save = { ...rest, state: { ...state, world: { relations, measures: facts.measures } },
        module: world.module, ...world.definition ? { definition: world.definition } : {} } as CampaignSave;
      return { checkpoint: { ...parsed.checkpoint, save }, ...parsed.log ? { log: parsed.log } : {} };
    }
    return 'checkpoint' in parsed ? parsed : { checkpoint: parsed as SessionCheckpoint };
  }
  private static fact(c: Call): string { return `${c.name}(${c.args.join(',')})`; }
  // A key for a world's text: FNV-1a, twice over with different primes, so that two worlds are not taken for one.
  static key(text: string): string {
    let a = 0x811c9dc5, b = 0x01000193 ^ text.length;
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      a = Math.imul(a ^ c, 0x01000193) >>> 0;
      b = Math.imul(b ^ c, 0x5bd1e995) >>> 0;
    }
    return `${a.toString(36)}${b.toString(36)}`;
  }
}
