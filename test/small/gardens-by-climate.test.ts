import { describe, expect, it } from 'bun:test';
import { RegionGrowth } from '../../src/world/region-growth';

// What grows answers to the country's climate as well as its habitat (CO-18: a northern fishing town's gardens grew
// bamboo, cinnamon and amaranth): a plant that names its climates grows only in them; one that names none, anywhere.
describe('gardens', () => {
  it('grow bamboo, cinnamon and amaranth in the warm, and never in a temperate or cold country', () => {
    const grown = (climate: string) => new Set(Array.from({ length: 60 }, (_, i) =>
      RegionGrowth.grown({ id: `town${i}_green`, climate }, new Set(['settlement', 'wood'])).map(([id]) => id)).flat());
    for (const cool of ['temperate', 'cold']) {
      expect([...grown(cool)].filter(id => ['bamboo', 'cinnamon', 'amaranth'].includes(id))).toEqual([]);
    }
    expect(grown('tropical').has('bamboo')).toBe(true);
    expect(grown('temperate').has('rosemary')).toBe(true);
  });
});
