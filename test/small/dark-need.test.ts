import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// What is needed knows what the company can do: in the dark with a torch in the pack, "No light" beside "light the
// torch" had the player arbitrate between the two (the blind playtest, 13 November). Said as it is, and lit, not said.
const hall = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place hall "the dark hall" is room at 1, 0 indoors.
  Passage door "the hall door" is door between yard and hall.
  Initially Assert unlit(hall).
  Company party "You" of 1 at yard.
  Goal false.`;

describe('the dark, as what is needed', () => {
  it('is "Dark" while a light is to hand, and nothing once it is lit', async () => {
    const t = await Tiny.start(hall);
    await t.perform('go(t__door,t__hall)');
    expect(t.glance.need ?? []).toContain('Dark');
    expect(t.glance.need ?? []).not.toContain('No light');
    await t.perform('light_item(t__party_1__torch)');
    expect(t.glance.need ?? []).toEqual([]);
    expect([t.costs.region, t.costs.world]).toEqual([undefined, undefined]);
  });
});
