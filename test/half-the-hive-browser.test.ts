/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// Half the Hive as a player meets it in the page, at a desk and on a phone: the drove road, the smoke of Smoke End,
// the Apron under the Brow, the Scenting House, the Comb, and Kestrel in the Dancing Hall. Opt in with KYRIE_BROWSER=1;
// KYRIE_SHOTS=dir keeps a screenshot of each stop.
class Page_ {
  static text(page: Page) { return page.evaluate(() => document.body.innerText); }
  static async act(d: MonoDriver, ...labels: string[]) {
    for (const label of labels) {
      for (const part of label.split(' › ')) {
        const re = new RegExp(part, 'i');
        await d.pick(c => re.test(c.label), part);
      }
    }
  }
  static async shot(page: Page, name: string) {
    if (process.env.KYRIE_SHOTS) { await page.screenshot({ path: join(process.env.KYRIE_SHOTS, `${name}.png`) }); }
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('Half the Hive in the browser', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-hume-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1440, 900, false], [390, 844, true]] as const)('at %ix%i', async (width, height, pointer) => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width, height },
      { site, pointer, query: '?campaign=half-the-hive' });
    await page.waitForSelector('[data-action="start"]');
    await Page_.shot(page, `title-${width}`);
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await Page_.shot(page, `drove-road-${width}`);
    await Page_.act(d, '^To Smoke End');
    expect(await Page_.text(page)).toContain('Smoke End');
    await Page_.shot(page, `smoke-end-${width}`);
    await Page_.act(d, '^To the gorge path', '^To the Apron');
    await Page_.shot(page, `apron-${width}`);
    await Page_.act(d, '^Into the Scenting House', '^Talk to Elspet', 'scent you');
    expect(await Page_.text(page)).toContain('as if you were family');
    await d.away();
    await Page_.act(d, '^Out to the Apron', '^Into the Comb');
    await Page_.shot(page, `comb-${width}`);
    await Page_.act(d, '^Into the Dancing Hall|^To the Dancing Hall', '^Talk to Kestrel');
    expect(await Page_.text(page)).toContain('You came about the notice');
    await Page_.shot(page, `kestrel-${width}`);
    expect(errors).toEqual([]);
  }, 300000);
});
