import { DrawnWorld } from '../../src/world/drawn-world';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { Journey } from '../../src/session/journey';
import { Placed } from './placed';
import { WorldAssembler } from '../../src/world/world-assembler';
import { ModuleWriter } from '../../src/lang/module-writer';

// What the Bound Howe's specs share: the ids of the module, the companies, where the howe stands in the reference
// country (read from the world, never written), and the Howe class that plays and reads it by the page's labels.
export const R = (id: string) => `howe__${id}`;
export const company = (...calls: string[]) =>
  calls.map((classId, i) => ({ name: `Mira${i}`, raceId: 'human', classId, level: 4 }));
// Where the howe stands in the reference country (kahitude) is read from the world, never written here: the
// settlements and sites scenarios take are numbered in the order they are placed, so a scenario added before this one
// moves them. The town is the one nearest the howe (its clerk, shrine and taproom); the first town tells of it too.
export const PLACED = (await WorldAssembler.assemble('kahitude', NodeBundleSource.shared, {})).report.placements
  .find(x => x.scenario === 'bound-howe')!.bindings;
export const SITE = `region__${PLACED.howe}`;
export const TOWN = (part: string) => `region__${PLACED.town}_${part}`;
export const FOUR = company('warrior', 'cleric', 'thief', 'mage');
export const levelled = (level: number, ...calls: string[]) =>
  company(...calls).map(m => ({ ...m, level }));
// Countries by what they drew (the draw moves with the template; read the world if in doubt): b2 and d4 left the howe
// broken; kahitude, a1, thorn and c3 sealed it from within.

export class Howe {
  static async start(party = FOUR, seed = 'kahitude') {
    const drawn = party.length > 1 ? { party } : { origin: 'debt', party };
    return Journey.of(await DrawnWorld.start(seed, drawn, NodeBundleSource.shared));
  }
  static async at(place: string, party = FOUR, seed = 'kahitude') {
    const j = await this.start(party, seed);
    Placed.at(j, R(place));
    return j;
  }
  static holds(j: Journey, relation: string, ...args: string[]) { return Placed.holds(j, relation, ...args); }
  static fact(j: Journey, relation: string, ...args: string[]) { return Placed.holds(j, R(relation), ...args); }
  static state(j: Journey, thing: string, value: string) { return Placed.holds(j, 'state', R(thing), R(value)); }
  static where(j: Journey, who: string) { return j.campaign.world.one('at', R(who)); }
  static party(j: Journey) { return j.campaign.fighters; }
  static hp(j: Journey) { return Howe.party(j).reduce((n, f) => n + Math.max(0, f.hp), 0); }
  static downed(j: Journey) { return Howe.party(j).filter(f => f.hp <= 0).length; }
  static retract(j: Journey, relation: string, ...args: string[]) {
    const held = j.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(x: unknown): void };
    held.commit(held.world.apply([{ kind: 'retract', call: ModuleWriter.call(relation, ...args) }]));
  }
  static async town(seed: string) {
    const p = (await WorldAssembler.assemble(seed, NodeBundleSource.shared, {})).report.placements.find(x => x.scenario === 'bound-howe')!.bindings;
    return (part: string) => `region__${p.town}_${part}`;
  }
  static num(j: Journey, measure: string, who: string) {
    return j.campaign.world.number(ModuleWriter.call(R(measure), R(who)));
  }
  static set(j: Journey, measure: string, who: string, n: number) {
    const held = j.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(x: unknown): void };
    held.commit(held.world.apply([{ kind: 'set', call: ModuleWriter.call(R(measure), R(who)), value: ModuleWriter.number(n) }]));
  }
  static face(j: Journey) { return ['sound', 'thin', 'shored', 'broken', 'buried'].find(v => Howe.state(j, 'face_wall', v)); }
  static async day(j: Journey, d: number, at = '09:00') { await j.play(`=day ${d} ${at}`); }
  static async torch(j: Journey) { await j.play('Pack › A torch › Light'); }
  // Buying from the camp's surgeon, who sells what a company going under a hill wants.
  static async buy(j: Journey, what: string) { await j.play(`Buy › ${what}`); }
}

