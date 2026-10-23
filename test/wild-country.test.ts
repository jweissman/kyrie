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
    await Wood.take(s, /to the old bank$/);
    expect(Wood.ways(s).some(n => /^Strike out across Eikwudu toward the edge/.test(n))).toBe(false);
    await Wood.take(s, /to the edge of Eikwudu by Murkstede$/);
    await Wood.take(s, /to the charcoal-burners' clearing$/);
    expect(s.campaign.world.one('at', 'party')).toBe('region__z3_edge_2');
    // Across, at least once, without a path: either there, or lost and casting about until a path is found.
    for (let tries = 0; tries < 30 && s.campaign.world.one('at', 'party') !== 'region__z3_lost'; tries++) {
      const here = s.campaign.world.one('at', 'party');
      await Wood.take(s, here === 'region__z3_deep' ? /^Strike out across Eikwudu toward the charcoal/ : /^Strike out across Eikwudu toward the old bank/);
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
    const { w, zone, s } = await Wood.start();
    const view = RegionZones.landmarks(w.report.region, zone).find(l => l.view);
    if (!view) { return; }
    GeneratedWorld.put(s, view.id);
    await s.perform('wait');
    await Wood.take(s, /^Climb up and look out over/);
    expect(s.campaign.world.test(ModuleWriter.call('knows', 'party', `region__${zone.id}_mapped`))).toBe(true);
  }, 60000);
});
