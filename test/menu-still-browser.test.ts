/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The menu holds still while an act is taken (M22's third review, OR-47: as a hold began, an echo of what was done had
// been set above the telling and every row moved about 32 px, out from under the finger): pressed, and while the
// engine answers, every row of the four stands where it stood.
class Rows {
  static boxes(page: Page): Promise<string[]> {
    return page.evaluate(() => [...document.querySelectorAll('.glance [data-menu] .choice-row')].map(e => {
      const r = e.getBoundingClientRect();
      return `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)},${Math.round(r.height)}`;
    }));
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the menu while an act is taken', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-still-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  for (const size of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    it(`stands still at ${size.width}×${size.height}`, async () => {
      const { page, errors, driver: d } = await MonoBrowser.page(browser, size, { site, query: '?world=a1' });
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      await page.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 }); await d.settle(); await d.enter();
      await page.waitForTimeout(800);
      // An act done where the company stands: the wagoner's wheel (it neither talks nor goes anywhere).
      const row = page.locator('.glance [data-menu] .choice-row', { hasText: /wheel/i }).first();
      expect(await row.count()).toBe(1);
      const before = await Rows.boxes(page), b = (await row.boundingBox())!;
      await page.mouse.move(b.x + 40, b.y + b.height / 2); await page.mouse.down();
      await page.mouse.up();
      const during: string[][] = [];
      for (let i = 0; i < 20 && !await page.locator('.stage[aria-busy]').count(); i++) { await page.waitForTimeout(10); }
      for (let i = 0; i < 5; i++) { during.push(await Rows.boxes(page)); await page.waitForTimeout(15); }
      for (const now of during.filter(x => x.length === before.length)) { expect(now).toEqual(before); }
      await d.settle();
      expect(errors).toEqual([]);
      await page.close();
    }, 240000);
  }
});
