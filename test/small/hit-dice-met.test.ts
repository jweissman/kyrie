import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A kind with Hit Dice is met with their listed average however a world asks for it (the SRD adaptation briefing,
// §1: a fixture makes the monster through every path and its hit points do not change with encounter rank). The
// ghoul is 2d12, thirteen: written into a module at the fifth level, and fought, it is thirteen in the world and in
// the fight; a ghoul grown by Orsino's template at that level had been twenty-five.
const barrow = `
  Place mound "the mound" is room at 0, 0 outdoors.
  Place barrow "the barrow" is room at 1, 0 underground.
  Passage door "the stone door" is path between mound and barrow.
  Company party "You" of 1 at mound.
  Person g "a ghoul" at barrow { Role "a ghoul crouched over bones". Species ghoul. Level 5. }
  Goal false.`;

describe('a ghoul met in a barrow', () => {
  it('has its thirteen hit points in the world and in the fight', async () => {
    const t = await Tiny.start(barrow, { party: [{ name: 'Hild', raceId: 'human', classId: 'warrior', level: 3 }] });
    // A ghoul falls on whoever comes in (its kind's temper): the fight is the going in.
    const leg = await t.session.leg('go(t__door,t__barrow)');
    expect(t.campaign.readout.creatures.find(c => c.raceId === 'ghoul')!.base.maxHp).toBe(13);
    const fought = leg.combat.filter(e => e.type === 'damage' && e.target === 't__g_person');
    expect(fought.length).toBeGreaterThan(0);
    // The first blow it took fell on the thirteen it had.
    const first = fought[0]!;
    if (first.type === 'damage') { expect(first.hp + first.amount).toBe(13); }
  });
});
