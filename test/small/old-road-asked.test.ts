import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

// A question is asked by the matter it answers (cold play 5, CL-36's 27): at the Hall, where the matter was the
// road-wood's chain across the old road, "Ask the steward about the old road" answered of a stage-house on the paved
// road out in the country, and read as an answer about another road.
const text = readFileSync('data/generation/town/outskirts-deep.kyrt', 'utf8');
const topic = (id: string) => new RegExp(`Topic \\{t\\}_${id} with [^"]+"([^"]+)"`).exec(text)?.[1];
describe('the steward asked of the old road', () => {
  it('is asked where the paved road goes, as the stage-house answers', () => {
    expect(topic('manor_steward_road')).toBe('Ask {{t}_manor_steward} where the old paved road goes');
    expect(text).toContain("'The old paved road?' says {{t}_manor_steward}. 'There is a stage-house on it");
  });
});
