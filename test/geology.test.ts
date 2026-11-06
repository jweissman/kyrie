import { afterEach, describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { Geology, type Formation } from '../src/world/land/geology';
import { Terrain } from '../src/world/land/terrain';
import { Atlases } from '../src/world/land/atlas';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import type { Region } from '../src/world/region-writer';
import { Livelihoods } from '../src/world/livelihoods';

// What a country is made of under what covers it (data/catalog/geology.json; the owner, 5 November, late): a layer
// beside the hex geography, not another registry of terrain. Its formations lie in broad tracts under the covers they
// belong under, its deposits are materials of data/catalog/materials.json, and they decide what a settlement lives by,
// where a mine is sunk and what is named for them; a formation written into the file shapes the next country made.
const added: string[] = [];
afterEach(() => { for (const id of added.splice(0)) { delete Geology.formations[id]; } });
const seeds = ['a1', 'b2', 'kite', 'wren', 'mere', 'thorn', 'cov2', 'ash'];

describe('the ground under a country', () => {
  it('is written of formations whose rock and deposits are materials, under covers and in terrains that exist', () => {
    for (const [id, f] of Object.entries(Geology.formations)) {
      expect([id, Canon.materials[f.rock] !== undefined]).toEqual([id, true]);
      expect([id, Object.keys(f.deposits).filter(m => !Canon.materials[m])]).toEqual([id, []]);
      const covers = ['sea', 'lake', 'fen', 'meadow', 'wood', 'heath', 'fell', 'peak'];
      expect([id, f.covers.filter(c => !covers.includes(c))]).toEqual([id, []]);
    }
  });
  it('lays its formations in tracts under their covers, and its deposits most where the rock shows', () => {
    let showing = 0, low = 0, cellsShowing = 0, cellsLow = 0;
    for (const seed of seeds) {
      const land = Terrain.make(seed, 'mountain'), ground = land.ground!;
      ground.rock.forEach((id, c) => {
        if (id) { expect(Geology.formations[id]!.covers).toContain(land.cover[c]!); }
        const high = ['fell', 'peak'].includes(land.cover[c]!), has = ground.deposits[c] !== undefined;
        if (high) { cellsShowing++; showing += Number(has); } else { cellsLow++; low += Number(has); }
      });
      for (const [c, m] of Object.entries(ground.deposits)) {
        expect(Geology.formations[ground.rock[Number(c)]!]!.deposits[m]).toBeGreaterThan(0);
      }
    }
    expect(showing / cellsShowing).toBeGreaterThan(low / cellsLow);
  });
  it('makes a fell-working settlement dig what its ground holds, iron among it, and sinks a mine where the ore is', async () => {
    const trades: string[] = [];
    for (const seed of seeds) {
      const region = (await WorldAssembler.assemble(seed, NodeBundleSource.shared, {})).report.region as Region;
      const atlas = region.atlas!;
      // A settlement that lives by its fells digs what its ground there holds, the first in its reach there are words
      // for: never tin where the hill is iron.
      for (const [i, s] of region.settlements.entries()) {
        const dug = (atlas.seats[i]?.dug ?? []).map(m => Livelihoods.dug[m]).find(Boolean);
        if (dug && ['iron', 'tin', 'slate'].includes(s.trade)) { expect([seed, s.name, s.trade]).toEqual([seed, s.name, dug]); }
      }
      trades.push(...region.settlements.map(s => s.trade));
    }
    expect(trades).toContain('iron');
    const land = Terrain.make('ore', 'mountain'), ores = Object.entries(land.ground!.deposits)
      .filter(([, m]) => Atlases.ores.has(m)).map(([c]) => Number(c));
    const atlas = Atlases.make('ore', 'mountain', { tongue: 'english', taken: [] });
    const mine = Atlases.place(atlas, 'mine', { key: 'ore:mine', taken: [] });
    if (ores.length) { expect(Atlases.ores.has(atlas.land.ground!.deposits[mine!.cell] ?? '')).toBe(true); }
  }, 300000);
  it('takes a formation written into geology.json into the next country made', () => {
    Geology.formations.copper_hills = { name: 'Copper hills', rock: 'stone', soil: 'green-stained', covers: ['fell', 'peak'],
      terrains: ['forest'], deposits: { copper: 1 }, looks: 'green stains on grey rock' } as Formation;
    added.push('copper_hills');
    const copper = seeds.flatMap(seed => Object.values(Terrain.make(seed, 'forest').ground!.deposits))
      .filter(m => m === 'copper');
    expect(copper.length).toBeGreaterThan(0);
  });
});
