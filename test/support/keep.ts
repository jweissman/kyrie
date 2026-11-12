import { DrawnWorld } from '../../src/world/drawn-world';
import { WorldAssembler } from '../../src/world/world-assembler';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { Journey } from '../../src/session/journey';
import { Placed } from './placed';

// The Silent Lord (data/situations/silent-lord) as the specs reach it: a company begun the ordinary way in a generated
// country, put down by Placed.at only to skip a walk, never to bypass a mechanism.
export class Keep {
  static readonly seed = 'kahitude';
  static id(name: string) { return `keep__${name}`; }
  static async start(calling = 'warrior', seed = Keep.seed) {
    return Journey.of(await DrawnWorld.start(seed, { origin: 'debt',
      party: [{ name: 'Mira', raceId: 'human', classId: calling }] }, NodeBundleSource.shared));
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
}
