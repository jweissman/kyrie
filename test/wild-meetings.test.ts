import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ModuleWriter } from '../src/lang/module-writer';
import { Travel } from '../src/session/travel';
import { Terrain } from '../src/world/land/terrain';
import { RegionGeography } from '../src/world/region-geography';
import { RegionMeetings, type Meeting } from '../src/world/region-meetings';
import { RegionTracts } from '../src/world/region-tracts';
import { RegionSites } from '../src/world/region-sites';
import type { Region } from '../src/world/region-writer';
import { GeneratedWorld } from './support/generated';
import { Glanced } from './support/glanced';

// What is met with in the open country (the owner's OWN-27): a few dozen stretches of each country hold something,
// drawn by their land from data/generation/wild/meetings.kyrt, one near each town at the edge of what it knows; a
// meeting that leads somewhere gives the way to a site beyond (REV-08); a cache has its sign before it is searched
// for, and a search where nothing is hidden says so (REV-02); and a journey across the country stops at a meeting the
// first time it comes to it.
class Wild {
  static async start(): Promise<{ s: PlaySession; region: Region; meetings: Meeting[] }> {
    // kite: jade's assembled country no longer draws a cache (7 November), and the test wants one.
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source);
    return { s, region: w.report.region, meetings: RegionMeetings.meetings(w.report.region) };
  }
  static knows(s: PlaySession, fact: string): boolean {
    return s.campaign.world.test(ModuleWriter.call('knows', s.campaign.playerActor!, `region__${fact}`));
  }
  static async said(s: PlaySession, name: RegExp): Promise<string> {
    const c = PlayerView.choices(s.campaign).find(x => name.test(x.choice.name));
    if (!c) { throw new Error(`Nothing to do like ${name}`); }
    const before = PlayerView.observe(s.campaign), event = await s.leg(c.choice.id);
    const f = ActionFeedbackView.read(s.campaign, event, before);
    return [f.result, ...f.observations, ...f.events, ...f.immediate].join(' ');
  }
  // What the page leads with here, and why.
  static led(s: PlaySession): [string, string][] {
    return Glanced.of(s).glance.acts.map(a => [a.command ?? a.choice, a.why]);
  }
  static seen(s: PlaySession): string { return PlayerView.observe(s.campaign).observations.map(o => o.text).join(' '); }
}

describe('the open country\'s meetings', () => {
  it('are a bounded few in each country, drawn by the land, one at the edge of each town\'s country', () => {
    for (const seed of ['kite', 'wren', 'a1']) {
      const region = WorldAssembler.region(seed, [0, 0]), land = RegionGeography.atlas(region).land;
      const meetings = RegionMeetings.meetings(region);
      expect(meetings.length).toBeGreaterThanOrEqual(10);
      expect(meetings.length).toBeLessThanOrEqual(RegionMeetings.most);
      expect(new Set(meetings.map(m => m.section.option)).size).toBeGreaterThanOrEqual(5);
      expect(RegionMeetings.meetings(region).map(m => `${m.cell}:${m.section.option}`))
        .toEqual(meetings.map(m => `${m.cell}:${m.section.option}`));
      for (const t of region.settlements.filter(x => x.cell !== undefined)) {
        expect(meetings.some(m => Terrain.distance(land, m.cell, t.cell!) <= 3)).toBe(true);
      }
      // Every lead names a site that is there, and a danger is away from the roads and towns.
      expect(meetings.filter(m => m.section.said.includes('lead')).every(m => m.lead)).toBe(true);
      const busy = [...RegionGeography.roads(region).flatMap(r => r.route.cells),
        ...region.settlements.map(t => t.cell!)];
      expect(meetings.filter(m => m.section.said.includes('danger'))
        .every(m => busy.every(c => Terrain.distance(land, c, m.cell) >= 2))).toBe(true);
      // Where a site's track goes off unseen, something is noticed there first (REV-02).
      const deep = region.sites.filter(w => w.zone && (w.part ?? 0) > 0 && !w.work?.great).length;
      const hints = RegionSites.lines(region).filter(l => / as sign when not knows\(party, w\d+_found\)/.test(l));
      expect([deep > 0, hints.length > 0]).toEqual([deep > 0, deep > 0]);
    }
  });
  it('lead on into the wild, keep a cache under its sign, and stop a journey the first time', async () => {
    const { s, region, meetings } = await Wild.start();
    // Tracks seen are a way toward the site they go to; followed, the way to it (REV-08).
    const tracks = meetings.find(m => m.section.option === 'tracks')!;
    GeneratedWorld.put(s, RegionTracts.id(tracks.cell));
    await s.leg('wait');
    expect(Wild.knows(s, `wm${tracks.cell}_trail`)).toBe(true);
    for (let k = 0; k < 8 && !Wild.knows(s, `${tracks.lead!.site.id}_found`); k++) {
      await Wild.said(s, /^Follow the tracks/);
    }
    expect(Wild.knows(s, `${tracks.lead!.site.id}_found`)).toBe(true);
    // A cache: its sign first, then found by searching, then there to take.
    const cache = meetings.find(m => m.section.option === 'cache')!;
    GeneratedWorld.put(s, RegionTracts.id(cache.cell));
    await s.leg('wait');
    expect(Wild.seen(s)).toContain('Three stones are set one on another');
    expect(Wild.led(s)).toContainEqual([`search(region__t${cache.cell})`, 'sign']);
    expect(await Wild.said(s, /^Search /)).toContain('a bundle done up in oilcloth');
    expect(PlayerView.choices(s.campaign).some(c => /pitched torch/.test(c.choice.name))).toBe(true);
    // Where nothing is hidden out of doors, no search is offered (the owner, 6 November: search where it finds).
    const land = RegionGeography.atlas(region).land, standing = new Set(RegionTracts.standing(region).map(x => x.cell));
    const plain = RegionTracts.cells(region).find(c => !standing.has(c)
      && meetings.every(m => Terrain.distance(land, m.cell, c) > 3))!;
    GeneratedWorld.put(s, RegionTracts.id(plain));
    await s.leg('wait');
    expect(Wild.led(s).filter(([c]) => c.startsWith('search('))).toEqual([]);
    expect(PlayerView.choices(s.campaign).some(c => /^Search /.test(c.choice.name))).toBe(false);
    // Crossing the country past a meeting not yet come to, the journey stops there.
    const other = meetings.find(m => !['tracks', 'cache'].includes(m.section.option) && !m.section.said.includes('danger'))!;
    const about = RegionTracts.neighbours(other.cell, land.width, land.height);
    const from = about[0]!, to = about.find(c => c !== from && !RegionTracts.neighbours(from, land.width, land.height)
      .includes(c))!;
    GeneratedWorld.put(s, RegionTracts.id(from));
    await s.leg('wait');
    const done = await Travel.go({ campaign: s.campaign, perform: (c: string) => s.leg(c) }, `region__t${to}`);
    expect(done.legs.at(-1)?.command).toEndWith(`,region__t${other.cell})`);
    expect([done.arrived, done.stopped]).toEqual([false, 'Something is going on here']);
  }, 120000);
  // Kite come home as kin: the father went out by the bridge on the Brightbridge road. Out in the open country, with
  // no way to it known, the glance had led only with looking out; it leads with the step toward it (REV-08).
  it('leads a step toward the aim from the open country when no way to it is known', async () => {
    const g = await Glanced.country('kite');
    GeneratedWorld.put(g.s, 't100');
    const glance = await g.perform('wait');
    const step = glance.acts.find(a => a.why === 'toward')!;
    expect(g.screen.exits.find(e => e.id === step.choice)?.bearing).toBe('east');
  }, 120000);
});
