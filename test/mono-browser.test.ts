/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../bin/site-build';
import { MonoJourney } from '../bin/record-mono';
import { PlaySession, type Transcript } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';

// Real Chromium playing the built static client. Opt in with KYRIE_BROWSER=1 (Playwright Chromium installed;
// KYRIE_CHROMIUM may name another executable). Assertions use semantic ids, not coordinates or prose.
const enabled = !!process.env.KYRIE_BROWSER;
describe.skipIf(!enabled)('Mono client in a real browser', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoJourney.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-mono-'));
    await SiteBuild.site(site);
    browser = await MonoJourney.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([['keyboard', 1440, 900, false], ['pointer', 390, 844, true]] as const)(
    'plays the reference journey by %s at %ix%i without scrolling the page', async (_how, width, height, pointer) => {
      const { page, errors, driver } = await MonoJourney.page(browser, { width, height }, { site, pointer });
      const overflow: string[] = [];
      await MonoJourney.journey(driver, async name => {
        const m = await MonoJourney.metrics(page);
        if (m.scroll) { overflow.push(name); }
      });
      const final = await driver.inspect();
      expect(errors).toEqual([]);
      expect(overflow).toEqual([]);
      expect(final.mode).toBe('explore');
      expect(final.place?.id).toBe('march__quay');
      expect(final.rows.some(r => r.id === 'march__pell')).toBe(true);
      expect(final.log.length).toBeGreaterThan(0);
      const transcript = await page.evaluate(() => (window as unknown as {
        kyrieMono: { exportTranscript(): Transcript } }).kyrieMono.exportTranscript());
      const replayed = await PlaySession.start(transcript.scenario, transcript.seed, NodeBundleSource.shared,
        transcript.party);
      await replayed.replay(transcript.steps);
      const world = replayed.campaign.world;
      expect(world.test(ModuleWriter.call('at', 'march__pell', 'march__quay'))).toBe(true);
      expect(world.test(ModuleWriter.call('dead', 'march__roost'))).toBe(true);
      expect(world.test(ModuleWriter.call('armed', 'march__counterweight'))).toBe(false);
      expect(world.test(ModuleWriter.call('triggered', 'march__miasma'))).toBe(true);
      expect(transcript.steps.some(st => st.combat?.length)).toBe(true);
      const bran = replayed.campaign.state.creatures.find(c => c.name === 'Bran')!;
      expect(bran.state.inventory?.some(i => i.id === 'march__line_cache' && i.equipped)).toBe(true);
      await page.close();
    }, 300000);

  it('keeps one fixed game screen at a laptop size across modes', async () => {
    const { page, driver } = await MonoJourney.page(browser, { width: 1024, height: 768 }, { site });
    await driver.click('[data-action="start"]');
    for (const key of ['i', 'c', 'j', 'e']) {
      await driver.mode(key);
      expect((await MonoJourney.metrics(page)).scroll).toBe(false);
      expect((await driver.inspect()).mode).toBe({ i: 'pack', c: 'party', j: 'journal', e: 'explore' }[key]!);
    }
    await page.reload();
    await page.waitForSelector('[data-mode="explore"]');
    expect((await driver.inspect()).place?.id).toBe('march__quay');
    await page.close();
  }, 120000);
});
