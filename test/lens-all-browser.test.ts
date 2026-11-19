/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import { LensPages } from './support/lens-pages';

// A lens is four acts at a time and never an expanding list (the owner, 16 November: four items in every context,
// lenses included): where it has more, a "More… n of N" row turns the page, the next acts in place of these, round to
// the first. Walked in by the Go lens's first way until a place offers more ways than four.
describe.skipIf(!process.env.KYRIE_BROWSER)('a lens, paged', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-lens-page-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  for (const [width, height] of [[1280, 800], [820, 1180]] as const) {
    it(`shows four at a time and pages round at ${width}×${height}`, async () => {
      const { page, driver } = await MonoBrowser.page(browser, { width, height }, { site, pointer: false,
        query: '?world=a1' });
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      await page.click('[data-action="start"]'); await driver.settle();
      const pager = page.locator(LensPages.pager);
      for (let step = 0; step < 8 && !await pager.count(); step++) {
        if (await page.locator('.rail-mark.opens-go').count()) { await page.click('.rail-mark.opens-go'); await driver.settle(); }
        if (await pager.count()) { break; }
        await page.locator('.glance .lens [data-act]').first().click(); await driver.settle();
      }
      expect(await pager.count()).toBe(1);
      const pages = Number(await pager.getAttribute('data-pages')), seen = new Set<string>();
      expect(pages).toBeGreaterThan(1);
      for (let at = 0; at < pages; at++) {
        // Its rows: acts, and the rows that gather acts by focus (a thing, a quarter of the town: AT-04's stopgap),
        // which do nothing of their own; a page of a town's ways may be all of those.
        const ids = await page.locator('.glance .lens :is([data-act], [data-action="focus"])')
          .evaluateAll(es => es.map(e => e.getAttribute('data-act') ?? e.getAttribute('data-choice') ?? ''));
        expect(ids.length).toBeGreaterThan(0);
        expect(ids.length).toBeLessThanOrEqual(4);
        for (const id of ids) { seen.add(id); }
        // Paging commits nothing: the pager is no act.
        expect(await pager.getAttribute('data-act')).toBeNull();
        await pager.click(); await driver.settle();
      }
      // Round to the first page, having shown more than four acts in all.
      expect(seen.size).toBeGreaterThan(4);
      expect(Number(await pager.getAttribute('data-page'))).toBe(1);
    }, 300000);
  }
});
