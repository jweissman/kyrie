import { Placed } from './placed';
import { ModuleWriter } from '../../src/lang/module-writer';
import type { Journey } from '../../src/session/journey';

// What every Bound Howe spec shares, drawn country or alone: the module's ids, the companies, and how a spec reads and
// sets the howe's facts by the page's labels. Imports nothing that draws a world (support/howe draws kahitude on load
// to find where the howe stands; support/howe-alone needs none of that).
export const R = (id: string) => `howe__${id}`;
export const company = (...calls: string[]) =>
  calls.map((classId, i) => ({ name: `Mira${i}`, raceId: 'human', classId, level: 4 }));
export const FOUR = company('warrior', 'cleric', 'thief', 'mage');
export const levelled = (level: number, ...calls: string[]) =>
  company(...calls).map(m => ({ ...m, level }));

export class HoweReading {
  static holds(j: Journey, relation: string, ...args: string[]) { return Placed.holds(j, relation, ...args); }
  static fact(j: Journey, relation: string, ...args: string[]) { return Placed.holds(j, R(relation), ...args); }
  static state(j: Journey, thing: string, value: string) { return Placed.holds(j, 'state', R(thing), R(value)); }
  static where(j: Journey, who: string) { return j.campaign.world.one('at', R(who)); }
  static party(j: Journey) { return j.campaign.fighters; }
  static hp(j: Journey) { return HoweReading.party(j).reduce((n, f) => n + Math.max(0, f.hp), 0); }
  static downed(j: Journey) { return HoweReading.party(j).filter(f => f.hp <= 0).length; }
  static retract(j: Journey, relation: string, ...args: string[]) {
    const held = j.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(x: unknown): void };
    held.commit(held.world.apply([{ kind: 'retract', call: ModuleWriter.call(relation, ...args) }]));
  }
  static num(j: Journey, measure: string, who: string) {
    return j.campaign.world.number(ModuleWriter.call(R(measure), R(who)));
  }
  static set(j: Journey, measure: string, who: string, n: number) {
    const held = j.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(x: unknown): void };
    held.commit(held.world.apply([{ kind: 'set', call: ModuleWriter.call(R(measure), R(who)), value: ModuleWriter.number(n) }]));
  }
  static face(j: Journey) { return ['sound', 'thin', 'shored', 'broken', 'buried'].find(v => HoweReading.state(j, 'face_wall', v)); }
  static async day(j: Journey, d: number, at = '09:00') { await j.play(`=day ${d} ${at}`); }
  static async torch(j: Journey) { await j.play('Pack › A torch › Light'); }
  // Buying from the camp's surgeon, who sells what a company going under a hill wants.
  static async buy(j: Journey, what: string) { await j.play(`Buy › ${what}`); }
}
