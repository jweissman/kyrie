/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The page in proportion at every size (OR-1085, the review of the 820x1180 contact sheet): every row and tab a finger
// takes at least 44 px tall and 8 px or more from the next, the rail's marks among them, folded and taken up, at a
// desk's size, an upright tablet's and a phone's; on the tablet the title, Options and the telling set at a tablet's
// size, not a desktop's; the books' tabs and the encyclopedia's tables the same, the open tab underlined in ink.
interface Box { what: string; x: number; y: number; w: number; h: number }
class Targets {
  // The boxes of what the selector names that are drawn and visible.
  static async boxes(page: Page, selector: string): Promise<Box[]> {
    return page.locator(selector).evaluateAll(es => es.flatMap(e => {
      const r = e.getBoundingClientRect(), s = getComputedStyle(e);
      if (!r.width || !r.height || s.visibility === 'hidden' || s.display === 'none') { return []; }
      return [{ what: (e.textContent || e.getAttribute('aria-label') || e.className).trim().slice(0, 40),
        x: r.x, y: r.y, w: r.width, h: r.height }];
    }));
  }
  // Each too short, and each pair overlapping in the other axis that stands nearer than 8 px.
  static faults(boxes: Box[]): string[] {
    const short = boxes.filter(b => b.h < 43.5 || b.w < 43.5).map(b => `${b.what}: ${Math.round(b.w)}x${Math.round(b.h)}`);
    const near = boxes.flatMap((a, i) => boxes.slice(i + 1).flatMap(b => {
      const across = Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w);
      const down = Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h);
      const apart = across < 0 ? down : down < 0 ? across : Infinity;
      return apart < 7.5 ? [`${a.what} / ${b.what}: ${Math.round(apart)} px`] : [];
    }));
    return [...short, ...near];
  }
  static async size(page: Page, selector: string): Promise<number> {
    return page.locator(selector).first().evaluate(e => parseFloat(getComputedStyle(e).fontSize));
  }
}
describe.skipIf(!process.env.KYRIE_BROWSER)('the page in proportion', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-scale-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  const rows = '.choice-row, .way-in';
  for (const [width, height] of [[1280, 800], [820, 1180], [390, 844]] as const) {
    const tablet = width === 820;
    it(`the title and Options at ${width}`, async () => {
      const { page } = await MonoBrowser.page(browser, { width, height }, { site, query: '' });
      await page.waitForSelector('.beat-ready');
      expect(Targets.faults(await Targets.boxes(page, '.title-menu .way-in'))).toEqual([]);
      if (tablet) { expect(await Targets.size(page, '.title-menu .way-in .row-label')).toBeGreaterThanOrEqual(17); }
      await page.click('[data-action="options"]'); await page.waitForSelector('[data-mode="options"]');
      expect(Targets.faults(await Targets.boxes(page, `.options-page :is(${rows})`))).toEqual([]);
      if (tablet) { expect(await Targets.size(page, '.options-page .choice-row')).toBeGreaterThanOrEqual(17); }
      await page.close();
    }, 120000);
    it(`the resting scene, its rows and its rail at ${width}`, async () => {
      const { page, driver } = await MonoBrowser.page(browser, { width, height }, { site, query: '?world=a1' });
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      await page.click('[data-action="start"]'); await driver.settle();
      expect(Targets.faults(await Targets.boxes(page, '.world-page .focus ol.led .choice-row'))).toEqual([]);
      expect(Targets.faults(await Targets.boxes(page, '.scene-rail .rail-mark'))).toEqual([]);
      await page.click('[data-action="lenses"]');
      await page.waitForSelector('.scene-rail.unfolded .lenses-fold', { state: 'visible' });
      const marks = await Targets.boxes(page, '.scene-rail .rail-mark');
      expect(marks.length).toBeGreaterThan(4);
      expect(Targets.faults(marks)).toEqual([]);
      // Inside the screen, and clear of the rows above them.
      for (const m of marks) { expect(m.x).toBeGreaterThanOrEqual(0); expect(m.x + m.w).toBeLessThanOrEqual(width); }
      const lowest = Math.max(...(await Targets.boxes(page, '.world-page .focus ol.led .choice-row')).map(b => b.y + b.h));
      expect(Math.min(...marks.map(m => m.y))).toBeGreaterThan(lowest);
      if (tablet) { expect(await Targets.size(page, '.setting > p')).toBeGreaterThanOrEqual(18); }
      await page.close();
    }, 120000);
    it(`the books' tabs and the encyclopedia's tables at ${width}`, async () => {
      const { page } = await MonoBrowser.page(browser, { width, height }, { site, query: '' });
      await page.goto(`file://${join(site, 'handbook/phb.html')}`);
      const tabs = await Targets.boxes(page, '.books a');
      expect(Targets.faults(tabs)).toEqual([]);
      const open = page.locator('.books a[aria-current]').first();
      expect(await open.evaluate(e => [getComputedStyle(e).borderBottomWidth, getComputedStyle(e).backgroundColor]))
        .toEqual(['2px', 'rgba(0, 0, 0, 0)']);
      await page.goto(`file://${join(site, 'encyclopedia/arms.html')}`);
      expect(Targets.faults(await Targets.boxes(page, '.bar nav a').then(b => b.map(x => ({ ...x, w: Math.max(x.w, 44) })))))
        .toEqual([]);
      if (tablet) { expect(await Targets.size(page, 'td')).toBeGreaterThanOrEqual(16); }
      await page.close();
    }, 120000);
  }
});
