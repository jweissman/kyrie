import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { RegionGeography } from '../src/world/region-geography';
import { RegionRoads } from '../src/world/region-roads';

// Play 10 (M17-100): two roads out of a town went to fords of one river, "To the ford of the Nûrnellë" and "… by
// Merinael", and the aim said "the ford of the Nûrnellë", which was either. Roads that share a name are told apart,
// each of them, by the settlement it lies nearer, or by both their ends: none keeps the bare name beside another's
// told apart (in ash two fords of the Murkbrōc, in fen two bridges over the Aravanahar, in oak two roads through one
// wood).
describe('roads that share a name', () => {
  it('are each told apart, none left bare beside another', async () => {
    for (const seed of ['ash', 'fen', 'oak']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared), region = w.report.region;
      const names = RegionGeography.roads(region).flatMap(r => {
        const n = RegionRoads.names(r, region);
        return [n.way, n.on, n.out].filter(x => /\p{Lu}/u.test(x));
      });
      expect(names.filter(n => names.some(m => m.startsWith(`${n} by `) || m.startsWith(`${n} between `))), seed)
        .toEqual([]);
      expect(names.filter(n => / (by|between) /.test(n)).length, seed).toBeGreaterThan(1);
    }
  }, 120000);
});
