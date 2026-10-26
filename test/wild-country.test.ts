import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { RegionZones } from '../src/world/region-zones';
import { ScreenModel } from '../src/ui/screen-model';
import { GeneratedWorld } from './support/generated';
import { Intentions } from '../src/ui/intentions';

// Wild country is ground, not a list of rooms. a1's Eikwudu: landmarks where they stand on the land, joined by
// trails; a way into it from every road and settlement it borders, so it can be crossed and come out somewhere else;
// a way straight across between places the company has been, which can lose it; and, lost, a way to find a path again.
class Wood {
  // One warrior, come over the hills: nobody to read the wild country for them.
  static async start() {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { scenarios: 0, towns: 0, framework: null,
      origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const zone = w.report.region.atlas!.zones.find(z => z.naming.name === 'Eikwudu')!;
    return { w, zone, s: await PlaySession.start(w.path, 'a1', w.source) };
  }
  static ways(s: PlaySession): string[] {
    return PlayerView.choices(s.campaign).map(c => c.choice.name);
  }
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No choice like ${pattern}: ${this.ways(s).join(' | ')}`); }
    return s.perform(c.choice.id);
  }
}

describe('wild country', () => {
  it('holds landmarks at their own places on the land, each its own kind of place', async () => {
    const { w, zone } = await Wood.start(), marks = RegionZones.landmarks(w.report.region, zone);
    expect(marks.length).toBeGreaterThanOrEqual(3);
    expect(new Set(marks.map(l => l.cell)).size).toBe(marks.length);
    expect(new Set(marks.map(l => l.name)).size).toBe(marks.length);
    expect(marks.map(l => l.name)).toContain('the edge of Eikwudu by Murkstede');
  }, 60000);
  it('is come to at its edge from where the edge is said to be, though no road or settlement is beside it', async () => {
    const reached = (lines: string[], zone: string, from = '\\S+') =>
      lines.some(l => new RegExp(`^  Passage ${zone}_way\\d+ .* between ${from} and ${zone}_edge taking`).test(l));
    for (const seed of ['wren', 'a1', 'b2', 'thorn']) {
      const { region } = (await WorldAssembler.assemble(seed, NodeBundleSource.shared, { scenarios: 0, towns: 0,
        framework: null, origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] })).report;
      const lines = RegionZones.lines(region);
      expect(region.atlas!.zones.filter(z => !reached(lines, z.id)).map(z => `${seed} ${z.naming.name}`)).toEqual([]);
      if (seed !== 'wren') { continue; }
      // In wren the foot of Barzelrehes by Muzgkom is two hours up from Muzgkom, with no road by it.
      const zone = region.atlas!.zones.find(z => z.naming.name === 'Barzelrehes')!;
      const muzgkom = region.settlements.find(s => s.name === 'Muzgkom')!;
      expect(reached(lines, zone.id, `${muzgkom.id}_green`)).toBe(true);
    }
  }, 120000);
  it('has its trails run between neighbours, however far it stretches', async () => {
    const { region } = (await WorldAssembler.assemble('wren', NodeBundleSource.shared, { scenarios: 0, towns: 0,
      framework: null, origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] })).report;
    const zone = region.atlas!.zones.find(z => z.naming.name === 'Barzelrehes')!;
    const trails = RegionZones.lines(region).filter(l => l.startsWith(`  Passage ${zone.id}_trail`));
    // The fells run nearly the width of the country; walked between neighbours, no trail is more than half a day's
    // walking, and every landmark is on one.
    const minutes = trails.map(l => /taking (\d+) (minutes|hours?)/.exec(l)!).map(([, n, unit]) =>
      Number(n) * (unit === 'minutes' ? 1 : 60));
    expect(Math.max(...minutes)).toBeLessThanOrEqual(6 * 60);
    expect(trails).toHaveLength(RegionZones.landmarks(region, zone).length - 1);
  }, 60000);
  it('can be crossed: its edge leads to more than one road or settlement', async () => {
    const { s } = await Wood.start();
    GeneratedWorld.put(s, 'z3_edge');
    await s.perform('wait');
    const out = PlayerView.choices(s.campaign)
      .filter(c => /_green\)$/.test(c.choice.id) || /^Take .* to the road /.test(c.choice.name));
    expect(out.length).toBeGreaterThanOrEqual(2);
  }, 60000);
  it('can be struck across between places the company has been, can lose it, and lets it find its way again', async () => {
    const { s } = await Wood.start();
    GeneratedWorld.put(s, 'z3_edge');
    await s.perform('wait');
    await Wood.take(s, /to the charcoal-burners' clearing in Eikwudu$/);
    await Wood.take(s, /to the old bank( in Eikwudu)?$/);
    expect(s.campaign.world.one('at', 'party')).toBe('region__z3_deep');
    // Where a trail runs there is no striking out across instead.
    expect(Wood.ways(s).some(n => /^Strike out across Eikwudu toward the charcoal/.test(n))).toBe(false);
    // Across, at least once, without a path: either there, or lost and casting about until a path is found.
    for (let tries = 0; tries < 30 && s.campaign.world.one('at', 'party') !== 'region__z3_lost'; tries++) {
      const here = s.campaign.world.one('at', 'party');
      await Wood.take(s, here === 'region__z3_deep' ? /^Strike out across Eikwudu toward the edge/ : /^Strike out across Eikwudu toward the old bank/);
    }
    expect(s.campaign.world.one('at', 'party')).toBe('region__z3_lost');
    expect(ScreenModel.build(s.campaign).place.name).toBe('somewhere in Eikwudu');
    // Lost, the ways back to a path are ways to go, offered as such.
    const go = Intentions.book(ScreenModel.build(s.campaign)).find(x => x.title === 'Go');
    expect(go?.choices.map(c => c.label)).toContain('Cast about for a path you know');
    for (let tries = 0; tries < 12 && s.campaign.world.one('at', 'party') === 'region__z3_lost'; tries++) {
      await Wood.take(s, /^Cast about for a path you know/);
    }
    expect(s.campaign.world.one('at', 'party')).toBe('region__z3_edge');
  }, 120000);
  it('lets whoever has climbed somewhere with a view keep their bearings', async () => {
    const { w, s } = await Wood.start(), region = w.report.region;
    // A wild country of the region with somewhere to look out from, found, not assumed: this test returned early when
    // the wood it named had none, having tested nothing (the review of 483e3af).
    const zone = region.atlas!.zones.find(z => RegionZones.landmarks(region, z).some(l => l.view));
    const view = zone && RegionZones.landmarks(region, zone).find(l => l.view);
    expect(view).toBeDefined();
    GeneratedWorld.put(s, view!.id);
    await s.perform('wait');
    await Wood.take(s, /^Climb up and look out over/);
    expect(s.campaign.world.test(ModuleWriter.call('knows', 'party', `region__${zone!.id}_mapped`))).toBe(true);
  }, 60000);
});
