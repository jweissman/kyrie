import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// "Hold" said on one row at a time (the owner, 18 November, OR-87), and now on none: nothing is held anywhere (OR-169,
// OR-185: no long presses), so a short tap on a row of creation goes on at once and no row says Hold.
const hinted = (page: Page) => page.evaluate(() =>
  [...document.querySelectorAll('[data-hint]')].map(e => e.getAttribute('data-option') ?? e.tagName));
const tap = async (page: Page, n: number) => {
  const box = (await page.locator('.composed-rows [data-option]').nth(n).boundingBox())!;
  await page.mouse.move(box.x + 40, box.y + box.height / 2);
  await page.mouse.down(); await page.waitForTimeout(80); await page.mouse.up();
};

describe.skipIf(!process.env.KYRIE_BROWSER)('"Hold" on one row', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-hold-hint-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('is said by no row of creation: a short tap goes on at once', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1280, height: 800 }, { site, pointer: true, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.mouse.move(8, 792);
    expect(await page.getAttribute('.creation', 'data-page')).toBe('you');
    await tap(page, 0);
    await page.waitForFunction(() => document.querySelector('.creation')?.getAttribute('data-page') !== 'you',
      null, { timeout: 4000 });
    expect(await hinted(page)).toEqual([]);
    expect(await page.locator('.composed-rows [data-hold]').count()).toBe(0);
    expect(errors).toEqual([]);
    await page.close();
  }, 200000);
});
