import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A try failed is done, and not led with again for nothing (never round a loop that advances nothing), until the
// company is more than it was: the sea-gate's windlass, too stiff for a mage alone, had dropped from the four for good
// though Gesk had been hired to put his back to it, and the aim it was the step of had nothing gold (cold play 5's 10,
// CL-33).
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Relation lifted(group).
  Person carter "Hew" at yard { Role "a carter". Ancestry human. Peaceable. Pronouns he. }
  Action heave(actor: group, site: place) "Heave the cart out of the ditch" {
    Time 1 hours.
    Requires able(actor) and company(actor) and at(actor, site) and not lifted(actor).
    Resolve check(actor, brawn, dc_hard).
    On success { Assert lifted(actor). }
    Result "The cart comes up.". Otherwise "The cart will not shift.".
  }
  Action hire_hew(actor: group, site: place) "Ask Hew to lend his back" {
    Speaker carter.
    Requires able(actor) and company(actor) and at(actor, site) and at(carter, site) and not travelsWith(carter, actor).
    Time 3.
    On success { Assert travelsWith(carter, actor). }
    Result "Hew spits on his hands.".
  }
  Objective cart when not lifted(party) "The cart is in the ditch.".
  Goal false.`;
const party = [{ name: 'Aud', raceId: 'human', classId: 'mage' }];
const led = (t: Tiny) => t.glance.offer!.primary.some(o => /^t__heave\(/.test(o.command ?? o.for ?? ''));
describe('a try failed', () => {
  it('is not led with again, until someone joins to make it again', async () => {
    const t = await Tiny.start(yard, { seed: 'f5', party });
    t.follow('cart');
    expect(led(t)).toBe(true);
    await t.perform('t__heave(party,t__yard)');
    expect(t.campaign.history.at(-1)!.result).toBe('failure');
    t.follow('cart');
    expect(led(t)).toBe(false);
    await t.perform('t__hire_hew(party,t__yard)');
    t.follow('cart');
    expect(led(t)).toBe(true);
  });
});
