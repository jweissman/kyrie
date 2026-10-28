/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The map is a thing to plan with (the play-structure investigation's PT-27: it could not be clicked): a place on it
// is chosen by pointing or by the keys, says whether the company has been there and the way there leg by leg, and
// sets out; the journey is told where it comes to. From the notes, too, each place known is somewhere to set out for
// (PT-25: the notes were a ledger, not a plan). Opt in with KYRIE_BROWSER=1.
describe.skipIf(!process.env.KYRIE_BROWSER)('the map and the notes, to plan with', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-map-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('chooses a town on the map, shows the way there, and sets out for it', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: false, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    const from = (await driver.inspect()).place?.id;
    await driver.mode('m');
    expect((await driver.inspect()).mode).toBe('map');
    // By the keys: the town is reached by Tab and chosen with Enter.
    await page.focus('[data-action="map-place"][data-id="region__s4"]');
    await page.keyboard.press('Enter');
    const plan = await page.textContent('.plan');
    expect(plan).toContain('Fearnglaed');
    expect(plan).toMatch(/By the .+ to /);
    await page.click('[data-action="set-out"]');
    await driver.settle();
    const after = await driver.inspect();
    expect([after.mode, after.place?.id !== from]).toEqual(['explore', true]);
    // The notes say where else the company could go, each with setting out.
    await driver.mode('j');
    expect(await page.locator('.going [data-action="set-out"]').count()).toBeGreaterThan(0);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
  // On a phone every name is set inside the map, nothing runs past the screen's edge, and the plan is under the map
  // (the register's NAV-05 and PRE-04: names cut on a phone; the map untested at 390 px).
  it('at 390 by 844: sets every name inside the map, and the plan under it', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 390, height: 844 },
      { site, pointer: true, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await driver.mode('m');
    const fit = await page.evaluate(() => {
      const map = document.querySelector('svg text.name-town')!.closest('svg')!.getBoundingClientRect();
      const names = Array.from(document.querySelectorAll('svg text'), t => t.getBoundingClientRect());
      return { names: names.length, inside: names.every(r => r.left >= map.left - 1 && r.right <= map.right + 1),
        wide: document.documentElement.scrollWidth > innerWidth,
        under: document.querySelector('.plan')!.getBoundingClientRect().top >= map.bottom };
    });
    expect(fit.names).toBeGreaterThan(4);
    expect(fit).toEqual({ names: fit.names, inside: true, wide: false, under: true });
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
});
