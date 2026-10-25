import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Frontier } from '../src/world/frontier';
import { Countries } from '../src/world/countries';
import { WorldGrid } from '../src/world/world-grid';
import { RegionLand } from '../src/world/region-land';
import { GeneratedWorld } from './support/generated';
import { Journey } from '../src/session/journey';

// A generated world goes on past the edges of its first region: an old road runs out to a march-stone on every side,
// and the first time the company stands at one the country beyond is drawn from the world's seed and where it lies,
// installed, and joined by the road across the march. a1: Merscfaenn, a fen; east of it, whatever the seed makes.
class March {
  static async start() {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared);
    const s = await PlaySession.start(w.path, 'a1', w.source);
    return { w, s, frontier: new Frontier('a1', NodeBundleSource.shared) };
  }
  static choose(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No choice like ${pattern}`); }
    return s.perform(c.choice.id);
  }
}

describe('the world beyond a region', () => {
  it('runs an old road out to a march-stone on every side, which names the country beyond', async () => {
    const { w, s } = await March.start(), region = w.report.region;
    const edges = s.campaign.module.entities.filter(e => /^region__edge_(north|east|south|west)$/.test(e.id));
    expect(edges.map(e => e.id.replace('region__edge_', '')).sort()).toEqual(['east', 'north', 'south', 'west']);
    const east = region.beyond!.east!;
    expect(east.terrain).toBe(WorldGrid.drawn('a1', 1, 0).terrain);
    GeneratedWorld.put(s, 'edge_east');
    const seen = await s.perform('wait') as { perceptions?: { text: string }[] };
    expect(seen.perceptions!.some(p => p.text.includes(`into ${east.name}`))).toBe(true);
  }, 60000);
  it('draws the country beyond the first time the company comes to the march, and joins it by the road', async () => {
    const { w, s, frontier } = await March.start(), east = w.report.region.beyond!.east!;
    await GeneratedWorld.travel(s, 'edge_east');
    const drawn = await frontier.expand(s.campaign);
    expect(drawn!.rid).toBe('x1y0');
    expect(drawn!.region!.name).toBe(east.name);
    expect(s.campaign.installed).toContain('x1y0');
    expect(await frontier.expand(s.campaign)).toBeUndefined();
    // One world, one history: the kingdom after the makers is the same on both sides of the march, and makers who
    // worked in both ended the same way in both.
    const past = w.report.region.history!, beyond = drawn!.region!.history!;
    expect(beyond.successors.name).toBe(past.successors.name);
    const shared = beyond.makers.filter(m => past.makers.some(h => h.art === m.art));
    expect(shared.length).toBeGreaterThan(0);
    expect(shared.map(m => m.fate)).toEqual(shared.map(m => past.makers.find(h => h.art === m.art)!.fate));
    // Nothing placed in the first region is placed again in the second.
    expect(drawn!.region!.sites.length).toBeGreaterThan(4);
    const bare = (id: string) => id.replace(/^x1y0/, '').replace(/\d+$/, '');
    const home = new Set(s.campaign.installed.filter(id => !/^(x1y0|link)/.test(id)).map(bare));
    const there = s.campaign.installed.filter(id => /^x1y0./.test(id)).map(bare).filter(id => id !== 'word');
    expect(there.length).toBeGreaterThan(0);
    expect(there.filter(id => home.has(id))).toEqual([]);
    // Nor is any work there called what one here is, or like it.
    for (const site of drawn!.region!.sites.filter(x => x.work)) {
      expect(w.report.region.sites.filter(x => x.work && RegionLand.confusable(x.name, site.name))).toEqual([]);
    }
    await March.choose(s, /^Take the road across the march to the western edge of /);
    expect(s.campaign.world.one('at', 'party')).toBe('x1y0__edge_west');
    await March.choose(s, /^Take the old road west to /);
    expect(s.campaign.world.one('at', 'party')).toMatch(/^x1y0__s\d+_green$/);
    // Saved there and opened again, the company is still in the country beyond, and can go on in it.
    const back = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())));
    expect(back.campaign.world.one('at', 'party')).toMatch(/^x1y0__s\d+_green$/);
    expect(PlayerView.choices(back.campaign).some(c => c.choice.id.startsWith('go('))).toBe(true);
    expect(back.campaign.module.entities.find(e => e.id === 'x1y0__region')?.name).toBe(east.name);
  }, 120000);
  it('holds an authored country where it fits: the Long Man beyond the north march of an upland country, once', async () => {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
    const s = await PlaySession.start(w.path, 'thorn', w.source), frontier = new Frontier('thorn', NodeBundleSource.shared);
    expect(w.report.region.beyond!.north!.name).toBe('Merrowdale');
    await GeneratedWorld.travel(s, 'edge_north');
    const elapsed = s.campaign.state.elapsed, drawn = await frontier.expand(s.campaign);
    expect(drawn!.region).toBeUndefined();
    expect(s.campaign.module.entities.some(e => e.id === `${drawn!.rid}__long_man`)).toBe(true);
    await March.choose(s, /road across the march/);
    expect(s.campaign.world.one('at', 'party')).toBe(`${drawn!.rid}__road_end`);
    // Its three days run from when it is reached, not from when the world began.
    const storm = s.campaign.module.rules!.find(r => r.id === `${drawn!.rid}__storm_comes`)!;
    expect(JSON.stringify(storm.when)).toContain(`"value":${312 + elapsed}`);
    // Placed once: another upland country's north march leads into a country of its own.
    expect(Countries.fits('mountain', 'north', c => s.campaign.module.entities.some(e => e.id.endsWith(`__${c.marker}`)), 'thorn'))
      .toBeUndefined();
  }, 120000);
  // The independent adventures, as countries a generated world may hold: one to a world, as its seed chooses, beyond
  // the first march where it fits; the folk of the first region speak of it, and the road across leads in.
  it('holds one independent adventure, as its seed chooses, beyond the march where it fits, and leads the company in', async () => {
    const yew = await WorldAssembler.assemble('yew', NodeBundleSource.shared, { region: { terrain: 'forest' } });
    const beyond = Object.values(yew.report.region.beyond!).map(c => c!.name);
    expect(yew.report.region.beyond!.east!.name).toBe('Thrume');
    expect(beyond.filter(n => ['the Strewnfield', 'the Corrow', 'the Ghessil Uplands'].includes(n))).toEqual([]);
    const s = await PlaySession.start(yew.path, 'yew', yew.source);
    await GeneratedWorld.travel(s, 'edge_east');
    const thrume = await new Frontier('yew', NodeBundleSource.shared).expand(s.campaign);
    await March.choose(s, /road across the march to the salt road/);
    expect(s.campaign.world.one('at', 'party')).toBe(`${thrume!.rid}__salt_road`);
    expect(await Journey.of(s).play('^To the market', 'notice')).toContain('THE GIANT MÓRRACH');
    // The Patient Star says what it will of the company that comes in (its breath, its memories), by names of its own.
    const wren = await WorldAssembler.assemble('wren', NodeBundleSource.shared);
    expect(wren.report.region.beyond!.west!.name).toBe('the Ghessil Uplands');
    const u = await PlaySession.start(wren.path, 'wren', wren.source);
    await GeneratedWorld.travel(u, 'edge_west');
    const ghessil = await new Frontier('wren', NodeBundleSource.shared).expand(u.campaign);
    await March.choose(u, /road across the march to the Shift Market/);
    expect(u.campaign.world.one('at', 'party')).toBe(`${ghessil!.rid}__square`);
  }, 180000);
});

