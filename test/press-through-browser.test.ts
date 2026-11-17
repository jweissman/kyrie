/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// A finger held on a row until it is done, then lifted, presses nothing on the page that came while it was down (M22's
// second review, finding 1: on a phone the opening's last Continue, held, let go over the rail's hourglass of the first
// scene, and play opened on the Wait lens). The click a touch makes on lifting comes after the browser's own pause,
// later than the press guard had remembered where the press began.
class Finger {
  static async hold(page: Page, selector: string) {
    const b = (await page.locator(selector).first().boundingBox())!;
    const cdp = await page.context().newCDPSession(page), p = [{ x: b.x + b.width / 2, y: b.y + b.height / 2 }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: p });
    await page.waitForTimeout(800);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(700);
  }
  // Clicks that reached the page, by what they landed on: one the guard drops never gets past its capture.
  static readonly heard = () => {
    const w = window as unknown as { __heard: string[] };
    w.__heard = [];
    document.addEventListener('click', e => w.__heard.push((e.target as Element).closest('[aria-label], [data-action]')
      ?.getAttribute('aria-label') ?? (e.target as Element).tagName), false);
  };
}
describe.skipIf(!process.env.KYRIE_BROWSER)('a held press, lifted on the next page', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-through-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('presses nothing there, on a phone', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage(), errors: string[] = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(`file://${join(site, 'mono.html')}?world=a1&opening`);
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="prologue"]', { timeout: 120000 });
    await page.evaluate(`(${Finger.heard.toString()})()`);
    for (let i = 0; i < 8 && await page.locator('[data-mode="prologue"]').count(); i++) {
      await page.waitForTimeout(1800);
      if (await page.locator('[data-action="answer"]').count()) { await page.keyboard.press('1'); continue; }
      await Finger.hold(page, '.prologue-page .go-on');
    }
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    expect(await page.evaluate(() => (window as unknown as { __heard: string[] }).__heard)).toEqual([]);
    expect(errors).toEqual([]);
    await context.close();
  }, 300000);
});
