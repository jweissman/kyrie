import { describe, expect, it } from 'bun:test';
import { PlaceNames } from '../src/world/place-names';
import { RegionLand } from '../src/world/region-land';
import { RegionWriter, type Region, type Settlement } from '../src/world/region-writer';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { RegionGeography } from '../src/world/region-geography';
import { Histories } from '../src/world/history/histories';
import { Atlases } from '../src/world/land/atlas';

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
  // d4's greatest singing hall could be called only what was like the Stone-Singers' own name or already taken.
  it('gives no two works one name, even when every name a work could have is like another', async () => {
    const w = await WorldAssembler.assemble('d4', NodeBundleSource.shared, { scenarios: 0, towns: 0, framework: null });
    const works = w.report.region.history!.works.map(x => x.old.name);
    expect(new Set(works).size).toBe(works.length);
  }, 60000);
});

describe('a generated region lies on real land', () => {
  it('drains its rivers downhill, settles its town by water, and joins every settlement by road', () => {
    const region = PlaceNames.render(WorldAssembler.lay(Land.region('mountain'), 'fells')), atlas = region.atlas!;
    // Each river runs from cell to cell the way its water drains, and every lake lies in a hollow.
    for (const r of atlas.rivers) {
      r.cells.slice(0, -1).forEach((c, i) => expect(atlas.land.water.to[c]).toBe(r.cells[i + 1]));
    }
    expect(atlas.seats[0]!.lie.some(l => ['river', 'coast', 'lake'].includes(l))).toBe(true);
    const joined = new Set([0]);
    for (let pass = 0; pass < atlas.ways.length; pass++) {
      for (const w of atlas.ways.filter(x => joined.has(x.start) || joined.has(x.end))) {
        joined.add(w.start); joined.add(w.end);
      }
    }
    expect(joined.size).toBe(region.settlements.length);
    // A road over the fells climbs a pass, cold after dark; one that fords a river can be swept by it.
    const source = RegionWriter.source(region), roads = RegionGeography.roads(region);
    for (const r of roads.filter(x => x.route.over)) { expect(source).toContain(`Rule ${r.way}_night when at(party, ${r.way}) and dark()`); }
    for (const r of roads.filter(x => x.form?.form === 'river' && x.route.crossings[0]?.kind === 'ford')) {
      expect(source).toContain(`Thing ${r.way}_water`);
    }
    // Fords, bridges and passes are where a road can be held; the edge of wild country is known to everyone.
    const { assembly, chart } = RegionWriter.manifest(region) as { assembly: { commitments: string[][] };
      chart: { cover: string } };
    for (const r of roads.filter(x => x.form && x.form.form !== 'wood')) {
      expect(assembly.commitments).toContainEqual(['chokepoint', r.way]);
    }
    for (const z of atlas.zones) { expect(assembly.commitments).toContainEqual(['landmark', `${z.id}_edge`]); }
    // The map is drawn from the same land.
    expect(chart.cover).toHaveLength(atlas.land.width * atlas.land.height);
  });
  it('puts each site where its kind can stand, and the deep ones out of sight until found or told of', () => {
    const region = PlaceNames.render(WorldAssembler.lay({ ...Land.region('mountain'), sites: [
      { id: 'w1', kind: 'cave', name: 'Fern Cave', hours: 1 }, { id: 'w2', kind: 'mine', name: 'Old Delf', hours: 1 },
      { id: 'w3', kind: 'barrow', name: 'Long Howe', hours: 1 }] }, 'fells'));
    const cover = region.atlas!.land.cover, source = RegionWriter.source(region);
    // A work stands on its plan's ground; the greatest of them anywhere dry, if its own ground is taken.
    for (const site of region.sites.filter(w => !w.work?.great)) {
      const ground = site.work ? Histories.plan(site.work.plan).ground : Atlases.grounds[site.kind];
      expect(ground).toContain(cover[site.cell!]!);
    }
    // Found by searching, a way is told from where it was found, not from the wild's far edge (M17-22).
    for (const site of region.sites.filter(w => (w.part ?? 0) > 0 && !w.work?.great)) {
      expect(source).toContain(`hidden until ${site.id}_found`);
      expect(source).toMatch(new RegExp(`Discovery ${site.id}_found "[^"]+" \\{ Found by searching \\w+ `
        + `"A track you had not seen goes off from here: the way to \\{${site.id}\\}\\."\\. \\}`));
    }
    // The greatest is out of sight until its makers' story is known: no search finds it.
    const great = region.sites.filter(w => w.work?.great);
    expect(great.length).toBe(1);
    for (const site of great) {
      expect(source).toContain(`hidden until ${site.id}_found`);
      expect(source).not.toMatch(new RegExp(`Discovery ${site.id}_found "[^"]+" \\{ Found by searching `));
    }
  });
  it('is cold on the pass after dark, once a night', async () => {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
    const pass = RegionGeography.roads(w.report.region).find(r => r.route.over)!;
    const s = await PlaySession.start(w.path, 'thorn', w.source);
    Land.put(s, `region__${pass.way}`);
    let said = '';
    while (s.campaign.state.elapsed < 90) {
      const e = await s.perform('wait_hour');
      said += ` ${(e.perceptions ?? []).map(p => p.text).join(' ')}`;
    }
    expect(said.match(/Night comes down on the/g)?.length).toBe(1);
    expect(s.campaign.state.party.some(m => m.hp < m.maxHp) || /cold/i.test(said)).toBe(true);
  }, 60000);
});

describe('a generated region keeps a calendar and weather', () => {
  it('turns its weather at first light for as long as the campaign goes on, and raises its river after rain', async () => {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared), region = w.report.region;
    const ford = RegionGeography.roads(region).find(r => r.form?.form === 'river' && r.route.crossings[0]?.kind === 'ford')!;
    const river = ford.form!.name, s = await PlaySession.start(w.path, 'thorn', w.source);
    Land.put(s, `region__${ford.to.id}_green`);
    const sky = () => s.campaign.world.one('state', 'region__sky')!.replace(/^.*__weather_/, '');
    const up = () => s.campaign.world.test(ModuleWriter.call('state', `region__${ford.way}_water`, 'region__spate'));
    const days: { sky: string; up: boolean; risk: boolean }[] = [];
    for (let day = 0; day < 20; day++) {
      // To the morning after first light: 6 a.m. is the watch 144 n - 12 of day n.
      while (s.campaign.state.elapsed < 144 * (day + 1) - 11) {
        const ids = PlayerView.choices(s.campaign).map(c => c.choice.id);
        await s.perform(['wait_for_light', 'wait_for_dark', 'wait_hour'].find(id => ids.includes(id))!);
      }
      const names = PlayerView.choices(s.campaign).map(c => c.choice.name).filter(n => n.includes(river));
      days.push({ sky: sky(), up: up(), risk: names.some(n => n.startsWith(`Risk the ${river}`)) });
    }
    // The morning after a wet day the river is up, and its ford can only be risked; after a dry one it is down.
    for (let d = 1; d < days.length; d++) {
      expect(days[d]!.up).toBe(['rainy', 'stormy'].includes(days[d - 1]!.sky));
      expect(days[d]!.risk).toBe(days[d]!.up);
    }
    expect(days.some(d => d.up)).toBe(true);
    // The sky still turns after the first twelve days.
    expect(new Set(days.slice(12).map(d => d.sky)).size).toBeGreaterThan(1);
    expect(ScreenModel.build(s.campaign).date?.long).toMatch(/of the Sun and Moon; (spring|summer|autumn|winter)$/);
  }, 120000);
});
