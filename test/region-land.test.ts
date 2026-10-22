import { describe, expect, it } from 'bun:test';
import { PlaceNames } from '../src/world/place-names';
import { RegionLand } from '../src/world/region-land';
import { RegionWriter, type Region, type Settlement } from '../src/world/region-writer';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';

// A generated region's names and land: no two places so alike a traveller could take one for the other, and a river,
// a pass and a peak that are places on the way, not words in a description.
class Land {
  static town(id: string, feature: string, affix: string): Settlement {
    return { id, name: `${feature}${affix}`, feature, affix, size: 'village', trade: 'salt', inn: 'the Red Ram',
      innkeeper: 'Iamond', priest: 'Cy', merchant: 'Ada', traveller: 'Tam', calling: 'drover' };
  }
  // Three settlements Deem drew as near-twins, the way Merscheald and Merscstede were drawn side by side.
  static region(terrain: string): Region {
    return { name: 'Frostwold', feature: 'frost', affix: 'wold', terrain, ancestry: 'human', domain: 'life',
      deity: 'Brigid', settlements: [this.town('s1', 'marsh', 'hold'), this.town('s2', 'marsh', 'stead'),
        this.town('s3', 'marsh', 'hold')], sites: [{ id: 'w1', kind: 'cave', name: 'Fern Cave', feature: 'fern',
        affix: 'cave', hours: 1 }], wonder: { kind: 'stone', description: 'a standing stone.' } };
  }
  static put(s: PlaySession, place: string) {
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
  }
}

describe('a generated region keeps its places apart', () => {
  it('knows names a traveller could take for each other, by their opening, their consonants or their letters', () => {
    expect(RegionLand.confusable('Merscheald', 'Merscstede')).toBe(true);
    expect(RegionLand.confusable('Chealdholm', 'Chealdpath')).toBe(true);
    expect(RegionLand.confusable('Stānholm', 'Stanholm')).toBe(true);
    expect(RegionLand.confusable('Merscheald', 'Meósdael')).toBe(false);
  });
  it('renames a settlement that would echo its neighbour, and says no meaning twice', () => {
    const named = PlaceNames.render(Land.region('marsh'), 'twins');
    const names = [named.name, ...named.settlements.map(s => s.name), ...(named.land ?? []).map(l => l.name)];
    for (const [i, a] of names.entries()) {
      for (const b of names.slice(i + 1)) { expect(RegionLand.confusable(a, b)).toBe(false); }
    }
    expect(new Set(named.settlements.map(s => s.affix)).size).toBe(3);
    expect(new Set(named.settlements.map(s => s.feature)).size).toBe(3);
  });
});

describe('a generated region lies on real land', () => {
  it('fords its river on the first road and climbs its pass on the second, with its peak above', () => {
    const region = PlaceNames.render(Land.region('mountain'), 'fells'), source = RegionWriter.source(region);
    const [river, peak, pass] = ['river', 'peak', 'pass'].map(f => region.land!.find(l => l.form === f)!);
    expect(source).toContain(`Passage road_s1_s2_on "the ford of the ${river!.name}" is ford between s1_s2_way and s2_green`);
    expect(source).toMatch(/Passage road_s2_s3 "[^"]+" is road between s2_green and s2_s3_way taking 2 hours/);
    expect(source).toContain(`Place summit "the top of ${peak!.name}" is room within s2_s3_land`);
    expect(source).toContain(`Rule pass_night when at(party, s2_s3_way) and dark()`);
    // The settlements stand along the road, west to east, with the land between them.
    expect(source).toContain('is settlement within region at 8, 2.');
    expect(source).toContain(`Place s2_s3_land "the ${pass!.name}" is wilderness within region at 6, 2.`);
    // A ford and a pass are where a road can be held; a summit is known to everyone.
    const { assembly } = RegionWriter.manifest(region) as { assembly: { commitments: string[][] } };
    expect(assembly.commitments).toEqual(expect.arrayContaining([['chokepoint', 's1_s2_way'],
      ['chokepoint', 's2_s3_way'], ['landmark', 'summit']]));
    // From the summit the whole region can be seen where it lies, and the ford below.
    expect(source).toMatch(/From the top of [^:]+: .*to the west.* winding down to its ford, west of you/);
  });
  it('is cold on the pass after dark, once a night', async () => {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
    const s = await PlaySession.start(w.path, 'thorn', w.source);
    Land.put(s, 'region__s2_s3_way');
    let said = '';
    while (s.campaign.state.elapsed < 90) {
      const e = await s.perform('wait_hour');
      said += ` ${(e.perceptions ?? []).map(p => p.text).join(' ')}`;
    }
    expect(said.match(/Night comes down on the/g)?.length).toBe(1);
    expect(s.campaign.state.party.some(m => m.hp < m.maxHp) || /cold/i.test(said)).toBe(true);
  }, 60000);
});
