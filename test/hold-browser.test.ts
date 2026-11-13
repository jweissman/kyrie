/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import { MonoDriver } from './support/mono-driver';

// Holding a sustained act rather than touching it (the owner, 14 November), narrowed by the blind playtest of 13
// November (BP-09): a creation card is chosen at a tap; a sustained act (the search on the rail, a wait) shows its
// ring at rest, and touched, or let go early, does nothing; held to the end it is done; and the keys hold it too,
// Enter on the act in focus and Enter on the highlight (ReaderKeys). The ring fills round in place. Screenshots
// mid-hold go to KYRIE_HOLD_SHOTS where it is given (doc/architecture/mission-21/aesthetic/hold/). Opt in with
// KYRIE_BROWSER=1.
class Holding {
  // Pressed for so long and let go, at the act's middle.
  static async press(page: Page, selector: string, ms: number) {
    await page.locator(selector).first().hover();
    await page.mouse.down(); await page.waitForTimeout(ms); await page.mouse.up();
  }
  // A sustained act drawn now: the search on the rail where there is one to make, else a wait in the time lens.
  static readonly sustained = ':is(.scene-rail, .glance .lens) [data-hold="sustained"]';
  static async drawn(page: Page, d: MonoDriver): Promise<string> {
    if (await page.locator(Holding.sustained).count()) { return Holding.sustained; }
    if (!await page.locator('.glance .lens-time').count()) { await d.click('.opens-wait'); }
    const all = '.glance .lens [data-action="lens-all"][aria-expanded="false"]';
    if (!await page.locator(Holding.sustained).count() && await page.locator(all).count()) { await d.click(all); }
    return Holding.sustained;
  }
  static told(d: MonoDriver) { return d.inspect().then(s => s.log.length); }
  static async shot(page: Page, name: string) {
    const dir = process.env.KYRIE_HOLD_SHOTS;
    if (!dir) { return; }
    await mkdir(dir, { recursive: true });
    await page.screenshot({ path: join(dir, `${name}.png`) });
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('an act held', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-hold-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1280, 800], [820, 1180]] as const)('at %ix%i', async (width, height) => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width, height }, { site, query: '?world=kite' });
    const size = `${width}x${height}`;
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    // Who you are: chosen at a tap, then Continue (the blind playtest's BP-09): a card is never held, no ring on it.
    const card = '[data-action="origin"][aria-pressed="false"]';
    const id = await page.locator(card).first().getAttribute('data-id');
    const at = `[data-action="origin"][data-id="${id}"]`;
    expect([await page.getAttribute(at, 'data-hold'), await page.locator(`${at} .hold-ring`).count()]).toEqual([null, 0]);
    await page.click(at);
    expect(await page.getAttribute(at, 'aria-pressed')).toBe('true');
    await Holding.shot(page, `${size}-card-chosen-at-a-tap`);
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await d.enter();
    // A sustained act at a place: the search on the rail, or a wait, its ring seen at rest. Touched, or let go early,
    // nothing is done.
    const search = await Holding.drawn(page, d);
    expect(await page.locator(search).count()).toBeGreaterThan(0);
    expect(await page.locator(`${search} .hold-ring`).first().isVisible()).toBe(true);
    const told = await Holding.told(d);
    await page.click(search); await d.settle();
    await Holding.press(page, search, 300); await d.settle();
    expect(await Holding.told(d)).toBe(told);
    await page.locator(search).first().hover(); await page.mouse.down(); await page.waitForTimeout(450);
    expect(await page.locator(`${search} .hold-ring.held`).count()).toBe(1);
    await Holding.shot(page, `${size}-search-mid-hold`);
    await page.mouse.up(); await d.settle();
    expect(await Holding.told(d)).toBe(told);
    // Held to the end (the one driver helper), it is done.
    await d.click(search);
    expect(await Holding.told(d)).toBeGreaterThan(told);
    // The keys: Enter on the act in focus, tapped, does nothing; held, does it.
    const searched = await Holding.told(d);
    await Holding.drawn(page, d);
    await page.locator(search).first().focus();
    await page.keyboard.press('Enter'); await d.settle();
    expect(await Holding.told(d)).toBe(searched);
    await d.holdKey();
    expect(await Holding.told(d)).toBeGreaterThan(searched);
    // Enter on the highlight (ReaderKeys), where the arrows reach a held act: tapped nothing, held it is done.
    await page.locator('body').focus();
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    let reached = false;
    for (let i = 0; i < 12 && !reached; i++) {
      await d.key('ArrowDown');
      const s = await d.inspect();
      reached = !!s.choices.find(c => c.id === s.selected)?.hold;
    }
    if (reached) {
      const now = await Holding.told(d);
      await d.key('Enter');
      expect(await Holding.told(d)).toBe(now);
      await page.keyboard.down('Enter'); await page.waitForTimeout(400);
      await Holding.shot(page, `${size}-highlight-mid-hold`);
      await page.waitForTimeout(600); await page.keyboard.up('Enter'); await d.settle();
      expect(await Holding.told(d)).toBeGreaterThan(now);
    }
    // Under reduced motion the ring is filled at once, still, and the act is held all the same.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await Holding.drawn(page, d);
    await page.locator(search).first().hover(); await page.mouse.down(); await page.waitForTimeout(300);
    expect(await page.locator(`${search} .hold-ring.held`).first().evaluate(e => getComputedStyle(e).animationName)).toBe('none');
    await Holding.shot(page, `${size}-search-reduced-motion`);
    await page.mouse.up();
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
});
