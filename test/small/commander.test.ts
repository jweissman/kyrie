import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ScreenModel } from '../../src/ui/screen-model';

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
    // An order is the player's to give, never what the page leads with (it had been led as the aim's next step).
    expect((t.leaf.glance?.acts ?? []).some(a => /stay here|come on again/.test(a.label))).toBe(false);
    await t.play('To the lane');
    expect(t.journey.choices().some(c => /Ask (Hob|him|them) to stay here/.test(c.full))).toBe(true);
    // The order is on the retainer's own sheet, as an act of the engine's (the owner, 16 November).
    const sheet = ScreenModel.build(t.campaign).party.flatMap(m => m.acts).map(a => a.command ?? '');
    expect(sheet.some(c => /^hold_here\(/.test(c))).toBe(true);
    await t.play('Ask (Hob|him|them) to stay here');
    // Left where they waited, they are someone there, and the order to come on is offered on them where they stand.
    const there = ScreenModel.build(t.campaign).people.find(p => p.id === 't__hob');
    expect((there?.acts ?? []).some(a => /^call_on\(/.test(a.command ?? ''))).toBe(true);
    // Told to wait, they are no longer the company's, and are where it left them.
    expect([members(t), t.journey.at('t__hob')]).toEqual([1, 't__lane']);
    await t.play('To the yard');
    // Away from where they wait, no order reaches them: it is not offered, and they do not rejoin from afar.
    expect(t.journey.choices().some(c => /^call_on\(/.test(c.command))).toBe(false);
    await t.play('To the lane');
    expect(t.journey.at('t__hob')).toBe('t__lane');
    await t.play('Ask (Hob|him|them) to come on again');
    expect(members(t)).toBe(joined);
    await t.play('To the yard');
    expect(members(t)).toBe(joined);
  });
});
