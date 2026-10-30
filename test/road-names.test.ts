import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { RegionGeography } from '../src/world/region-geography';
import { RegionRoads } from '../src/world/region-roads';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList } from '../src/ui/choice-list';
import { ModuleWriter } from '../src/lang/module-writer';

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
  // From a road, its ways off into the stretches of country it crosses had all been "the road", and on kite's road
  // through Beorquudu seven of them read alike to the letter, "To among the trees of Beorquudu" (NAV-04). Each is told
  // by where on the road it leaves it, how far out of the town it is nearer; and from no place in the country do two
  // ways read alike.
  it('are left by ways each told by where on the road it is, and no two ways from one place read alike', async () => {
    const seed = 'kite', w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    const c = (await PlaySession.start(w.path, seed, w.source)).campaign;
    const moved = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    const ways = (place: string) => {
      moved.commit(moved.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
      return ChoiceList.ways(ScreenModel.build(c).exits).choices.map(x => x.label);
    };
    const road = RegionGeography.roads(w.report.region).find(r => r.way === 's2_s3_way')!;
    expect(RegionRoads.names(road, w.report.region).way).toBe('the road through Birchwood');
    const off = ways('region__s2_s3_way').filter(l => l.startsWith('To among the trees of Birchwood'));
    expect(off).toHaveLength(7);
    expect(off).toContain('To among the trees of Birchwood by the road, half an hour out of Brightbridge');
    expect(off).toContain('To among the trees of Birchwood by the road, two and a half hours out of Redholm');
    const from = [...new Set(c.world.related('connects').map(r => r.args[1]!))];
    const alike = from.flatMap(place => {
      const labels = ways(place);
      return labels.filter((l, i) => labels.indexOf(l) !== i).map(l => `${place}: ${l}`);
    });
    expect([from.length > 100, from.includes('region__s2_s3_way'), alike]).toEqual([true, true, []]);
  }, 180000);
});
