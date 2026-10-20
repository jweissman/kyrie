/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../bin/site-build';
import { MonoBrowser as MonoJourney } from './support/mono-browser';
import { CaughtJourney, type MapState } from '../bin/record-caught-below';
import { PlaySession, type Transcript } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';

// Real Chromium playing both installations of "Caught Below". Opt in with KYRIE_BROWSER=1.
describe.skipIf(!process.env.KYRIE_BROWSER)('Caught Below in a real browser', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoJourney.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-caught-'));
    await SiteBuild.site(site);
    browser = await MonoJourney.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([['river', 1440, 900, false], ['quarry', 390, 844, true]] as const)(
    'plays the %s installation; the map marks where the company is and what stands in each way', async (campaign, width, height, pointer) => {
      const { page, errors, driver } = await MonoJourney.page(browser, { width, height },
        { site, pointer, query: `?campaign=${CaughtJourney.campaigns[campaign]}` });
      const maps: Record<string, MapState & { place?: string; scroll: boolean }> = {};
      const play = campaign === 'river' ? CaughtJourney.river.bind(CaughtJourney) : CaughtJourney.quarry.bind(CaughtJourney);
      await play(driver, async name => {
        maps[name] = { ...await CaughtJourney.map(page), place: (await driver.inspect()).place?.id,
          scroll: (await MonoJourney.metrics(page)).scroll };
      });
      expect(errors).toEqual([]);
      for (const [name, m] of Object.entries(maps)) {
        expect([name, m.scroll]).toEqual([name, false]);
        // The company sheet replaces the play screen; every other screen carries the map.
        if (!name.endsWith('company')) { expect([name, m.here]).toEqual([name, m.place]); }
      }
      if (campaign === 'river') {
        expect(CaughtJourney.edge(maps['05-hound']!.edges, 'hoist_passage')).toBe('guarded');
        expect(CaughtJourney.edge(maps['06-pinned']!.edges, 'hoist_passage')).toBe('open');
        expect(maps['01-quay']!.places.some(p => p.endsWith('__hoist'))).toBe(false);
      } else {
        expect(CaughtJourney.edge(maps['02-ladder']!.edges, 'ladder_shaft')).toBe('hazard');
        expect(CaughtJourney.edge(maps['03-freed']!.edges, 'ladder_shaft')).toBe('open');
        expect(maps['01-marrit']!.places.some(p => p.endsWith('__lower_gallery'))).toBe(false);
      }
      const closing = campaign === 'river' ? 'culvert' : 'beck_lane';
      const late = Object.values(maps).at(-1)!;
      const transcript = await page.evaluate(() => (window as unknown as {
        kyrieMono: { exportTranscript(): Transcript } }).kyrieMono.exportTranscript());
      const replay = await PlaySession.start(transcript.scenario, transcript.seed, NodeBundleSource.shared,
        transcript.party);
      await replay.replay(transcript.steps);
      expect(replay.campaign.world.test(ModuleWriter.call('rescue__reunited', 'rescue__guest'))).toBe(true);
      const shut = replay.campaign.world.test(ModuleWriter.call('state', 'rescue__water', 'rescue__closed'));
      const closed = CaughtJourney.edge(late.edges, closing);
      if (shut && closed) { expect(closed).toBe('blocked'); }
      await page.close();
    }, 300000);
  it('selecting a row only shows its actions; nothing happens until one is chosen', async () => {
    const { page, errors, driver } = await MonoJourney.page(browser, { width: 1440, height: 900 },
      { site, query: `?campaign=${CaughtJourney.campaigns.river}` });
    await driver.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]');
    const steps = () => page.evaluate(() => (window as unknown as {
      kyrieMono: { exportTranscript(): Transcript } }).kyrieMono.exportTranscript().steps.length);
    for (const row of (await driver.inspect()).rows.map(r => r.id)) {
      await driver.open(row);
      expect([row, await steps()]).toEqual([row, 0]);
      await driver.key('Escape');
    }
    await driver.key('6'); await driver.key('6');
    expect(await steps()).toBe(1);
    expect(errors).toEqual([]);
    await page.close();
  }, 120000);
});
