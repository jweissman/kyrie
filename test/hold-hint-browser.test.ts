import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// "Hold" said on one row at a time (the owner, 18 November, OR-87: "the text 'Hold' shows up on more than one item at
// once; it should only be active on one thing at a time"): a held row let go early says it, and only it, until the
// hand or the keys go to another.
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

  it('is the last row let go early, and none once the hand goes to another', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1280, height: 800 }, { site, pointer: true, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.mouse.move(8, 792);
    const rows = page.locator('.composed-rows [data-option]');
    const ids = await rows.evaluateAll(es => es.map(e => e.getAttribute('data-option')!));
    await tap(page, 0);
    expect(await hinted(page)).toEqual([ids[0]!]);
    await tap(page, 1);
    expect(await hinted(page)).toEqual([ids[1]!]);
    await rows.nth(2).hover();
    expect(await hinted(page)).toEqual([]);
    // The keys going on take it away too.
    await tap(page, 2);
    await page.keyboard.press('ArrowDown');
    expect((await hinted(page)).length).toBeLessThanOrEqual(1);
    expect(await page.getAttribute('.creation', 'data-page')).toBe('you');
    expect(errors).toEqual([]);
    await page.close();
  }, 200000);
});
