import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A kind with Hit Dice is met with their listed average however a world asks for it (the SRD adaptation briefing,
// §1: a fixture makes the monster through every path and its hit points do not change with encounter rank). The
// unicorn is 4d10+20, forty-two: written into a module at the fifth level, and fought, it is forty-two in the world and
// in the fight. (The ghoul was the example until its SRD stat block was withdrawn, 13 November: see srd-invariants.md.)
const glade = `
  Place glade "the glade" is room at 0, 0 outdoors.
  Company party "You" of 1 at glade.
  Person u "a unicorn" at glade { Role "a white beast with a single horn". Species unicorn. Level 5. }
  Goal false.`;

describe('a unicorn met in a glade', () => {
  it('has its forty-two hit points in the world and in the fight', async () => {
    // A third-level warrior seldom gets past a unicorn's guard: over a few fights, the first blow that lands.
    let first: { hp: number; amount: number } | undefined;
    for (let n = 0; n < 12 && !first; n++) {
      const t = await Tiny.start(glade, { seed: `g${n}`,
        party: [{ name: 'Hild', raceId: 'human', classId: 'warrior', level: 3 }] });
      expect(t.campaign.readout.creatures.find(c => c.raceId === 'unicorn')!.base.maxHp).toBe(42);
      const leg = await t.session.leg(t.journey.choices().find(c => /^attack\(/.test(c.command))!.command);
      const blow = leg.combat.find(e => e.type === 'damage' && e.target === 't__u_person');
      if (blow?.type === 'damage') { first = blow; }
    }
    // The first blow it took fell on the forty-two it had.
    expect(first && first.hp + first.amount).toBe(42);
  });
});
