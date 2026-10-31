import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Frontier } from '../src/world/frontier';
import { WorldGrid } from '../src/world/world-grid';
import { RegionLand } from '../src/world/region-land';
import { GeneratedWorld } from './support/generated';
import { Journey } from '../src/session/journey';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';

// A generated world goes on past the edges of its first region: an old road runs out to a march-stone on every side,
// and the first time the company stands at one the country beyond is drawn from the world's seed and where it lies,
// installed, and joined by the road across the march. a1: Merscfaenn, a fen; west of it, whatever the seed makes
// (east of a fen lies Tessary, an authored country).
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
  // How the way from where the company stands to a place is told: across country, or through a planar threshold.
  static way(s: PlaySession, to: string) {
    return ScreenModel.build(s.campaign).exits.find(e => e.destination.id === to)?.transition;
  }
}

describe('the world beyond a region', () => {
  it('runs an old road out to a march-stone on every side, which names the country beyond', async () => {
    const { w, s } = await March.start(), region = w.report.region;
    const edges = s.campaign.module.entities.filter(e => /^region__edge_(north|east|south|west)$/.test(e.id));
    expect(edges.map(e => e.id.replace('region__edge_', '')).sort()).toEqual(['east', 'north', 'south', 'west']);
    const west = region.beyond!.west!;
    expect(west.terrain).toBe(WorldGrid.drawn('a1', -1, 0).terrain);
    GeneratedWorld.put(s, 'edge_west');
    const seen = await s.perform('wait') as { perceptions?: { text: string }[] };
    expect(seen.perceptions!.some(p => p.text.includes(`into ${west.name}`))).toBe(true);
  }, 60000);
  it('draws the country beyond the first time the company comes to the march, and joins it by the road', async () => {
    const { w, s, frontier } = await March.start(), west = w.report.region.beyond!.west!;
    await GeneratedWorld.travel(s, 'edge_west');
    const drawn = await frontier.expand(s.campaign);
    expect(drawn!.rid).toBe('xm1y0');
    expect(drawn!.region!.name).toBe(west.name);
    expect(s.campaign.installed).toContain('xm1y0');
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
    const bare = (id: string) => id.replace(/^xm1y0/, '').replace(/\d+$/, '');
    const home = new Set(s.campaign.installed.filter(id => !/^(xm1y0|link)/.test(id)).map(bare));
    const there = s.campaign.installed.filter(id => /^xm1y0./.test(id)).map(bare).filter(id => id !== 'word');
    expect(there.length).toBeGreaterThan(0);
    expect(there.filter(id => home.has(id))).toEqual([]);
    // Nor is any work there called what one here is, or like it.
    for (const site of drawn!.region!.sites.filter(x => x.work)) {
      expect(w.report.region.sites.filter(x => x.work && RegionLand.confusable(x.name, site.name))).toEqual([]);
    }
    // Both countries are of Imbar: the road over the march goes across country, not through a planar threshold.
    expect(March.way(s, 'xm1y0__edge_east')).toBe('travel');
    await March.choose(s, /^Take the road across the march to the march-stone of /);
    expect(s.campaign.world.one('at', 'party')).toBe('xm1y0__edge_east');
    await March.choose(s, /^Take the old road east to /);
    expect(s.campaign.world.one('at', 'party')).toMatch(/^xm1y0__s\d+_green$/);
    // Saved there and opened again, the company is still in the country beyond, and can go on in it.
    const back = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())));
    expect(back.campaign.world.one('at', 'party')).toMatch(/^xm1y0__s\d+_green$/);
    expect(PlayerView.choices(back.campaign).some(c => c.choice.id.startsWith('go('))).toBe(true);
    expect(back.campaign.module.entities.find(e => e.id === 'xm1y0__region')?.name).toBe(west.name);
  }, 120000);
  // Merrowdale a province of the first country (Gate B: one country, every adventure in it): installed where its way in
  // stands, once, its three days run from the morning after it is reached.
  it('holds an authored country as a province: the Long Man installed at its way in, once', async () => {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
    const s = await PlaySession.start(w.path, 'thorn', w.source), frontier = new Frontier('thorn', NodeBundleSource.shared);
    expect(w.report.region.provinces!.map(p => p.name)).toContain('Merrowdale');
    await GeneratedWorld.travel(s, 'gate_longman');
    const elapsed = s.campaign.state.elapsed;
    expect(await frontier.expand(s.campaign)).toBeUndefined();
    expect(s.campaign.module.entities.some(e => e.id === 'plongman__long_man')).toBe(true);
    await March.choose(s, /^Take the road on into Merrowdale/);
    expect(s.campaign.world.one('at', 'party')).toBe('plongman__road_end');
    // Its three days run from the morning after it is reached, not from when the world began (see placed-days).
    const storm = s.campaign.module.rules!.find(r => r.id === 'plongman__storm_comes')!;
    expect(JSON.stringify(storm.when)).toContain(`"value":${312 + Math.ceil(elapsed / 144) * 144}`);
    // Once: standing at the way in again installs nothing more.
    const installed = s.campaign.installed.length;
    await frontier.expand(s.campaign);
    expect(s.campaign.installed.length).toBe(installed);
  }, 120000);
  // The independent review's E2: a later country's march-stone named its own neighbour ("into Loxorloew, fen
  // country"), and the frontier installed an authored country beyond it. Only the first country's marches lead into
  // one.
  it('leads from a later country into the country its march-stone names', async () => {
    const { s, frontier } = await March.start();
    await GeneratedWorld.travel(s, 'edge_west');
    const west = await frontier.expand(s.campaign);
    await March.choose(s, /road across the march/);
    const onward = new RegExp(`^${west!.rid}__edge_(north|south|west)_scene$`);
    const stone = (s.campaign.module.observations ?? [])
      .find(o => onward.test(o.id) && /the road goes on/.test(o.text))!;
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    const from = s.campaign.world.one('at', 'party')!;
    c.commit(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', from) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', stone.place) }]));
    const beyond = await frontier.expand(s.campaign);
    expect(beyond!.region).toBeDefined();
    expect(stone.text).toContain(` into ${beyond!.region!.name},`);
  }, 180000);
  // The independent adventures, as countries a generated world may hold: one to a world, as its seed chooses, beyond
  // the first march where it fits; the folk of the first region speak of it, and the road across leads in.
  // The independent adventures are provinces too: the Ghessil Uplands' rumour a hook in every town, known as heard
  // from whoever told it, and its road in from its way in.
  it('holds the independent adventures as provinces, each told of and led into', async () => {
    const wren = await WorldAssembler.assemble('wren', NodeBundleSource.shared);
    expect(wren.report.region.provinces!.map(p => p.name)).toContain('the Ghessil Uplands');
    const u = await PlaySession.start(wren.path, 'wren', wren.source);
    const told = u.campaign.module.actions.find(a => a.id.startsWith('region__gate_ghessil_beyond_told_'))!;
    GeneratedWorld.put(u, u.campaign.world.one('at', told.speaker!)!.replace(/^region__/, ''));
    expect(await Journey.of(u).play('about the Ghessil Uplands')).toContain('people standing in it');
    const known = PlayerView.observe(u.campaign).knowledge.find(k => k.id === 'region__gate_ghessil_beyond')!;
    const keeper = u.campaign.module.entities.find(e => e.id === told.speaker)!.name;
    expect([known.source, known.from?.startsWith(keeper)]).toEqual(['heard', true]);
    await GeneratedWorld.travel(u, 'gate_ghessil');
    await new Frontier('wren', NodeBundleSource.shared).expand(u.campaign);
    await March.choose(u, /road on into the Ghessil Uplands/);
    expect(u.campaign.world.one('at', 'party')).toBe('pghessil__square');
  }, 180000);
});

