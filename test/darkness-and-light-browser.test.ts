/// <reference lib="dom" />
// The opening's first two revelations on the page (OR-441, the owner's direction of 24 November, §7): darkness, no
// painting and one obvious act, perhaps two, Light a torch among them; then light, which changes what is seen (the
// fall's painting, its telling) and what can be done (the way on into the adit). At a desk's size and a phone's.
// Opt in with KYRIE_BROWSER=1.
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

const look = (page: Page) => page.evaluate(() => ({
  dark: !!document.querySelector(':is(.world-page, .scene-page).dark'),
  painted: !!document.querySelector('.ambient:not(.unpainted)'),
  rows: [...document.querySelectorAll('ol.led [data-act]')].filter(e => (e as HTMLElement).offsetParent !== null)
    .map(e => (e as HTMLElement).innerText.replace(/\s+/g, ' ').trim()),
  told: document.querySelector('.told-col')?.textContent ?? '' }));
describe.skipIf(!process.env.KYRIE_BROWSER)('the dark, and a light made', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => { site = await mkdtemp(join(tmpdir(), 'kyrie-dark-')); await SiteBuild.site(site, {}); browser = await MonoBrowser.launch(); }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); }, 60000);
  for (const size of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    it(`begins in the dark with a light to make, and the light changes what is seen and done at ${size.width}×${size.height}`,
      async () => {
        const { page, driver: d, errors } = await MonoBrowser.page(browser, size, { site, query: '?world=iscoed' });
        await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
        await page.click('[data-action="start"]');
        await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
        await d.settle(); await page.waitForTimeout(800);
        const dark = await look(page);
        expect([dark.dark, dark.painted]).toEqual([true, false]);
        expect(dark.rows.length).toBeLessThanOrEqual(3);
        expect(dark.rows.some(r => /light a torch/i.test(r))).toBe(true);
        expect(dark.rows.some(r => /old gallery/i.test(r))).toBe(false);
        if (process.env.KYRIE_SHOTS) { await page.screenshot({ path: `${process.env.KYRIE_SHOTS}/dark-${size.width}.png` }); }
        await d.click('ol.led [data-act="light:region__party_1__torch"]'); await d.settle(); await page.waitForTimeout(800);
        const lit = await look(page);
        expect(lit.dark).toBe(false);
        expect(lit.rows.some(r => /old gallery/i.test(r))).toBe(true);
        expect(lit.told).toMatch(/broken shale and split timber/);
        if (process.env.KYRIE_SHOTS) { await page.screenshot({ path: `${process.env.KYRIE_SHOTS}/lit-${size.width}.png` }); }
        expect(errors).toEqual([]);
        await page.close();
      }, 300000);
  }
});
