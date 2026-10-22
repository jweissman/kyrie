import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Frontier } from '../src/world/frontier';
import { WorldGrid } from '../src/world/world-grid';
import { GeneratedWorld } from './support/generated';

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
    // Nothing placed in the first region is placed again in the second.
    expect(drawn!.region!.sites.length).toBeGreaterThan(4);
    const bare = (id: string) => id.replace(/^x1y0/, '').replace(/\d+$/, '');
    const home = new Set(s.campaign.installed.filter(id => !/^(x1y0|link)/.test(id)).map(bare));
    const there = s.campaign.installed.filter(id => /^x1y0./.test(id)).map(bare).filter(id => id !== 'word');
    expect(there.length).toBeGreaterThan(0);
    expect(there.filter(id => home.has(id))).toEqual([]);
    await March.choose(s, /^Take the road across the march to the western edge of /);
    expect(s.campaign.world.one('at', 'party')).toBe('x1y0__edge_west');
    await March.choose(s, /^Take the old road west to /);
    expect(s.campaign.world.one('at', 'party')).toMatch(/^x1y0__s\d+_green$/);
    // Saved there and opened again, the company is still in the country beyond, and can go on in it.
    const back = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())));
    expect(back.campaign.world.one('at', 'party')).toMatch(/^x1y0__s\d+_green$/);
    expect(PlayerView.choices(back.campaign).some(c => /^Take the door of /.test(c.choice.name))).toBe(true);
    expect(back.campaign.module.entities.find(e => e.id === 'x1y0__region')?.name).toBe(east.name);
  }, 120000);
});
