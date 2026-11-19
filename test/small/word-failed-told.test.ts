import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A word that fails and sets the hearers on the company is told before the fight it starts (CL-10, cold play 2's 12:
// the robbers' captain, asked and refused, "dropped straight into a fight with no line saying it failed"). Warning the
// footpads off and failing, its own words had been put over by "The footpads come at you!", and the roll unsaid.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Person sons "the footpads" at yard { Role "footpad". Ancestry human. Calling warrior. Level 1. Numbers 3. Temperament territorial. }`;
const party = [{ name: 'Aud', raceId: 'human', classId: 'mage' }];
describe('a word that fails and starts a fight', () => {
  it('is told after its roll, and before who comes at the company', async () => {
    const t = await Tiny.start(yard, { seed: 's0', party });
    await t.perform('face_down(t__sons)');
    const lines = t.leaf.exchange!.lines.map(l => l.text);
    const failed = lines.findIndex(l => l.startsWith('You face the footpads out, and it goes the wrong way.'));
    expect(failed).toBeGreaterThanOrEqual(0);
    expect(lines.findIndex(l => /fails the intimidation check/.test(l))).toBe(failed - 1);
    expect(lines[failed]).toEndWith('The footpads come at you!');
    expect(lines.findIndex(l => / hits Aud\.$| misses Aud\.$/.test(l))).toBeGreaterThan(failed);
  });
});
