import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// OR-120, OR-121, OR-160 in the built page, on CI: the title's one way in is Play, which with no game kept asks how
// the game begins in two rows (Create a character, A new life, at once), by their action ids, each its words
// and no icon; A new life, at once, pressed once the title has stood long enough for the worker to draw the
// country and make its start ready (kyrieMono.idle), is in the world within a second: from the press to the first
// frame of play drawn, measured in the page itself. The headless budget and determinism are test/set-out-now's; this
// is the page's own wait (the worker's message, React's drawing) on top of it. And OR-169 by a finger on a phone: Play,
// Create a character and each of creation's pages to the life before (the sign's among them) go on at the first tap,
// none of them held.
class Now {
  static readonly budget = 1000;
  // Where creation is: the page the engine asks (data-page).
  static at(page: Page) { return page.getAttribute('.creation', 'data-page'); }
  // A tap on the first row that can be taken, and whether the page went on at it.
  static async tap(page: Page): Promise<boolean> {
    const was = await Now.at(page);
    await page.tap('.composed-rows [data-option]:not([data-option="more"]):not(:disabled) >> nth=0');
    return page.waitForFunction(p => document.querySelector('.creation')?.getAttribute('data-page') !== p, was,
      { timeout: 4000 }).then(() => true, () => false);
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('Set out now in the page', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-set-out-now-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('offers New Game; asks how the game begins, and we enter the world as we are within a second', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1280, height: 800 }, { site, query: '' });
    await page.waitForSelector('[data-action="begin"]', { state: 'visible', timeout: 60000 });
    expect(await page.$$eval('.title-menu [data-action]', els => els.map(e => [e.getAttribute('data-action'),
      e.textContent?.trim()]))).toEqual([['begin', 'New Game'], ['options', 'Options'], ['quit', 'Quit']]);
    // The title stood while the country was drawn behind it, and its start made ready.
    await page.evaluate(() => (window as unknown as { kyrieMono: { idle(): Promise<unknown> } }).kyrieMono.idle());
    await page.evaluate(() => document.querySelector<HTMLElement>('[data-action="begin"]')!.click());
    await page.waitForSelector('[data-mode="begin"]', { timeout: 2000 });
    const rows = await page.$$eval('.begin-menu [data-action]', els => els.map(e => [e.getAttribute('data-action'),
      e.textContent?.trim(), e.querySelector('svg') ? 'icon' : '']));
    expect(rows).toEqual([['build', 'Create a character', ''], ['set-out-now', 'A new life, at once', ''],
      ['back', 'Back', '']]);
    const ms = await page.evaluate(() => new Promise<number>(done => {
      const began = performance.now();
      const seen = () => document.querySelector('.stage[data-mode="explore"], .stage[data-mode="prologue"]');
      new MutationObserver((_, watching) => {
        if (seen()) { watching.disconnect(); done(performance.now() - began); }
      }).observe(document.body, { subtree: true, childList: true, attributes: true });
      document.querySelector<HTMLElement>('[data-action="set-out-now"]')!.click();
    }));
    console.log(`  Set out now in the page: ${ms.toFixed(0)} ms from the press to the first frame of play`);
    expect(ms).toBeLessThan(Now.budget);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);

  it('builds a character by the other row, and creation\'s Set out now says so in words', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1280, height: 800 }, { site, query: '' });
    await page.waitForSelector('[data-action="begin"]', { state: 'visible', timeout: 60000 });
    await page.evaluate(() => document.querySelector<HTMLElement>('[data-action="begin"]')!.click());
    await page.waitForSelector('[data-mode="begin"]', { timeout: 2000 });
    await page.keyboard.press('Escape');
    await page.waitForSelector('[data-mode="title"]', { timeout: 2000 });
    await page.evaluate(() => document.querySelector<HTMLElement>('[data-action="begin"]')!.click());
    await page.evaluate(() => document.querySelector<HTMLElement>('[data-action="build"]')!.click());
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    expect(await page.textContent('[data-action="start"]')).toBe('Set out now');
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);

  it('goes on at the first tap of a finger on a phone, from Play to the life before', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 390, height: 844 }, { site, pointer: true, query: '' });
    await page.waitForSelector('[data-action="begin"]', { state: 'visible', timeout: 60000 });
    await page.tap('[data-action="begin"]');
    await page.waitForSelector('[data-mode="begin"]', { timeout: 2000 });
    await page.tap('[data-action="build"]');
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    expect(await page.locator('[data-hold]').count()).toBe(0);
    // Each page on at its first tap, to the life before (the sign's page passed on the way, OR-169).
    const passed: [string | null, boolean][] = [];
    for (let i = 0; i < 14 && !passed.some(([p]) => p === 'before'); i++) { passed.push([await Now.at(page), await Now.tap(page)]); }
    expect(passed.filter(([, on]) => !on)).toEqual([]);
    expect(passed.map(([p]) => p)).toEqual(expect.arrayContaining(['sign', 'before']));
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
});
