import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A fight just won is told once: what happened in it, not again as the fallen lying dead above that telling ("The rats
// under the corn-store lie dead." had stood before "Wynn hits the first rat", and the leader at Tenebraetumulo was told
// dead before he came at the company: M21's playability list, PL-04; the owner, 11 November, the rats' end told three
// ways). Coming back later, the fallen still lie where they fell. One den and a wolf in it.
const den = `
  Place fell "the fellside" is room at 0, 0 outdoors.
  Place lair "the den" is room at 1, 0 outdoors.
  Passage mouth "the den mouth" is path between fell and lair.
  Company party "You" of 1 at lair.
  Person wolf "a grey wolf" at lair { Role "a wolf that lairs here". Species wolf. }
  Goal false.`;

describe('the telling of a fight just won', () => {
  it('tells the fall in the fight, not again as lying dead; the next page says where it lies', async () => {
    const t = await Tiny.start(den);
    await t.perform(t.journey.choices().find(c => /^attack\(/.test(c.command))!.command);
    expect(t.leaf.exchange?.lines.map(l => l.text).join(' ')).toMatch(/falls/);
    expect(t.leaf.presence.join(' ')).not.toMatch(/lies dead/);
    await t.play('To the fellside', 'To the den');
    expect(t.leaf.presence.join(' ')).toMatch(/grey wolf lies dead/i);
  });
});
