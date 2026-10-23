/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../bin/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// The reader as a player meets it: an answer the moment the company sets out, what someone says told once and where
// they say it, a page that stays put while the pointer moves, keys that do what they say, a map that shows where the
// company is, a fight that says what each foe means to do and tells each exchange in words, what is asked for opening
// in place of what is here, nothing wider than the screen, a game that survives a reload, and nothing the engine says
// to its authors. Opt in with KYRIE_BROWSER=1.
class Reading {
  static text(page: Page) { return page.evaluate(() => document.body.innerText); }
  static count(text: string, phrase: string) { return text.split(phrase).length - 1; }
  // How many times the story changes while the pointer moves over every choice in turn.
  static hover(page: Page) {
    return page.evaluate(async () => {
      let changes = 0;
      const watch = new MutationObserver(m => { changes += m.length; });
      watch.observe(document.querySelector('.world-body')!, { childList: true, subtree: true, characterData: true, attributes: true });
      for (const b of Array.from(document.querySelectorAll<HTMLElement>('[data-action="choice"]'))) {
        b.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
        await new Promise(r => setTimeout(r, 15));
      }
      watch.disconnect();
      return changes;
    });
  }
  static async fight(d: MonoDriver) {
    for (let i = 0; i < 6 && (await d.inspect()).mode !== 'combat'; i++) {
      await d.pick(c => c.label.startsWith('Attack'), 'attack');
    }
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the reader', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-reader-'));
    await SiteBuild.site(site, { fixtures: true });
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1440, 900, false], [390, 844, true]] as const)('at %ix%i: reads, answers and keeps still', async (width, height,
    pointer) => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width, height },
      { site, pointer, query: '?campaign=test/fixtures/march/serewater-march.campaign.json' });
    await page.waitForSelector('[data-action="start"]');
    // Setting out is answered at once, before the world is built.
    await page.click('[data-action="start"]');
    expect(await page.waitForSelector('[data-mode="loading"]', { timeout: 150 })).toBeTruthy();
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    expect(await page.textContent('[data-id="place"]')).toBe('Reedwake quay');
    // Told once, and the story does not move while the pointer does.
    await d.do('relative', 'Ask what is wrong');
    const told = await Reading.text(page);
    expect(Reading.count(told, 'Pell went up to Censer Hill')).toBe(1);
    expect(await Reading.hover(page)).toBe(0);
    if (!pointer) {
      // The keys: an arrow moves the highlight and nothing else; a digit does the choice at once.
      const before = (await d.inspect()).selected;
      await d.key('ArrowDown');
      expect((await d.inspect()).selected).not.toBe(before);
      expect(await Reading.hover(page)).toBe(0);
    }
    // Across country to the causeway; the map shows where the company is.
    await d.go('causeway');
    expect((await d.inspect()).place?.id).toBe('march__causeway');
    await d.mode('m');
    expect(await page.locator('[data-region="map"] [aria-current="location"]').count()).toBe(1);
    await d.mode('m');
    // A fight: each foe and what it means to do; each exchange in words, the dice kept back.
    await Reading.fight(d);
    expect((await d.inspect()).mode).toBe('combat');
    expect(await page.locator('.foe .intent').count()).toBeGreaterThan(0);
    await d.fight();
    const fought = await Reading.text(page);
    for (const shop of ['rolled', 'THAC0', 'needed', 'The order:', 'journal keeps every one', 'Learned:']) {
      expect([shop, fought.includes(shop)]).toEqual([shop, false]);
    }
    // What is asked for opens over the right-hand page, and Esc closes it.
    await d.mode('c');
    expect(await page.locator('.sheet.view-company .member-sheet h2:visible').count()).toBe(1);
    await d.mode('j');
    expect(await page.locator('.sheet.view-journal:visible').count()).toBe(1);
    await page.keyboard.press('Escape');
    expect(await page.locator('.sheet').count()).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    // A reload carries on where the company stands.
    const [place, clock] = [(await d.inspect()).place?.id, await page.textContent('[data-id="clock"]')];
    await page.reload();
    await d.click('[data-action="continue"]');
    await page.waitForSelector('[data-mode="explore"]');
    expect([(await d.inspect()).place?.id, await page.textContent('[data-id="clock"]')]).toEqual([place, clock]);
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
});
