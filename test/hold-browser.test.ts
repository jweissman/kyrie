/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import { LensPages } from './support/lens-pages';
import { Rail } from './support/rail';

// Nothing is held (the owner, 23 November, OR-185: "No long presses"; a night's rest and a camp had been held, 16
// November): a wait, a search, a camp and a rest are each done at one press of the mouse or one key, nothing filling
// first, and what the camp spends is said on its row before it is chosen (test/hold-rule: "until morning").
class Afield {
  // Out of the town, on the road north: the page's own journey, as the map sets one out (kyrieMono.act).
  static async go(page: import('playwright-core').Page, d: { settle(): Promise<void> }) {
    await page.evaluate(() => (window as unknown as { kyrieMono: { act(c: string, s: string): void } })
      .kyrieMono.act('travel:region__edge_north', 'travel'));
    await d.settle();
    await page.waitForTimeout(800);
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('nothing held in play', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => { site = await mkdtemp(join(tmpdir(), 'kyrie-hold-')); await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch(); }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  const camp = '.glance .lens-time :is([data-act*="camp"], [data-act*="rest"])';

  it('does a wait at one press, nothing on the page held', async () => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, pointer: false, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await d.enter();
    await Rail.click(page, '.rail-mark.opens-wait'); await d.settle();
    expect(await page.locator('[data-hold], .ix-reticle').count()).toBe(0);
    const before = (await d.inspect()).log.length;
    await page.locator('.glance .lens-time [data-act]').first().click(); await d.settle();
    expect((await d.inspect()).log.length).toBeGreaterThan(before);
    expect(errors).toEqual([]);
    await page.close();
  }, 200000);

  it('makes camp in the open at one click, its row saying until when', async () => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, pointer: false, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await d.enter();
    await Afield.go(page, d);
    await Rail.click(page, '.rail-mark.opens-wait'); await d.settle();
    expect(await LensPages.seek(page, camp)).toBe(true);
    const row = page.locator(camp).first(), before = (await d.inspect()).log.length;
    expect(await row.textContent()).toMatch(/until /);
    await row.click(); await d.settle();
    expect((await d.inspect()).log.length).toBeGreaterThan(before);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);

  it('makes camp at its key, pressed once', async () => {
    const { page, driver: d } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, pointer: false, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await d.enter();
    await Afield.go(page, d);
    await Rail.click(page, '.rail-mark.opens-wait'); await d.settle();
    expect(await LensPages.seek(page, camp)).toBe(true);
    const before = (await d.inspect()).log.length;
    await page.locator(camp).first().focus();
    await page.keyboard.press('Enter'); await d.settle();
    expect((await d.inspect()).log.length).toBeGreaterThan(before);
  }, 240000);
});
