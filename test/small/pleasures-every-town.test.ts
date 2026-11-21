import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../../src/world/world-assembler';
import { RegionPleasures } from '../../src/world/region-pleasures';
import { RegionGeography } from '../../src/world/region-geography';

// A few pleasant things to do in every generated settlement (the owner, 20 November): in a1, iscoed and six countries
// drawn about a1, every settlement has three of the pool on its green (data/generation/town/pleasures.kyrt), written
// as Kyr, none of them twice, and no two settlements a road joins draw the same three; the town the company begins in
// draws none of the first town's own kin (its pump, fiddle and cards are neighbours.kyrt's).
const countries = [['a1', [0, 0]], ['iscoed', [0, 0]], ...[[-1, 0], [0, 1], [0, -1], [-1, -1], [-1, 1], [0, 2]]
  .map(at => ['a1', at])] as [string, [number, number]][];
describe('pleasant things to do, in every generated town', () => {
  it('are three of a pool of at least eight in each, written, and differ between neighbours', () => {
    expect(RegionPleasures.pool.length).toBeGreaterThanOrEqual(8);
    const count = new Map<string, number>();
    let towns = 0;
    for (const [seed, at] of countries) {
      const region = WorldAssembler.region(seed, at), drawn = RegionPleasures.of(region);
      for (const s of region.settlements) {
        const three = drawn.get(s.id)!;
        expect([s.id, new Set(three).size]).toEqual([s.id, RegionPleasures.per]);
        expect(three.every(p => RegionPleasures.pool.includes(p))).toBe(true);
        const kyr = RegionPleasures.lines(region, s).join('\n');
        for (const p of three) { expect(kyr).toMatch(new RegExp(`Thing ${s.id}_pl_\\w+ `)); count.set(p, (count.get(p) ?? 0) + 1); }
        towns++;
      }
      for (const r of RegionGeography.roads(region)) {
        expect(drawn.get(r.from.id)!.join()).not.toBe(drawn.get(r.to.id)!.join());
      }
      const home = region.settlements[0]!.id;
      expect(RegionPleasures.of(region, home).get(home)!.filter(p => RegionPleasures.kept.includes(p))).toEqual([]);
    }
    // Every one of the pool is met somewhere (none written and never drawn).
    expect(RegionPleasures.pool.filter(p => !count.has(p))).toEqual([]);
    console.log(`${towns} settlements; ${[...count].map(([p, n]) => `${p} ${n}`).join(', ')}`);
  });
});
