/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// A finger on a row (the owner, 17 November, then 23 November, OR-185: no long presses): nothing is held, so no ring
// is drawn round the finger and no fill crosses the row while it is down; the row is chosen as the finger lifts, as
// any tap is. And a row's mark is one height in every state, at rest, under the hand and pressed.
class Fill {
  // How the touched row stands while the finger is down.
  static readonly look = (sel: string) => {
    const row = document.querySelector<HTMLElement>(sel)!, s = getComputedStyle(row);
    return { ring: document.querySelectorAll('.ix-reticle').length, image: s.backgroundImage,
      head: document.querySelector('[data-slot="header"]')?.textContent ?? '' };
  };
  static async down(page: Page, sel: string) {
    const b = (await page.locator(sel).first().boundingBox())!;
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart',
      touchPoints: [{ x: b.x + b.width / 2, y: b.y + b.height / 2 }] });
    return cdp;
  }
  static marks(page: Page) {
    return page.evaluate(() => [...document.querySelectorAll('[data-menu] .choice-row > .row-mark')]
      .map(m => Math.round(m.getBoundingClientRect().height)));
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('a finger on a row', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-fill-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('draws no ring and no fill while it is down, and chooses the row as it lifts', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage(), errors: string[] = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(`file://${join(site, 'mono.html')}?world=a1`);
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    // A row of the first step, which a tap chooses and goes on from.
    const sel = '[data-menu] .choice-row[data-option]';
    await page.waitForSelector(sel); await page.waitForTimeout(600);
    const before = await page.evaluate(Fill.look, sel), cdp = await Fill.down(page, sel);
    await page.waitForTimeout(400);
    const mid = await page.evaluate(Fill.look, sel);
    expect([mid.ring, mid.image.includes('gradient'), mid.head]).toEqual([0, false, before.head]);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(600);
    expect((await page.evaluate(Fill.look, sel)).head).not.toBe(before.head);
    expect(errors).toEqual([]);
    await context.close();
  }, 300000);

  it('keeps every row mark one height, at rest, under the hand and pressed', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1280, height: 800 }, { site, query: '?world=a1' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.waitForTimeout(400);
    const rest = await Fill.marks(page);
    expect(rest.length).toBeGreaterThan(1);
    const b = (await page.locator('[data-menu] .choice-row').nth(1).boundingBox())!;
    await page.mouse.move(b.x + 40, b.y + b.height / 2); await page.waitForTimeout(250);
    const over = await Fill.marks(page);
    await page.mouse.down(); await page.waitForTimeout(120);
    const pressed = await Fill.marks(page);
    await page.mouse.move(2, 2); await page.mouse.up();
    expect(new Set([...rest, ...over, ...pressed]).size).toBe(1);
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
});
