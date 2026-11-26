import { describe, expect, it } from 'bun:test';
import { WorldDrawings } from '../../src/world/world-drawings';
import { Origins } from '../../src/world/origins';
import { ReferenceSettlement } from '../../src/world/reference-settlement';
import { RegionGeography } from '../../src/world/region-geography';
import { RegionWriter } from '../../src/world/region-writer';
import { Terrain } from '../../src/world/land/terrain';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { CanonVocabulary } from '../../src/canon/canon-vocabulary';

// The start is the first town and the deep dungeon, and not much else (the owner, 26 November: "ideally in the
// starting area, I'd like the First Town and the Big Dungeon and not much else around at all"; "random pointless
// fetchquests that don't have meaningful combat or resistance"; register OR-1074, OR-1075). In a country whose first
// town is the reference game's: no work of the makers nor any scenario's site within two hexes of it; every life it
// offers leads into the deep place under the old woods, none to another town or an old place two hexes off; and its
// people tell of nothing out in the country but the woods. The countries drawn only, no world built.
describe('the reference game\'s start', () => {
  it.each(['s0', 's1', 's4'])('on %s holds the town, its woods and the way down, and nothing else near', async seed => {
    const base = NodeBundleSource.shared, { region, placements } = await WorldDrawings.of(seed, base);
    const town = ReferenceSettlement.of(region)!, land = RegionGeography.atlas(region).land;
    const near = region.sites.filter(w => w.cell !== undefined && Terrain.hexes(land, town.cell!, w.cell) <= 2);
    expect([seed, near.map(w => w.name)]).toEqual([seed, []]);
    const loaded = await Origins.load(base);
    const offered = Origins.choices(loaded, region, placements, CanonVocabulary.context());
    expect(offered.map(o => o.id).sort()).toEqual(['debt', 'lost', 'map', 'order', 'wanderer']);
    // Every reason a life has leads under the stones: the map's cross, the sister, the old writing, the debt's pay.
    for (const o of offered.filter(x => ['map', 'lost', 'order'].includes(x.id))) {
      expect([o.id, /the old dead|the fallen stones/.test(o.choice)]).toEqual([o.id, true]);
    }
    const t = town.id, text = RegionWriter.source(region, { size: 1, contacts: [] }, {}, CanonVocabulary.context());
    // Its keeper counts off none of the country's old places, nor tells of the countries beyond.
    expect(text).not.toContain(`Topic ${t}_country_asked `);
    expect(text).not.toMatch(new RegExp(`_told_${t} with`));
    // Inside, on the ledge at the foot of the stair, someone who would come down with the company, for a fee.
    expect(text).toMatch(new RegExp(`Person ${t}_ud_waiting .* at ${t}_ud `));
    expect(text).toMatch(new RegExp(`Initially Set hire\\(${t}_ud_waiting\\) to [1-9]`));
    // What it knows of the stones leads to the shrine-keeper, then down.
    expect(text).toContain(`Objective ${t}_wood_ask `);
    expect(text).toContain(`Objective ${t}_wood_below `);
  });
});
