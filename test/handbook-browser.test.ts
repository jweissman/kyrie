/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The handbooks in the built site: reached from the options (the title opens the Encyclopedia), searchable,
// filtered by status, and readable on a phone.
// Opt in with KYRIE_BROWSER=1. Each is given a minute: under bun's five seconds, a loaded CI runner had timed the first
// out as the page came up, and its browser closed under the two after it (CI on 7f392f0b and 13441a49).
describe.skipIf(!process.env.KYRIE_BROWSER)('the handbooks in the browser', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-handbook-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 60_000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('are linked from the options and open on the landing page', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1440, height: 900 }, { site, query: '' });
    await page.click('[data-action="options"]');
    await page.click('[data-action="handbooks"]');
    await page.waitForSelector('.cards .card');
    expect(await page.locator('.cards .card').count()).toBe(3);
    expect(errors).toEqual([]);
    await page.close();
  }, 60_000);
  it('find an entry as you type, and hide what a status filter leaves out', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`file://${join(site, 'handbook/phb.html')}`);
    await page.fill('#find', 'fireball');
    await page.waitForFunction(() => document.querySelector('#ability-fireball:not([hidden])')
      && document.querySelectorAll('article.entry:not([hidden])').length < 10);
    await page.fill('#find', '');
    await page.uncheck('.chips input[value=faithful]');
    await page.waitForFunction(() => document.querySelector('#ability-fireball')!.hasAttribute('hidden'));
    expect(await page.locator('article[data-status=unreachable]:not([hidden])').count()).toBeGreaterThan(0);
    await page.close();
  }, 60_000);
  it('read on a phone without sideways scrolling', async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    for (const book of ['phb', 'dmg', 'mm']) {
      await page.goto(`file://${join(site, `handbook/${book}.html`)}`);
      const wide = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      expect(wide).toBe(false);
    }
    await page.close();
  }, 60_000);
});
