import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// OR-120, OR-121 in the built page, on CI: New game asks how the game begins in two rows (Build a character, Set out
// now), by their action ids, each its words and no icon; Set out now, pressed once the title has stood long enough for
// the worker to draw the country and make its start ready (kyrieMono.idle), is in the world within a second: from the
// press (its commit: a key's, as a click of detail 0 is, not a hold's ring) to the first frame of play drawn, measured
// in the page itself. The headless budget and determinism are test/set-out-now's; this is the page's own wait (the
// worker's message, React's drawing) on top of it.
class Now {
  static readonly budget = 1000;
}

describe.skipIf(!process.env.KYRIE_BROWSER)('Set out now in the page', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-set-out-now-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('asks how the game begins, and Set out now is in the world within a second of the press', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1280, height: 800 }, { site, query: '' });
    await page.waitForSelector('[data-action="begin"]', { state: 'visible', timeout: 60000 });
    // The title stood while the country was drawn behind it, and its start made ready.
    await page.evaluate(() => (window as unknown as { kyrieMono: { idle(): Promise<unknown> } }).kyrieMono.idle());
    await page.evaluate(() => document.querySelector<HTMLElement>('[data-action="begin"]')!.click());
    await page.waitForSelector('[data-mode="begin"]', { timeout: 2000 });
    const rows = await page.$$eval('.begin-menu [data-action]', els => els.map(e => [e.getAttribute('data-action'),
      e.textContent?.trim(), e.querySelector('svg') ? 'icon' : '']));
    expect(rows).toEqual([['build', 'Build a character', ''], ['set-out-now', 'Set out now', '']]);
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
});
