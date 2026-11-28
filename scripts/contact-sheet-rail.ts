/// <reference lib="dom" />
import type { Page } from 'playwright-core';
import { MonoBrowser } from '../test/support/mono-browser';
import type { MonoDriver } from '../test/support/mono-driver';
import { SheetHour } from './contact-sheet-hour';
import { SheetWalks, type SheetRun } from './contact-sheet-walks';

// The rail as the owner set it (27 November, late; OR-1880): in act I, at rest, the diamond dim beside the compass and
// the book; the compass taken up (the ways within the hex); the shrine's tower climbed, its view told as words alone;
// and with the lenses had, one of them holding something, the rail unfolded by the engine's hint (Rail.unfolded).
//   bun scripts/contact-sheets.ts --walks rail --sizes 1280x800,390x844
export class SheetRail {
  static async walk(run: SheetRun): Promise<void> {
    const { page, driver: d } = await MonoBrowser.page(run.browser, run.size, { site: run.site, query: '?world=a1&origin=wanderer',
      reduced: run.reduced });
    page.setDefaultTimeout(30000);
    const cam = SheetWalks.camera(run, page, 'rail', d), hour = new SheetHour(page, d, cam);
    await cam.step('rest-act-i', 'Act I at rest: the diamond dim, the compass and the book', async () => {
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      await page.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
    });
    await cam.step('compass', 'The compass taken up: the ways within the hex', () => SheetRail.compass(page, d));
    await page.keyboard.press('Escape'); await d.settle();
    await cam.step('climb', 'The shrine\'s tower climbed: what is seen, told as words', async () => {
      // Up from the approach to the landing, to the shrine, its tower climbed, each as a player chooses it.
      for (const way of [/^exit:region__s1_green/, /^exit:region__s1_shrine/]) {
        await d.pick(c => way.test(c.id), String(way));
      }
      // The tower among the things at hand, a page of the place's one menu, and its climb within it.
      for (const row of [/^Things at hand/, /tower/i, /^Climb/]) {
        const climb = page.locator('ol.led li', { hasText: /^Climb/ });
        const at = await climb.count() ? climb : page.locator('ol.led li', { hasText: row });
        await at.locator('button').first().click(); await d.settle();
        if (at === climb) { break; }
      }
    });
    await cam.step('lenses-had', 'The lenses had: the rail unfolded where one of them holds something', async () => {
      await page.evaluate(() => (window as unknown as { kyrieMono: { earn(): Promise<void> } }).kyrieMono.earn());
      await d.settle();
      await hour.to('region__s1_green');
    });
    await page.close();
  }
  // The compass's mark pressed, where it stands; else the places lens's, as before the compass was a tool of its own.
  private static async compass(page: Page, d: MonoDriver): Promise<void> {
    const mark = await page.locator('[data-action="compass"]').count() ? '[data-action="compass"]' : '.rail-mark.opens-go';
    if (await page.locator(mark).count()) { await page.click(mark); }
    await d.settle();
  }
}
