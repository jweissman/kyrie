/// <reference lib="dom" />
// The backstage's tabs, one navigation instrument (OR-306, the owner's playtests of 23-24 November: "a standard
// navigation instrument, at a fixed hard top, cycled by left/right"): from any page of the Book, the right arrow opens
// the next page and the left the one before, round again at the ends; the tabs stand at the same place at the top on
// every page, however each page runs. At a desk's size and a phone's. Opt in with KYRIE_BROWSER=1.
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

const at = (page: Page) => page.evaluate(() => {
  const on = document.querySelector<HTMLElement>('.sheet-key[aria-pressed="true"]');
  const r = document.querySelector('.sheets')!.getBoundingClientRect();
  return { view: on?.dataset.view, top: Math.round(r.top), left: Math.round(r.left) };
});
describe.skipIf(!process.env.KYRIE_BROWSER)('the backstage tabs', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => { site = await mkdtemp(join(tmpdir(), 'kyrie-tabs-')); await SiteBuild.site(site, {}); browser = await MonoBrowser.launch(); }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  for (const size of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    it(`are cycled by left and right, fixed at the top, at ${size.width}×${size.height}`, async () => {
      const { page, driver, errors } = await MonoBrowser.page(browser, size, { site, pointer: false, query: '?world=a1' });
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      await page.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
      await driver.settle();
      await page.keyboard.press('j');
      await page.waitForSelector('.sheet-key[aria-pressed="true"][data-view="journal"]');
      const seen = [await at(page)];
      for (const key of ['ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowLeft']) {
        await page.keyboard.press(key); await driver.settle(); seen.push(await at(page));
      }
      expect(seen.map(s => s.view)).toEqual(['journal', 'pack', 'story', 'company', 'journal', 'company']);
      expect(new Set(seen.map(s => `${s.top},${s.left}`)).size).toBe(1);
      expect(errors).toEqual([]);
      await page.close();
    }, 300000);
  }
});
