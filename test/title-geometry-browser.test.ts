/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The title's foreground is geometrically exact (the owner, 15 November: buttons of one width and alignment, concise
// labels, the saved game's description apart from the rows), measured in boxes, with and without a saved game, on a
// desk, on an iPad both ways up and on a phone: its rows the same box either way (OR-160). A page as any other
// (OR-382, the owner's ruling of 24 November): its name small over its rows (OR-501: no hero), in the frame's column at
// the right on a wide screen, centred upright or narrow, about the screen's middle line. Its rows are
// the engine's core four (OR-1072): Continue where a game is kept, New Game, Options and Quit. Opt in with
// KYRIE_BROWSER=1.
interface Box { x: number; y: number; width: number; height: number }
class Title {
  static async boxes(page: Page): Promise<{ rows: Box[]; texts: string[]; mark: Box; menu: Box; save?: Box;
    whys: number; view: { w: number; h: number } }> {
    return page.evaluate(() => {
      const box = (e: Element) => {
        const r = e.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      const rows = [...document.querySelectorAll('.title-menu .way-in')];
      const save = document.querySelector('.title-menu .save-line');
      return { rows: rows.map(box), texts: rows.map(r => (r as HTMLElement).innerText.trim()),
        mark: box(document.querySelector('.title-page .mark')!), menu: box(document.querySelector('.title-menu ul')!),
        ...save ? { save: box(save) } : {}, whys: document.querySelectorAll('.title-menu .way-in .why').length,
        view: { w: window.innerWidth, h: window.innerHeight } };
    });
  }
  static async ready(page: Page) {
    await page.waitForSelector('.title-menu .way-in', { timeout: 120000 });
    await page.keyboard.press('Shift'); await page.waitForTimeout(1500);
  }
  static check(t: Awaited<ReturnType<typeof Title.boxes>>, count: number) {
    const wide = t.view.w >= 900 && t.view.w > t.view.h;
    expect(t.rows).toHaveLength(count);
    expect(t.whys).toBe(0);
    expect(t.texts.every(x => x.length <= 18)).toBe(true);
    const first = t.rows[0]!, centre = t.view.w / 2;
    for (const r of t.rows) {
      expect(Math.abs(r.x - first.x)).toBeLessThan(0.6);
      expect(Math.abs(r.width - first.width)).toBeLessThan(0.6);
      expect(Math.abs(r.height - first.height)).toBeLessThan(0.6);
      if (!wide) { expect(Math.abs(r.x + r.width / 2 - centre)).toBeLessThan(1); }
    }
    const gaps = t.rows.slice(1).map((r, i) => r.y - (t.rows[i]!.y + t.rows[i]!.height));
    if (gaps.length) { expect(Math.max(...gaps) - Math.min(...gaps)).toBeLessThan(0.6); }
    // The name small, over the rows and at their left edge; on a wide screen at the hard right of it.
    // The tower glyph beside the name (OR-529) stands a little taller than its letters: 24 px, still small.
    expect(t.mark.height).toBeLessThanOrEqual(26);
    expect(t.mark.y + t.mark.height).toBeLessThanOrEqual(first.y);
    expect(Math.abs(t.mark.x - first.x)).toBeLessThan(0.6);
    if (wide) { expect(first.x).toBeGreaterThan(t.view.w / 2); }
    // The name and the ways in are one composition about the screen's middle.
    const top = t.mark.y, bottom = t.menu.y + t.menu.height;
    expect(Math.abs((top + bottom) / 2 - t.view.h / 2)).toBeLessThan(t.view.h * 0.12);
    if (t.save) { expect(t.save.y).toBeGreaterThanOrEqual(t.menu.y + t.menu.height); }
  }
}
describe.skipIf(!process.env.KYRIE_BROWSER)('the title page geometry', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => { site = await mkdtemp(join(tmpdir(), 'kyrie-title-')); await SiteBuild.site(site, {}); browser = await MonoBrowser.launch(); }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  // And a phone's (OR-160's last size: 390 had not been measured).
  const views = [{ width: 1280, height: 800 }, { width: 1180, height: 820 }, { width: 820, height: 1180 },
    { width: 390, height: 844 }];
  for (const size of views) {
    it(`is exact at ${size.width}×${size.height}, with and without a saved game`, async () => {
      const { page } = await MonoBrowser.page(browser, size, { site, pointer: false, query: '' });
      await Title.ready(page);
      const bare = await Title.boxes(page);
      // With nothing kept, one way in, New Game, then Options and Quit (OR-1072).
      Title.check(bare, 3);
      // A game kept (begun by the address, as the other specs do), then the title again with nothing in the address.
      const base = page.url().split('?')[0]!;
      await page.goto(`${base}?world=a1`);
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      await page.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
      await page.locator('[data-choice="exit:region__s2_green"], [data-pick="exit:region__s2_green"]').first().click();
      await page.waitForTimeout(5000);
      await page.goto(base);
      await page.waitForSelector('[data-action="continue"]', { timeout: 60000 });
      await Title.ready(page);
      const kept = await Title.boxes(page);
      // A game kept: New Game, Continue, Options and Quit, alike (OR-1072, OR-1683).
      Title.check(kept, 4);
      expect(kept.texts.map(t => t.toLowerCase())).toEqual(['new game', 'continue', 'options', 'quit']);
      await page.screenshot({ path: `/var/tmp/kyrie/title/title-${size.width}.png` });
      // The game it continues is said to a pointer and a reader only, never as a line of its own (the owner, 17
      // November); the rows are the same width and place with or without a save.
      expect(kept.save).toBeUndefined();
      expect(await page.getAttribute('[data-action="continue"]', 'aria-label')).toMatch(/^Continue: ./);
      expect(Math.abs(kept.rows[0]!.width - bare.rows[0]!.width)).toBeLessThan(0.6);
      expect(Math.abs(kept.rows[0]!.x - bare.rows[0]!.x)).toBeLessThan(0.6);
    }, 400000);
  }
});
