import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// The Commander (the owner, 15 and 16 November: a player verb as a pin; "the simplest version of commanding: stay or
// follow"): recruit someone, order them to stay, leave, come back to find them where they were told to wait, and call
// them on again, keeping what came of it. The one order there is (people.kyr: hold_here, call_on) acts on whoever has
// joined.
const country = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place lane "the lane" is room at 1, 0 outdoors.
  Passage gate "the gate" is path between yard and lane.
  Company party "You" of 1 at yard.
  Person hob "Hob" at yard { Role "a hired hand". Ancestry human. Calling warrior. Peaceable. Pronouns he. }
  Initially Assert willing(hob, party). Initially Set hire(hob) to 0.`;
const members = (t: Tiny) => t.world.related('memberOf').filter(r => r.args[1] === 'party').length;

describe('a commander', () => {
  it('orders a hired hand to stay, finds them where they waited, and calls them on again', async () => {
    const t = await Tiny.start(country);
    await t.play('Ask (Hob|him) to join the company');
    const joined = members(t);
    expect(joined).toBe(2);
    await t.play('To the lane');
    expect(t.journey.choices().some(c => /Ask (Hob|him) to stay here/.test(c.full))).toBe(true);
    await t.play('Ask (Hob|him) to stay here');
    // Told to wait, they are no longer the company's, and are where it left them.
    expect([members(t), t.journey.at('t__hob')]).toEqual([1, 't__lane']);
    await t.play('To the yard', 'To the lane');
    expect(t.journey.at('t__hob')).toBe('t__lane');
    await t.play('Ask (Hob|him) to come on again');
    expect(members(t)).toBe(joined);
    await t.play('To the yard');
    expect(members(t)).toBe(joined);
  });
});
