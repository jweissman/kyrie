/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The way a journey would go is laid on the map before it is set out on (OPR-03: "the route preview no longer shows
// before setting out", counted fixed as not reproduced headlessly, and never checked in the page). The map raised from
// the stage (M) had been given no plan: it laid its own shortest way over the land known, and nothing where any of it
// lay under the mist. In a1 a debtor in Lowmouth chooses Mistshaw, two and a half hours by the road, most of it unseen:
// the way is laid over every hex of it, from Lowmouth to the town.
describe.skipIf(!process.env.KYRIE_BROWSER)('a place chosen on the map', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-route-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('is laid on the map before setting out, over the mist too', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: false, query: '?world=a1' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await driver.click('[data-action="origin"][data-id="debt"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
    await page.keyboard.press('m');
    await page.waitForSelector('.field-land.board[data-board="ready"]', { timeout: 120000 });
    await page.focus('[data-action="map-place"][data-id="region__s4"]');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => Number(document.querySelector('.field-land.board')?.getAttribute('data-way')) > 0,
      null, { timeout: 10000 }).catch(() => undefined);
    const laid = Number(await page.getAttribute('.field-land.board', 'data-way'));
    expect(await page.textContent('.enter-card, .plan, .route-card')).toContain('Mistshaw');
    // Lowmouth's hex, the road's three, Mistshaw's (JourneyCourse.planned: 42, 43, 44, 45, 46).
    expect(laid).toBe(5);
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
  // Its card's "Around Lowmouth, 13 places" is the way back to where the company stands, among them: it had only shut
  // the map, a list promised and none shown (the second blind playtest, BL-05: "Around Harewater, 25 places"). It
  // opens the place's ways (Go…).
  it('goes back among the places it counts, their ways open', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: false, query: '?world=a1' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await driver.click('[data-action="origin"][data-id="debt"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
    await page.keyboard.press('m');
    await page.waitForSelector('.field-land.board[data-board="ready"]', { timeout: 120000 });
    await page.focus('[data-action="map-place"][data-id="region__z3_edge"]');
    await page.keyboard.press('Enter');
    expect(await page.textContent('[data-action="explore-nearby"]')).toMatch(/^Around Lowmouth\d+ places$/);
    await page.click('[data-action="explore-nearby"]');
    await driver.settle();
    await page.waitForSelector('.glance .lens [data-act]', { timeout: 10000 }).catch(() => undefined);
    const after = await page.evaluate(() => ({ map: !!document.querySelector('.world-page.scale-board'),
      ways: [...document.querySelectorAll('.glance .lens [data-act]')].map(e => e.getAttribute('data-act')) }));
    expect(after.map).toBe(false);
    expect(after.ways.length).toBeGreaterThan(0);
    // Each a way: one out of where the company stands (exit:), or a walk to another place of the town (travel:).
    expect(after.ways.every(a => /^(exit|travel):/.test(a ?? ''))).toBe(true);
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
});
