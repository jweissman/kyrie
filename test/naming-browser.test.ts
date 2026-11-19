/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import { MonoDriver } from './support/mono-driver';

// How you present and your name, as creation asks them (the owner, 2026-10-30 and 17 November; PA-03, PA-04): a woman,
// a man or neither, each with the words the world will speak of you in; then a hand of up to six of your people's
// names for how you present, as one list, two to a line, Roll again dealing names all new, and a field to write your
// own. A name taken from the list goes on to setting out; one written goes on by Enter. Set out as a man, your
// portrait is a man's. At a tablet's size and a phone's, nothing wider than the screen.
class Naming {
  static at(page: Page) { return page.getAttribute('.creation', 'data-page'); }
  static async to(page: Page, step: string) {
    await page.waitForFunction(s => document.querySelector('.creation')?.getAttribute('data-page') === s, step,
      { timeout: 5000 });
  }
  static names(page: Page) {
    return page.locator('.composed-list [data-option] .row-label').allTextContents().then(t => t.map(x => x.trim()));
  }
  // To how you present, holding each step's first option on the way.
  static async presenting(page: Page) {
    for (let i = 0; i < 8 && await Naming.at(page) !== 'presenting'; i++) {
      const was = await Naming.at(page);
      await MonoDriver.hold(page, '.composed-rows [data-option]:not(:disabled) >> nth=0');
      await page.waitForFunction(p => document.querySelector('.creation')?.getAttribute('data-page') !== p, was,
        { timeout: 5000 });
    }
  }
  // Presenting as one, and the hand of names that comes of it.
  static async as(page: Page, id: string): Promise<string[]> {
    await MonoDriver.hold(page, `[data-option="${id}"]`);
    await Naming.to(page, 'name');
    await page.waitForTimeout(300);
    return Naming.names(page);
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the name and how you present', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-naming-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1180, 820], [390, 844]])('at %i by %i offers names to roll on as you present', async (width, height) => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width, height }, { site, pointer: width < 900,
      query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await Naming.presenting(page);
    expect(await page.locator('.composed-rows [data-option] .row-aside').allTextContents())
      .toEqual(['she, her', 'he, him', 'they, them']);
    const hers = await Naming.as(page, 'she');
    await page.keyboard.press('Escape'); await Naming.to(page, 'presenting');
    const his = await Naming.as(page, 'he');
    for (const names of [hers, his]) { expect(names.length >= 3 && names.length <= 6).toBe(true); }
    expect(his.filter(n => hers.includes(n))).toEqual([]);
    // Roll again: names all new.
    await page.click('.composed-row:has-text("Roll again")');
    await page.waitForFunction(was => [...document.querySelectorAll('.composed-list [data-option]')]
      .map(o => o.getAttribute('data-option')).join('|') !== was, his.join('|'), { timeout: 5000 });
    const again = await Naming.names(page);
    expect([again.length >= 3, again.filter(n => his.includes(n))]).toEqual([true, []]);
    // Written, by Enter, setting out.
    await page.fill('[data-field="name"]', 'Halloran');
    await page.keyboard.press('Enter');
    await Naming.to(page, 'go');
    expect(await page.textContent('.composed .ask')).toBe('Halloran');
    // Back, and one of the list taken instead.
    await page.keyboard.press('Escape'); await Naming.to(page, 'name');
    // The names' own words drawn, not only their rows (on a phone the list had two rows and one label: CI, 19 Nov).
    await page.waitForFunction(() => document.querySelectorAll('.composed-list [data-option] .row-label').length >= 2);
    const chosen = (await Naming.names(page))[1]!;
    await MonoDriver.hold(page, `.composed-list [data-option="${chosen}"]`);
    await Naming.to(page, 'go');
    expect(await page.textContent('.composed .ask')).toBe(chosen);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await MonoDriver.hold(page, '[data-option="set-out"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await d.mode('c');
    // Called, where the world places them in a family, as it is (PA-03: Bartle of the Sedges).
    expect(await page.textContent('.character h2.who')).toMatch(new RegExp(`^${chosen}( |$)`));
    expect(await page.getAttribute('.character .head-of .sat', 'src')).toMatch(/-man\.webp$/);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
});
