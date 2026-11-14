import { expect } from 'bun:test';
import { Alone } from './alone';
import { Placed } from './placed';
import type { Journey } from '../../src/session/journey';

// The Silent Lord (data/situations/silent-lord) as a targeted scenario: the situation's own module on the shared
// rules, its imports bound to a host of a few lines instead of a generated country (see Alone): under half a second
// a start where a drawn country took minutes. For the situation's own rules; what needs the generated site itself (the
// gate on its ground, a walk across the country) stays with Keep (support/keep.ts). The host's green is the first
// town's, where the levy is cried (`gossip`); its taproom, shrine and Farham's green are the imports of those names.
const host = `
  Place land "the downs" is wilderness at 0, 0.
  Place outside "below the keep" is room within land at 0, 0 outdoors.
  Place town "Hythe" is settlement.
  Place green "the green" is room within town at 0, 0 outdoors.
  Place taproom "the taproom" is room within town at 1, 0.
  Place shrine "the shrine" is room within town at 0, 1.
  Place far "Farham" is settlement.
  Place far_green "the green at Farham" is room within far at 0, 0 outdoors.
  Person keeper "Mag" at taproom { Role "who keeps the inn". Ancestry human. Peaceable. Pronouns she. }
  Person priest "Father Odo" at shrine { Role "the priest". Ancestry human. Peaceable. Pronouns he. }
  Person trader "Wat" at green { Role "a merchant". Ancestry human. Peaceable. Pronouns he. }
  Company party "You" of 1 at green.`;
const roles = ['land', 'outside', 'taproom', 'shrine', 'keeper', 'priest', 'trader', 'far_green'];
export class KeepAlone {
  static id(name: string) { return `keep__${name}`; }
  // Begun alone and waited to a day and hour, then put down at a place of the keep (only to skip a walk).
  static async at(place: string, calling = 'warrior', wait = '=day 10 09:00'): Promise<Journey> {
    const a = await Alone.start({ id: 'keep', bundle: '../../data/situations/silent-lord/module.json', host,
      exports: [...roles, 'green'], imports: { ...Object.fromEntries(roles.map(r => [r, r])), gossip: 'green' },
      party: [{ name: 'Mira', raceId: 'human', classId: calling }] });
    // Nothing of the country was drawn for it: the cost of the start is the situation's own.
    expect([a.costs.region, a.costs.world]).toEqual([undefined, undefined]);
    if (wait) { await a.journey.play(wait); }
    if (place) { Placed.at(a.journey, KeepAlone.id(place)); }
    return a.journey;
  }
  static holds(j: Journey, relation: string, ...args: string[]) {
    return Placed.holds(j, KeepAlone.id(relation), ...args);
  }
  static knows(j: Journey, fact: string) { return Placed.holds(j, 'knows', 'party', KeepAlone.id(fact)); }
  static state(j: Journey, thing: string) { return j.campaign.world.one('state', KeepAlone.id(thing)); }
  static carries(j: Journey, name: string) {
    return j.choices().some(c => new RegExp(`^Pack › ${name}`, 'i').test(c.full));
  }
}
