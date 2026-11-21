import type { Journey } from '../../src/session/journey';
import { Placed } from './placed';
import { SituationAlone } from './situation-alone';

// The Collegium of the Measured Road (data/situations/arcology/rivals.kyr) as its specs reach it: the situation alone
// (SituationAlone), the company put down below the works as on arriving at the Bend, where the expedition's clock
// starts; and how a spec reads the rivals' facts by their short names.
export class Rivals {
  static a(x: string) { return x === 'party' || x.includes('__') ? x : `arcology__${x}`; }
  static is(j: Journey, rel: string, ...args: string[]) { return j.holds(rel, ...args.map(x => this.a(x))); }
  static n(j: Journey, rel: string, ...args: string[]) { return j.measure(rel, ...args.map(x => this.a(x))); }
  static async start(cls = 'warrior') {
    return (await SituationAlone.start('arcology', 'arcology', { party: [{ name: 'Mira', raceId: 'human', classId: cls }] }))
      .journey;
  }
  // The company at the Bend, as it would be on arriving: the expedition's clock starts there.
  static async bend(cls = 'warrior') {
    const j = await this.start(cls);
    Placed.at(j, 'host__outside');
    await j.play('=day 3 06:00', 'Wait a while');
    return j;
  }
  static async stage(j: Journey, n: number) {
    while (this.n(j, 'rivalStage', 'house') < n) { await j.play('=+60'); }
  }
  static at(j: Journey, who: string) { return j.at(this.a(who)); }
  // What the company carries, from its things (not the pack's offered acts: while a crew warns it off, the pack offers
  // only a light or a weapon readied, OR-163).
  static carries(j: Journey, name: string) { return j.screen().items.some(i => new RegExp(`^${name}`, 'i').test(i.name)); }
}
