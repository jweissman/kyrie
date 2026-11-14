import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A fight is told in the world's words: a foe's hit points are never told, only the company's own ("A grey wolf takes 6
// slashing damage (0 HP left)" had been told as it fell, every creature drawn as of the company: the owner, 7
// November), and no engine's words ("(roll 10)": NP-07). Two wolves in a den, fought until it ends, over a few seeds.
const den = `
  Place den "the den" is room at 0, 0 outdoors.
  Company party "You" of 1 at den.
  Person wolf "a grey wolf" at den { Role "a wolf that lairs here". Species wolf. Numbers 2. }
  Goal false.`;

describe('a fight, as it is told', () => {
  it('never tells a foe\'s hit points, nor the dice', async () => {
    const said: string[] = [];
    for (const seed of ['a', 'b', 'c', 'd']) {
      const t = await Tiny.start(den, { seed });
      await t.perform(t.journey.choices().find(c => /^attack\(/.test(c.command))!.command);
      said.push(...(t.leaf.exchange?.lines ?? []).map(l => l.text));
    }
    expect(said.some(l => /wolf.* takes \d+/.test(l))).toBe(true);
    expect(said.filter(l => /wolf.* takes \d+ .*\(\d+ HP/.test(l))).toEqual([]);
    expect(said.filter(l => /\(roll \d+|against \d+\)|rolled \d+, needed \d+|^Initiative:/.test(l))).toEqual([]);
  });
});
