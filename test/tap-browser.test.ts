/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// A tap commits, at once, everywhere (the owner's play of the live build, IG-07: "Long-click is a mess and doesn't work
// at all. I click, and nothing happens"): a creation card is chosen by one click, or one tap on a tablet, and a
// sustained act (the search on the rail, a wait) is done by one click or one tap, its pointer released at once, with no
// mark that fills and nothing held. At a laptop's 1280 by 800 with a mouse, and an iPad upright by touch.
class Tapping {
  static told(d: MonoDriver) { return d.inspect().then(s => s.log.length); }
  // One press and release, at once: a click with a mouse, a tap on a touch screen.
  static async once(page: Page, selector: string, touch: boolean) {
    const at = page.locator(selector).first();
    await at.scrollIntoViewIfNeeded();
    if (touch) { await at.tap(); } else { await at.click({ delay: 0 }); }
  }
  // A sustained act drawn now: the search on the rail where there is one to make, else a wait in the time lens.
  static async sustained(page: Page, d: MonoDriver): Promise<string> {
    const search = '.scene-rail .rail-mark.by-glyph[data-act]';
    if (await page.locator(search).count()) { return search; }
    if (!await page.locator('.glance .lens-time').count()) { await d.click('.rail-mark.opens-wait'); }
    return '.glance .lens-time [data-act]';
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('a tap commits', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-tap-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1280, 800, false], [820, 1180, true]] as const)('at %ix%i (touch: %s)', async (width, height, touch) => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width, height },
      { site, pointer: touch, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    // A card: chosen by one press, at once; nothing on the page held or filling.
    const card = '[data-action="origin"][aria-pressed="false"]';
    const id = await page.locator(card).first().getAttribute('data-id');
    const at = `[data-action="origin"][data-id="${id}"]`;
    await Tapping.once(page, at, touch);
    expect(await page.getAttribute(at, 'aria-pressed')).toBe('true');
    expect(await page.locator('[data-hold], .hold-ring, .hold-edge').count()).toBe(0);
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await d.enter();
    // A sustained act: done by one press, at once.
    const act = await Tapping.sustained(page, d), told = await Tapping.told(d);
    expect(await page.locator(act).count()).toBeGreaterThan(0);
    await Tapping.once(page, act, touch); await d.settle();
    expect(await Tapping.told(d)).toBeGreaterThan(told);
    expect(await page.locator('[data-hold], .hold-ring, .hold-edge').count()).toBe(0);
    // And by its key, once, where the keys are.
    if (!touch) {
      const now = await Tapping.told(d), again = await Tapping.sustained(page, d);
      await page.locator(again).first().focus();
      await page.keyboard.press('Enter'); await d.settle();
      expect(await Tapping.told(d)).toBeGreaterThan(now);
    }
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
});
