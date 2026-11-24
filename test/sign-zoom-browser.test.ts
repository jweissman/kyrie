import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import { MonoDriver } from './support/mono-driver';

// The sky of the signs drawn up to the sign whose row is gone to, and let go back to the whole wheel after a few
// seconds over no row (the owner, 18 November, OR-78: "zoom in the sky to the constellation if we hover over the menu
// action item for that sign; we can zoom back out if we spend a few seconds not hovering over any option"). On a phone
// a touch on a row is its hover. The page comes up whole: the row lit as it comes is not a row gone to.
const zoom = (page: Page) => page.evaluate(() => document.querySelector('.observatory')?.getAttribute('data-zoom') ?? null);
const toSign = async (page: Page) => {
  await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
  for (let i = 0; i < 8 && await page.getAttribute('.creation', 'data-page') !== 'sign'; i++) {
    const where = await page.getAttribute('.creation', 'data-page');
    await MonoDriver.enter(page, '[data-option]:not([data-option="more"]):not(:disabled) >> nth=0');
    await page.waitForFunction(p => document.querySelector('.creation')?.getAttribute('data-page') !== p, where, { timeout: 5000 });
  }
  expect(await page.getAttribute('.creation', 'data-page')).toBe('sign');
};
const settled = (page: Page, want: string) => page.waitForFunction(w =>
  document.querySelector('.observatory')?.getAttribute('data-zoom') === w, want, { timeout: 6000 });

describe.skipIf(!process.env.KYRIE_BROWSER)('the sky drawn up to a sign', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-sign-zoom-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('follows the row under the hand, the sign large and in view, and lets go after idling', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1280, height: 800 }, { site, pointer: true, query: '?world=kite' });
    await toSign(page);
    expect(await zoom(page)).toBe('');
    const rows = page.locator('.composed-rows [data-option]');
    // The hand moves first (a hand at rest lights nothing it is over: PressGuard).
    await page.mouse.move(8, 792);
    for (const n of [4, 9]) {
      await rows.nth(n).hover();
      const id = (await rows.nth(n).getAttribute('data-option'))!;
      await settled(page, id);
      await page.waitForTimeout(1400);
      const box = (await page.locator(`.obs-sign[data-sign="${id}"]`).boundingBox())!;
      expect(box.width).toBeGreaterThan(200);
      expect([box.x >= 0, box.x + box.width <= 1280, box.y >= 0, box.y + box.height <= 800])
        .toEqual([true, true, true, true]);
    }
    // Still over a row, it holds; off the rows, it goes back to the twelve.
    await page.waitForTimeout(3500);
    expect(await zoom(page)).not.toBe('');
    await page.mouse.move(8, 792);
    await settled(page, '');
    expect(errors).toEqual([]);
    await page.close();
  }, 200000);

  // And back out on asking (OR-89: "it's not obvious how to zoom back out to the cycle"): All twelve, shown only while
  // a sign is drawn up; Escape, which lets the wheel go and stays at the sign; a touch on the open sky. The sign's
  // entry stands under its rows.
  it('goes back to the twelve by All twelve, by Escape, and by a touch on the sky', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1280, height: 800 }, { site, pointer: true, query: '?world=kite' });
    await toSign(page);
    expect(await page.locator('.sky-out').count()).toBe(0);
    const rows = page.locator('.composed-rows [data-option]');
    await page.mouse.move(8, 792);
    const zoomTo = async (n: number) => {
      await rows.nth(n).hover();
      await settled(page, (await rows.nth(n).getAttribute('data-option'))!);
    };
    await zoomTo(3);
    expect(await page.locator('.composed-rows .creation-entry dt').allTextContents()).toEqual(['Month', 'Gifts']);
    await page.locator('.sky-out').click();
    await settled(page, '');
    expect(await page.locator('.sky-out').count()).toBe(0);
    await zoomTo(5);
    await page.keyboard.press('Escape');
    await settled(page, '');
    expect(await page.getAttribute('.creation', 'data-page')).toBe('sign');
    await zoomTo(7);
    await page.mouse.click(300, 760);
    await settled(page, '');
    expect(await page.getAttribute('.creation', 'data-page')).toBe('sign');
    // The sign taken, every gift of it is the life's, and the page goes on to the calling (OR-117: no gift asked).
    await MonoDriver.enter(page, '.composed-rows [data-option] >> nth=4');
    await page.waitForFunction(() => document.querySelector('.creation')?.getAttribute('data-page') === 'calling');
    expect(await page.locator('h1.ask').textContent()).toBe('Choose your calling');
    expect(errors).toEqual([]);
    await page.close();
  }, 200000);

  it('on a phone, answers a touch on a row, and fits the screen', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 390, height: 844 }, { site, pointer: false, query: '?world=kite' });
    await toSign(page);
    const row = page.locator('.composed-rows [data-option]').nth(4), id = (await row.getAttribute('data-option'))!;
    await row.dispatchEvent('pointerdown', { pointerType: 'touch', isPrimary: true });
    await row.dispatchEvent('pointerup', { pointerType: 'touch', isPrimary: true });
    await settled(page, id);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    await settled(page, '');
    expect(await page.getAttribute('.creation', 'data-page')).toBe('sign');
    expect(errors).toEqual([]);
    await page.close();
  }, 200000);
});
