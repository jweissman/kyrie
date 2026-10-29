/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The opening and the choice of a life (Mission 18's A3 and A6), and the stage held inside the screen (A1). The studio
// mark plays when asked for (automation is otherwise spared it) and any key goes straight to the ways in; the gold
// mark beside the ways in goes to the one pointed at; creation asks first why you have come, shows no likeness of you
// anywhere, and goes on by Continue; and at a desktop's size, a tablet's either way up and a phone's, the stage stays
// inside the screen, keeps its margins where there is room for them, and the page itself never scrolls.
class Stage {
  static bounds(page: Page) {
    return page.evaluate(() => {
      const f = document.querySelector('.frame')!.getBoundingClientRect();
      const doc = document.scrollingElement!;
      return { inside: f.left >= 0 && f.top >= 0 && f.right <= innerWidth && f.bottom <= innerHeight,
        margin: Math.round(Math.min(f.left, innerWidth - f.right)),
        scrolls: doc.scrollHeight > innerHeight || doc.scrollWidth > innerWidth };
    });
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the opening and the choice of a life', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-opening-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('plays the studio mark when asked, and a key goes straight to the ways in', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1440, height: 900 }, { site, query: '?ident' });
    await page.waitForSelector('.ident', { timeout: 30000 });
    expect(await page.locator('[data-action="begin"]').isVisible()).toBe(false);
    await page.keyboard.press('Space');
    await page.waitForSelector('.ident', { state: 'detached', timeout: 5000 });
    expect(await page.locator('[data-action="begin"]').isVisible()).toBe(true);
    // The gold mark goes to the way pointed at.
    const at = () => page.locator('.title-menu .indicator').evaluate(e => getComputedStyle(e).transform);
    const before = await at();
    await page.hover('[data-action="options"]');
    await page.waitForTimeout(400);
    expect(await at()).not.toBe(before);
    expect(errors).toEqual([]);
    await page.close();
  }, 120000);

  it('begins a life from why you have come, with no likeness of you, and goes on by Continue', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1180, height: 820 }, { site, query: '' });
    await page.click('[data-action="begin"]');
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    expect(await page.textContent('.ask')).toMatch(/^Why have you come to /);
    expect(await page.locator('[data-page="why"] .card').count()).toBeGreaterThan(2);
    await page.click('[data-action="next"]');
    expect(await page.getAttribute('.creation-body', 'data-page')).toBe('you');
    // A country is drawn anew from its own seed, and its first protagonist may be of a people no thief comes of.
    await page.click('[data-choice="raceId:human"]');
    await page.click('[data-action="next"]');
    await page.click('[data-choice="classId:thief"]');
    expect(await page.getAttribute('[data-choice="classId:thief"]', 'aria-pressed')).toBe('true');
    expect(await page.textContent('.creation-foot .so-far')).toContain('thief');
    expect(await page.locator('.creation img').count()).toBe(0);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);

  it.each([[1440, 900, 130], [1180, 820, 40], [820, 1180, 16], [390, 844, 0]])(
    'at %i by %i holds the stage inside the screen, its margins kept, the page still', async (width, height, margin) => {
      const { page, errors } = await MonoBrowser.page(browser, { width, height }, { site, pointer: width < 900,
        query: '?world=kite' });
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      const creating = await Stage.bounds(page);
      await page.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
      const playing = await Stage.bounds(page);
      for (const b of [creating, playing]) {
        expect([b.inside, b.margin >= margin, b.scrolls]).toEqual([true, true, false]);
      }
      expect(errors).toEqual([]);
      await page.close();
    }, 240000);
});
