/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import { MonoDriver } from './support/mono-driver';

// A long press's commitment secure on creation's sign and background pages (OR-91, the owner, 18 November: "I had to
// long-click commit several times for it to advance past the horoscope page, and similar issues with the background
// selection"). A row held with a real pointer (down, held past the hold's time, up), as a hand holds it: whether the
// page went on at the first hold, and whether what was pressed moved under the hand while it was held (its box before,
// during and after, and the layout shifts the page reported meanwhile). It fails where one hold was not enough; what
// moved is said beside it, as the probe's evidence. At a laptop's size and a phone's.
interface Held { page: string; holds: number; moved: number; shifts: number; boxes: number[][] }
class Holding {
  static readonly ms = 720;
  static at(page: Page) { return page.getAttribute('.creation', 'data-page'); }
  // On to a step, the first of each step before it held by the keys (as test/naming-browser goes).
  static async to(page: Page, step: string) {
    for (let i = 0; i < 14 && await Holding.at(page) !== step; i++) {
      const was = await Holding.at(page);
      await MonoDriver.enter(page, '.composed-rows [data-option]:not([data-option="more"]):not(:disabled) >> nth=0');
      await page.waitForFunction(p => document.querySelector('.creation')?.getAttribute('data-page') !== p, was,
        { timeout: 8000 });
    }
    expect(await Holding.at(page)).toBe(step);
  }
  static box(page: Page, selector: string): Promise<number[]> {
    return page.locator(selector).first().evaluate(e => { const r = e.getBoundingClientRect();
      return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; });
  }
  // The row held by the hand until the page goes on, up to three holds: how many it took, and what moved.
  static async hold(page: Page): Promise<Held> {
    const step = (await Holding.at(page))!, row = '.composed-rows [data-option]:not([data-option="more"]):not(:disabled)';
    await page.evaluate(() => {
      const w = window as unknown as { shifts: number };
      w.shifts = 0;
      new PerformanceObserver(l => { w.shifts += l.getEntries().length; }).observe({ type: 'layout-shift' });
    });
    const boxes: number[][] = [];
    let holds = 0;
    for (; holds < 3 && await Holding.at(page) === step; holds++) {
      const before = await Holding.box(page, row);
      boxes.push(before);
      await page.mouse.move(before[0]! + before[2]! / 2, before[1]! + before[3]! / 2);
      await page.mouse.down();
      await page.waitForTimeout(Holding.ms / 2);
      if (await Holding.at(page) === step) { boxes.push(await Holding.box(page, row)); }
      await page.waitForTimeout(Holding.ms / 2);
      await page.mouse.up();
      await page.waitForFunction(p => document.querySelector('.creation')?.getAttribute('data-page') !== p, step,
        { timeout: 2500 }).catch(() => undefined);
    }
    const shifts = await page.evaluate(() => (window as unknown as { shifts: number }).shifts);
    const moved = Math.max(0, ...boxes.slice(1).map(b => Math.hypot(b[0]! - boxes[0]![0]!, b[1]! - boxes[0]![1]!)));
    return { page: step, holds: await Holding.at(page) === step ? holds + 1 : holds, moved: Math.round(moved), shifts,
      boxes };
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('a long press on creation\'s pages', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-hold-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1280, 800], [390, 844]] as const)('at %ix%i commits the sign and the life before at the first hold',
    async (width, height) => {
      const { page, errors } = await MonoBrowser.page(browser, { width, height }, { site, query: '?world=a1' });
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      const held: Held[] = [];
      for (const step of ['sign', 'before']) {
        await Holding.to(page, step);
        held.push(await Holding.hold(page));
      }
      console.log(`HOLD ${width}x${height} ${JSON.stringify(held)}`);
      // Each page went on at its first hold (more than three, or none, is told as four).
      expect(held.map(h => [h.page, h.holds])).toEqual([['sign', 1], ['before', 1]]);
      expect(errors).toEqual([]);
      await page.close();
    }, 240000);
});
