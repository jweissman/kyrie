import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A rest with nothing to eat mends nothing ("you would get up no better"), so it is not led with for the hurt: a
// hungry company had been led to lie down and get up again, over and over (the laboratory's lost turns, Gate 1). With
// a ration, the rest is led with for the hurt.
const ledge = (rations: number) => `
  Place scarp "the scarp" is wilderness.
  Place foot "the foot of the climb" is room within scarp at 0, 0 outdoors.
  Place ledge "the high ledge" is room within scarp at 1, 0 outdoors.
  Passage climb "the wet climb" is path between foot and ledge.
  Initially Assert restful(foot). Initially Assert restful(ledge).
  Company party "You" of 1 at foot.
  Initially Set quantity(party, rations) to ${rations}.
  Hazard ice_fall "the ice" means "Deal (8) bludgeoning damage to party.".
  Thing ice "ice on the links" on climb {
    State icy dangerous "Ice glazes the links of the climb.".
    State broken "The ice on the links is broken where you went up.".
    Hurts with ice_fall when icy then broken.
  }
  Goal false.`;
const led = (t: Tiny) => t.glance.acts.filter(a => a.why === 'hurt').map(a => a.label);

describe('a rest, hurt', () => {
  it('is not led with for the hurt with nothing to eat, and is with a ration', async () => {
    const hungry = await Tiny.start(ledge(0)), fed = await Tiny.start(ledge(2));
    for (const t of [hungry, fed]) { await t.perform('risk(t__ice,t__member_party_1)'); }
    expect(led(hungry)).toEqual([]);
    expect(led(fed)).toEqual([expect.stringMatching(/^Rest/)]);
    expect([hungry.costs.region, hungry.costs.world]).toEqual([undefined, undefined]);
  });
});
