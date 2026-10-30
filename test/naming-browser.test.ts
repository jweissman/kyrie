/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The last page of creation as a player meets it (the owner, 2026-10-30): how you present, a woman, a man or neither,
// one of them chosen to begin with; the name, and beneath it a table of up to six of your people's names for how you
// present, the one you bear among them; a new way of presenting offers others, Roll again offers names all new, and
// one taken from the table is your name, until you present otherwise (then the table's first is). Emptied, the name
// that waits is edged in the table; written, it stays whatever you present as. Set out as a man, your portrait is a
// man's. At a tablet's size and a phone's, nothing wider than the screen.
class Naming {
  static options(page: Page) { return page.locator('[data-action="name-option"]').allTextContents(); }
  static value(page: Page) { return page.inputValue('[data-field="name"]'); }
  static async present(page: Page, as: string) {
    await page.click(`[data-action="presenting"][data-id="${as}"]`);
    return { names: await Naming.options(page), name: await Naming.value(page) };
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
    for (let i = 0; i < 6 && await page.getAttribute('.creation-body', 'data-page') !== 'name'; i++) {
      await page.click('[data-action="next"]');
    }
    expect(await page.locator('[data-action="presenting"]').allTextContents()).toEqual(['Woman', 'Man', 'Neither']);
    expect(await page.locator('[data-action="presenting"][aria-pressed="true"]').count()).toBe(1);
    const hers = await Naming.present(page, 'she'), his = await Naming.present(page, 'he');
    for (const { names, name } of [hers, his]) {
      expect([names.length >= 3 && names.length <= 6, names[0]]).toEqual([true, name]);
    }
    expect(his.names.filter(n => hers.names.includes(n))).toEqual([]);
    await page.click('[data-action="roll-names"]');
    const again = await Naming.options(page);
    expect([again.length >= 3, again.filter(n => his.names.includes(n))]).toEqual([true, []]);
    await page.click(`[data-action="name-option"][data-name="${again[2]}"]`);
    expect(await Naming.value(page)).toBe(again[2]!);
    expect(await page.getAttribute(`[data-action="name-option"][data-name="${again[2]}"]`, 'aria-pressed')).toBe('true');
    expect(await Naming.present(page, 'she')).toEqual(hers);
    await page.fill('[data-field="name"]', '');
    expect(await page.locator('.name-option.waiting').allTextContents()).toEqual([hers.name]);
    await page.fill('[data-field="name"]', 'Halloran');
    expect((await Naming.present(page, 'he')).name).toBe('Halloran');
    const chosen = his.names[1]!;
    await page.click(`[data-action="name-option"][data-name="${chosen}"]`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.click('.naming [data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await d.mode('c');
    expect(await page.textContent('.character h2.who')).toBe(chosen);
    expect(await page.getAttribute('.character .head-of .sat', 'src')).toMatch(/-man\.webp$/);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
});
