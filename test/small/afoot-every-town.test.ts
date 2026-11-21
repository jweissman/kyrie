import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../../src/world/world-assembler';
import { RegionAfoot } from '../../src/world/region-afoot';

// Something going on in every generated town that moves on by the days (data/generation/town/afoot.kyrt; the census,
// doc/design/situations-census.md): in a1, iscoed, thorn and ash, every settlement draws one, no two of a country the
// same while the pool has others, each told in three stages by the clock with a point to step in, and a boat only
// where there is water.
describe('what is afoot in every generated town', () => {
  it('is one of the pool in each, three stages and a way in, none twice in a country', () => {
    for (const seed of ['a1', 'iscoed', 'thorn', 'ash']) {
      const region = WorldAssembler.region(seed, [0, 0]), drawn = RegionAfoot.drawn(region);
      expect(region.settlements.filter(s => !drawn.has(s.id)).map(s => s.id)).toEqual([]);
      expect(new Set(drawn.values()).size).toBe(region.settlements.length);
      for (const s of region.settlements) {
        const kyr = RegionAfoot.lines(region, s).join('\n');
        for (const stage of ['af_one', 'af_two', 'af_three', 'af_three_helped']) { expect(kyr).toContain(`Observe ${s.id}_${stage} `); }
        expect(kyr).toMatch(new RegExp(`Action ${s.id}_af_lend\\(`));
      }
    }
  });
});
