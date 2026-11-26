/// <reference lib="dom" />
// OR-300 in the browser, at a desk's size and a phone's: a game kept, paused from the Book's Options and left by
// Return to title; the title then offers Continue and New Game, the engine's rows (OR-1072); Continue takes the game up
// where it stood. A kept game this build cannot open is refused when tried, said plainly on the title, and remembered
// after a reload, Continue gone; New Game asks how the new life begins (no map: OR-1271). Opt in with
// KYRIE_BROWSER=1.
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// Options and Quit, the title's rows after its ways in (OR-382, OR-1072).
const apart = ['options', 'quit'];
const ways = (page: Page) => page.$$eval('.title-menu [data-action]', els => els.map(e => e.getAttribute('data-action')));
describe.skipIf(!process.env.KYRIE_BROWSER)('the ways in, and back to the title from a game', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => { site = await mkdtemp(join(tmpdir(), 'kyrie-ways-')); await SiteBuild.site(site, {}); browser = await MonoBrowser.launch(); }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  for (const size of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    it(`offers Continue and New Game at ${size.width}×${size.height}, and refuses what it cannot open`,
      async () => {
        const { page, driver, errors } = await MonoBrowser.page(browser, size, { site, pointer: false, query: '' });
        await page.waitForSelector('.title-menu .way-in', { timeout: 120000 });
        expect(await ways(page)).toEqual(['begin', ...apart]);
        const base = page.url().split('?')[0]!;
        await page.goto(`${base}?world=a1`);
        await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
        await page.click('[data-action="start"]');
        await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
        await driver.settle();
        await page.waitForTimeout(3000);
        const before = (await driver.inspect()).place?.id;
        // The Book's Options: the game paused, its two ways the engine's.
        await page.click('[data-action="book"]');
        await page.click('[data-action="options"]');
        await page.waitForSelector('[data-mode="options"]', { timeout: 5000 });
        expect(await page.$$eval('.options-page .rows.back [data-action]', els => els.map(e => e.textContent?.trim())))
          .toEqual(['Back to the game', 'Return to title']);
        await page.click('.options-page .rows.back [data-action="title"]');
        await page.waitForSelector('[data-action="continue"]', { timeout: 10000 });
        expect(await ways(page)).toEqual(['continue', 'begin', ...apart]);
        await page.click('[data-action="continue"]');
        await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
        await driver.settle();
        expect((await driver.inspect()).place?.id).toBe(before);
        // A kept game this build cannot open: tried, refused, said; and after a reload, said again, Continue gone.
        await page.evaluate(() => {
          const about = JSON.parse(localStorage.getItem('kyrie.mono.v1.summary')!) as { stateSlot: string };
          localStorage.setItem(`kyrie.mono.v1.${about.stateSlot}`, '{"version":2,"world":"gone"}');
        });
        await page.goto(base);
        await page.waitForSelector('[data-action="continue"]', { timeout: 60000 });
        await page.click('[data-action="continue"]');
        await page.waitForSelector('[data-id="refused"]', { timeout: 60000 });
        expect(await ways(page)).toEqual(['begin', ...apart]);
        await page.reload();
        await page.waitForSelector('[data-id="refused"]', { timeout: 60000 });
        expect(await ways(page)).toEqual(['begin', ...apart]);
        const told = await page.locator('[data-id="refused"]').boundingBox();
        expect(told!.x).toBeGreaterThanOrEqual(0);
        expect(told!.x + told!.width).toBeLessThanOrEqual(size.width);
        await page.click('[data-action="begin"]');
        // No map asked (OR-1271): New Game's acts, the saved game replaced as one sets out.
        await page.waitForSelector('[data-mode="begin"] [data-action="build"]', { timeout: 5000 });
        expect(errors).toEqual([]);
      }, 600000);
  }
});
