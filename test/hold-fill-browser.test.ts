/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// A finger's hold (the owner, 17 November): on a phone the reticle is drawn round the finger, and the row's fill is
// where the hold has got to, so the act is done only when the fill reaches the far end. And a row's mark is one height
// in every state, at rest, under the hand and pressed.
class Fill {
  // How the held row and the reticle stand, a fraction of the way through the hold.
  static readonly look = (sel: string) => {
    const row = document.querySelector<HTMLElement>(sel)!, ring = document.querySelector('.ix-reticle');
    const s = getComputedStyle(row);
    return { ring: ring?.className ?? '', p: parseFloat(s.getPropertyValue('--hold-p')), image: s.backgroundImage,
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

describe.skipIf(!process.env.KYRIE_BROWSER)('a finger holding a row', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-fill-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('is ringed round the finger, and done only when the fill is full', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage(), errors: string[] = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(`file://${join(site, 'mono.html')}?world=a1`);
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    // A row of the first step, which a hold chooses and goes on from.
    const sel = '[data-menu] .choice-row[data-hold]';
    await page.waitForSelector(sel); await page.waitForTimeout(600);
    const before = await page.evaluate(Fill.look, sel), cdp = await Fill.down(page, sel);
    await page.waitForTimeout(260);
    const mid = await page.evaluate(Fill.look, sel);
    // Half way: the ring is the finger's and filling, the row's fill drawn and part way, nothing done yet.
    expect(mid.ring).toContain('finger');
    expect(mid.ring).toContain('holding');
    expect(mid.image).toContain('gradient');
    expect(mid.p).toBeGreaterThan(20);
    expect(mid.p).toBeLessThan(85);
    expect(mid.head).toBe(before.head);
    await page.waitForTimeout(500);
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
