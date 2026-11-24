import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A try at the aim's step that did not come off is still the aim's step: led, gold, after a wait as at once (OR-241:
// the first blind cold play of the page failed at the sea-gate's windlass, the words said "or a fresh try", and after
// an hour's wait the try was only under Look, though it was the aim's step and its odds had risen with the hire). Each
// try is its own draw (RandomStreams.command), and each takes its hour. A try that is no aim's step, failed, is done,
// and not led with again for nothing, until the company is more than it was (cold play 5's 10, CL-33: Gesk hired).
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
const heaving = (command?: string) => /^t__heave\(/.test(command ?? '');
const heave = (t: Tiny) => t.glance.offer!.primary.find(o => heaving(o.command ?? o.for));
const led = (t: Tiny) => !!heave(t);
const gold = (t: Tiny) => t.gold.some(a => a.continues && heaving(a.command ?? a.for));
describe('a try failed', () => {
  it('at the aim\'s step, stays led and gold, at once and after a wait', async () => {
    const t = await Tiny.start(yard, { seed: 'f5', party });
    t.follow('cart');
    expect([led(t), gold(t)]).toEqual([true, true]);
    await t.perform('t__heave(party,t__yard)');
    expect(t.campaign.history.at(-1)!.result).toBe('failure');
    t.follow('cart');
    expect([led(t), gold(t)]).toEqual([true, true]);
    await t.perform('wait_hour');
    t.follow('cart');
    expect([led(t), gold(t)]).toEqual([true, true]);
    const c = t.glance.continuance;
    expect(c?.kind === 'step' && c.witness).toBe(heave(t)!.choice);
  });
  // One fresh try, not every hour after (test/porthalen-hall: the gold-follower levered the lettered flag four hours
  // over, "It was not made to be lifted", and never looked for the ring that opens it): failed twice as the company
  // stands, the step is done until the company is more than it was, and then a fresh try is the step again.
  it('at the aim\'s step, is led for one fresh try, and again once someone joins', async () => {
    const t = await Tiny.start(yard, { seed: 'f5', party });
    for (const n of [1, 2]) {
      await t.perform('t__heave(party,t__yard)');
      expect([n, t.campaign.history.at(-1)!.result]).toEqual([n, 'failure']);
    }
    t.follow('cart');
    expect([led(t), gold(t)]).toEqual([false, false]);
    await t.perform('t__hire_hew(party,t__yard)');
    t.follow('cart');
    expect([led(t), gold(t)]).toEqual([true, true]);
  });
  it('at no aim\'s step, is not led with again, until someone joins to make it again', async () => {
    const t = await Tiny.start(yard, { seed: 'f5', party });
    expect(led(t)).toBe(true);
    await t.perform('t__heave(party,t__yard)');
    expect(t.campaign.history.at(-1)!.result).toBe('failure');
    t.look();
    expect(led(t)).toBe(false);
    await t.perform('t__hire_hew(party,t__yard)');
    t.look();
    expect(led(t)).toBe(true);
  });
});
