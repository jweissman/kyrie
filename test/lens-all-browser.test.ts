/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// Every way a lens offers can be reached (the second blind playtest, BL-01, P0: the Go lens's whole list ran off the
// fixed screen and could not be scrolled by wheel, arrows or Tab; the inn the rail pointed to was among the ways out of
// reach). Unfolded whole, the lens takes what the column has left and scrolls within it; the page itself never
// scrolls. A town's camp, its Go lens unfolded: the last way is brought into view by scrolling the list, and taken.
describe.skipIf(!process.env.KYRIE_BROWSER)('a lens unfolded whole', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-lens-all-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  for (const [width, height] of [[1280, 800], [820, 1180]] as const) {
    it(`reaches its last way at ${width}×${height}`, async () => {
      const { page, driver } = await MonoBrowser.page(browser, { width, height }, { site, pointer: false,
        query: '?world=a1' });
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      await page.click('[data-action="start"]'); await driver.settle();
      const all = page.locator('.glance .lens [data-action="lens-all"]');
      // Walked in by the Go lens's first way until a place offers more ways than it shows.
      for (let step = 0; step < 8 && !await all.count(); step++) {
        if (await page.locator('.rail-mark.opens-go').count()) { await page.click('.rail-mark.opens-go'); await driver.settle(); }
        if (await all.count()) { break; }
        await page.locator('.glance .lens [data-act]').first().click(); await driver.settle();
      }
      await all.first().click(); await driver.settle();
      const reached = await page.evaluate(() => {
        const last = [...document.querySelectorAll<HTMLElement>('.glance .lens [data-act]')].at(-1)!;
        let e = last.parentElement;
        while (e && !(['auto', 'scroll'].includes(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight)) {
          e = e.parentElement;
        }
        if (e) { e.scrollTop = e.scrollHeight; }
        const r = last.getBoundingClientRect();
        const page = document.scrollingElement!.scrollTop;
        return { scrolls: !!e, inView: r.top >= 0 && r.bottom <= innerHeight, page };
      });
      expect(reached).toEqual({ scrolls: true, inView: true, page: 0 });
    }, 300000);
  }
});
