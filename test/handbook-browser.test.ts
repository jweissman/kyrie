/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../bin/site-build';
import { MonoBrowser } from './support/mono-browser';

// The handbooks in the built site: reached from the title, searchable, filtered by status, and readable on a phone.
// Opt in with KYRIE_BROWSER=1.
describe.skipIf(!process.env.KYRIE_BROWSER)('the handbooks in the browser', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-handbook-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 60_000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('are linked from the title and open on the landing page', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1440, height: 900 }, { site, query: '' });
    await page.click('.title-page .books a');
    await page.waitForSelector('.cards .card');
    expect(await page.locator('.cards .card').count()).toBe(3);
    expect(errors).toEqual([]);
    await page.close();
  });
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
  });
  it('read on a phone without sideways scrolling', async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    for (const book of ['phb', 'dmg', 'mm']) {
      await page.goto(`file://${join(site, `handbook/${book}.html`)}`);
      const wide = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      expect(wide).toBe(false);
    }
    await page.close();
  });
});
