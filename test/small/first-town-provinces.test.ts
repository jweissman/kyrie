import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../../src/world/world-assembler';
import { Provinces } from '../../src/world/provinces';

// The first town is simple (the owner's ruling; register WD-12): from Porthalen's landing 45 ways had gone on, 27 of
// them into provinces, and in every drawn country the first town's green was where the provinces' roads began (4 of
// Iscoed's 5, 8 of a1's 33, 8 of b2's, 9 of kite's). A province's road now leaves from the nearest other town that can
// reach its way in, and from the first town only where none can; the way in stands where it stood. The country's
// land and its provinces' ways in only, no world.
const first = (seed: string) => {
  const region = WorldAssembler.region(seed, [0, 0]), town = region.settlements[0]!;
  return Provinces.situate(region).filter(p => p.gate.road.cells[0] === town.cell).length;
};
describe('the roads into a country\'s provinces', () => {
  it('leave from towns other than the first, where another can reach the way in', () => {
    expect([first('iscoed'), first('a1'), first('b2'), first('kite')]).toEqual([0, 1, 0, 1]);
  });
});
