/// <reference lib="dom" />
// A game is kept as it goes and taken up after a reload, with no notice that it cannot be kept: a world with the
// standing scenarios is three megabytes packed, and beside the game's state it had filled localStorage from the first
// command (the owner, 12 November); the world is kept in IndexedDB (WorldVault), the state in localStorage. Opt in
// with KYRIE_BROWSER=1.
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
describe.skipIf(!process.env.KYRIE_BROWSER)('a game kept in the browser', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => { site = await mkdtemp(join(tmpdir(), 'kyrie-k-')); await SiteBuild.site(site, {}); browser = await MonoBrowser.launch(); }, 300000);
  afterAll(async () => { await browser?.close(); });
  it('is kept as it goes, the world apart, and taken up again after a reload', async () => {
    const { page, driver } = await MonoBrowser.page(browser, { width: 1280, height: 800 }, { site, pointer: false, query: '?world=a1' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await page.locator('[data-choice="exit:region__s2_green"], [data-pick="exit:region__s2_green"]').first().click(); await driver.settle();
    await page.waitForTimeout(4000);
    const before = (await driver.inspect()).place?.id;
    const unkept = await page.locator('[data-id="unkept"]').count();
    const storage = await page.evaluate(() => ({ local: Object.keys(localStorage).map(k => [k, (localStorage.getItem(k) ?? '').length]) }));
    // In localStorage only the state and its summary: tens of kilobytes, not megabytes.
    expect(storage.local.every(([, n]) => (n as number) < 400000)).toBe(true);
    await page.reload();
    await page.waitForSelector('[data-action="continue"]', { timeout: 60000 });
    await page.click('[data-action="continue"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
    await driver.settle();
    const after = (await driver.inspect()).place?.id;
    expect([unkept, after]).toEqual([0, before]);
  }, 600000);
});
