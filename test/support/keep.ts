import { DrawnWorld } from '../../src/world/drawn-world';
import { Kept } from './kept';
import { WorldAssembler } from '../../src/world/world-assembler';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { Journey } from '../../src/session/journey';
import { Placed } from './placed';

// The Silent Lord (data/situations/silent-lord) as the specs reach it: a company begun the ordinary way in a generated
// country, put down by Placed.at only to skip a walk, never to bypass a mechanism.
export class Keep {
  static readonly seed = 'kahitude';
  static id(name: string) { return `keep__${name}`; }
  // At a level, for a case whose point is past a fight the keep's under-ways hold (see silent-lord-ways' drain).
  static async start(calling = 'warrior', seed = Keep.seed, level = 1) {
    return Journey.of(await DrawnWorld.start(seed, { origin: 'debt',
      party: [{ name: 'Mira', raceId: 'human', classId: calling, ...level > 1 ? { level } : {} }] },
    NodeBundleSource.shared));
  }
  // The generated site the keep stands on, in a seed.
  static async site(seed = Keep.seed): Promise<string> {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, {});
    return w.report.placements.find(x => x.scenario === 'silent-lord')!.bindings.keep!;
  }
  static holds(j: Journey, relation: string, ...args: string[]) { return Placed.holds(j, Keep.id(relation), ...args); }
  static knows(j: Journey, fact: string) { return Placed.holds(j, 'knows', 'party', Keep.id(fact)); }
  static carries(j: Journey, name: string) {
    return j.choices().some(c => new RegExp(`^Pack › ${name}`, 'i').test(c.full));
  }
  static state(j: Journey, thing: string) { return j.campaign.world.one('state', Keep.id(thing)); }
  // The world waited up to a day and hour first (a wait in the gatehouse after dusk is a wait among the night
  // sentries), then the company put down at a place of the keep.
  static async arrive(j: Journey, place: string, wait = '=day 10 09:00') {
    await j.play(wait);
    Placed.at(j, Keep.id(place));
  }
  // Begun and come to a place of the keep: drawn and waited for once in a spec file, each case resumed from there
  // (see Kept.drawn: 90 s a case had gone on drawing a1 and waiting nine days).
  static async at(place: string, o: { calling?: string; wait?: string; seed?: string } = {}): Promise<Journey> {
    const kept = await Kept.drawn(o.seed ?? Keep.seed, { origin: 'debt',
      party: [{ name: 'Mira', raceId: 'human', classId: o.calling ?? 'warrior' }] });
    const j = await kept.play(o.wait ?? '=day 10 09:00');
    Placed.at(j, Keep.id(place));
    return j;
  }
}
