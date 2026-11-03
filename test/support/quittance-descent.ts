import { Journey } from '../../src/session/journey';
import { ModuleWriter } from '../../src/lang/module-writer';
import { City, Q } from './quittance';

// The Descent's helpers (test/quittance-descent*.test.ts): the company set down where a scene begins, facts written
// into the world, and the Fire spoken to.
export type Cls = 'warrior' | 'mage' | 'thief' | 'cleric' | 'bard' | 'ranger' | 'monk';
const ENGINE = ['at', 'quantity', 'following', 'travelsWith', 'tolerates', 'assails', 'knows'];
const nm = (n: string) => (ENGINE.includes(n) ? n : Q(n));
const arg = (a: string) => (['party', 'gold', 'coal', 'rations'].includes(a) ? a : Q(a));
export class Ds {
  static async start(classes?: Cls[], level = 4, seed = 'quittance') {
    const party = classes?.map((classId, i) => ({ name: `P${i}`, raceId: 'human', classId, level }));
    return Journey.start('data/campaigns/quittance.campaign.json', seed, party ? { party } : {});
  }
  private static c(j: Journey): any { return j.session.campaign; }
  static put(j: Journey, kind: 'assert' | 'retract', name: string, ...args: string[]) {
    const c = Ds.c(j);
    c.commitWorld(c.world.apply([{ kind, call: ModuleWriter.call(nm(name), ...args.map(arg)) }]));
  }
  static num(j: Journey, name: string, args: string[], value: number) {
    const c = Ds.c(j);
    c.commitWorld(c.world.apply([{ kind: 'set', call: ModuleWriter.call(nm(name), ...args.map(arg)), value: ModuleWriter.number(value) }]));
  }
  static at(j: Journey, place: string) { Ds.put(j, 'assert', 'at', 'party', place); }
  static heat(j: Journey) { return j.measure(Q('ds_heat'), 'party'); }
  static accord(j: Journey) { return j.measure(Q('ds_accord'), 'party'); }
  static slight(j: Journey) { return j.measure(Q('ds_slight'), 'party'); }
  static mood(j: Journey, s: string) { return City.state(j, 'ds_mood', s); }
  static rel(j: Journey, r: string, ...a: string[]) { return City.has(j, r, 'party', ...a); }
  static gold(j: Journey) { return j.measure('quantity', 'party', 'gold'); }
  static knows(j: Journey, d: string) { return City.knows(j, d); }
  // To the Fire, spoken to.
  static async speak(j: Journey) { await j.play('^the Fire.*: Talk to the Fire', '^the Fire.*: Tell the Fire that you have come'); }
  // The Fire's own answer to a thing offered: who is told, what happens.
  static async ask(j: Journey, label: string) { return j.step(`^the Fire.*: ${label}`); }
  // Set down before the Fire, below the hearth.
  static async toFire(classes?: Cls[], level = 4) {
    const j = await Ds.start(classes, level);
    Ds.at(j, 'hearth_below');
    return j;
  }
}
