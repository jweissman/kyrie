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
        { site, pointer, query: `?campaign=data/caught-below/${campaign}.campaign.json` });
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
        expect(maps['05-hound']!.edges['world__hoist_passage']).toBe('guarded');
        expect(maps['06-pinned']!.edges['world__hoist_passage']).toBe('open');
        expect(maps['01-quay']!.places).not.toContain('world__hoist');
      } else {
        expect(maps['02-ladder']!.edges['world__ladder_shaft']).toBe('hazard');
        expect(maps['03-freed']!.edges['world__ladder_shaft']).toBe('open');
        expect(maps['01-marrit']!.places).not.toContain('world__lower_gallery');
      }
      const closing = campaign === 'river' ? 'world__culvert' : 'world__beck_lane';
      const late = Object.values(maps).at(-1)!;
      const transcript = await page.evaluate(() => (window as unknown as {
        kyrieMono: { exportTranscript(): Transcript } }).kyrieMono.exportTranscript());
      const replay = await PlaySession.start(transcript.scenario, transcript.seed, NodeBundleSource.shared,
        transcript.party);
      await replay.replay(transcript.steps);
      expect(replay.campaign.world.test(ModuleWriter.call('rescue__reunited', 'rescue__guest'))).toBe(true);
      const shut = replay.campaign.world.test(ModuleWriter.call('state', 'rescue__water', 'rescue__closed'));
      if (shut && late.edges[closing]) { expect(late.edges[closing]).toBe('blocked'); }
      await page.close();
    }, 300000);
});
