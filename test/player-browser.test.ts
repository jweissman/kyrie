/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../bin/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// The player as a game: one frame in which the place, a fight, the company and the journal are views; what happened
// told once, where it happened; the company and the foes in view through a fight; and nothing the engine says to its
// authors. Opt in with KYRIE_BROWSER=1.
class Play {
  static readonly query = '?campaign=data/campaigns/varrow.campaign.json';
  static text(page: Page) { return page.evaluate(() => document.body.innerText); }
  static count(text: string, phrase: string) { return text.split(phrase).length - 1; }
  static async nightOnTheRoad(d: MonoDriver) {
    await d.go('barrows');
    for (let i = 0; i < 16 && (await d.inspect()).mode !== 'combat'; i++) {
      await d.pick(c => c.label.startsWith('Wait an hour'), 'wait an hour');
    }
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the player', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-player-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1440, 900, false], [390, 844, true]] as const)(
    'at %ix%i: tells things once, keeps fights readable, and never talks shop',
    async (width, height, pointer) => {
      const { page, errors, driver: d } = await MonoBrowser.page(browser, { width, height },
        { site, pointer, query: Play.query });
      await d.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"]');
      // Told once: Wenna's answer is on the page, and what it taught is a note, not a second telling.
      await d.go('wheatsheaf');
      await d.do('wenna', 'Ask Wenna what is said');
      const told = await Play.text(page);
      expect(Play.count(told, 'Carters coming down')).toBe(1);
      expect(await page.textContent('[data-id="response"]')).toContain('Carters coming down');
      // A merchant's counter: what Ottar sells, at what price, and how many are left.
      await d.go('market'); await d.go('chandlery');
      expect(await page.textContent('.counter')).toMatch(/Torch\s*1c\s*8 left/);
      // A fight begun by others opens with what began it; the foes, what each means to do, and the company stay in
      // view.
      await d.go('market');
      await Play.nightOnTheRoad(d);
      expect((await d.inspect()).mode).toBe('combat');
      expect(await page.textContent('.page.fight .now')).toContain('Shapes rise out of the dark');
      expect(await page.locator('.foes .intent').count()).toBeGreaterThan(0);
      expect(await page.locator('.rail .company .member').count()).toBe(3);
      await d.fight();
      // Nothing the engine says to its authors.
      const all = await Play.text(page);
      for (const shop of ['Nothing has happened yet', 'Anyone brought to nothing', 'unvisited', 'Learned:', 'The order:']) {
        expect([shop, all.includes(shop)]).toEqual([shop, false]);
      }
      expect((await MonoBrowser.metrics(page)).scroll).toBe(false);
      expect(errors).toEqual([]);
      await page.close();
    }, 300000);
});
