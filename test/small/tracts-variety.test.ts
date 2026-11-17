import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../../src/world/world-assembler';
import { RegionTracts } from '../../src/world/region-tracts';

// The open country told in more than a handful of words (CO-03, R11-06: a woodland told word for word in country after
// country, three sentences a kind of land): no one opening of a stretch tells more than a tenth of a country's open
// country. With three a kind it was 17 to 19 % (a1 38 of 219 stretches, c3 51 of 266); with eight, 6 to 9 %.
describe('the open country\'s stretches', () => {
  it.each(['a1', 'b2', 'c3'])('%s: no opening tells more than a tenth of them', seed => {
    const region = WorldAssembler.region(seed, [0, 0]), told = new Map<string, number>();
    const cells = RegionTracts.cells(region);
    for (const cell of cells) {
      const first = RegionTracts.told(region, cell).split(/(?<=\.) /)[0]!;
      told.set(first, (told.get(first) ?? 0) + 1);
    }
    expect(cells.length).toBeGreaterThan(150);
    expect(Math.max(...told.values()) / cells.length).toBeLessThan(0.1);
  });
});
