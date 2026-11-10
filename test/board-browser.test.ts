/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { TestSite } from './support/test-site';
import { MonoBrowser } from './support/mono-browser';

// The map's board (Mission 18, the owner's addendum), where the browser can draw in three dimensions: the country as
// hex tiles over the whole map, where you are on it, each town and place known a button reached by the keys, and a
// town chosen there planned and set out for as on the flat map. Software GL in a headless browser stands in for a
// GPU. Opt in with KYRIE_BROWSER=1.
describe.skipIf(!process.env.KYRIE_BROWSER)('the map\'s board, in three dimensions', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-board-'));
    await TestSite.build(site, {});
    browser = await MonoBrowser.launch(['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']);
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('draws the country, you on it, and plans and sets out for a town chosen by the keys', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, pointer: false, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    const from = (await driver.inspect()).place?.id;
    // Play begins on the map; M raises it again wherever the company is, and keeps it up.
    await driver.mode('m');
    await page.waitForSelector('.field-land.board[data-board="ready"]', { timeout: 180000 });
    const drawn = await page.evaluate(() => {
      const canvas = document.querySelector('.field-land.board canvas')!.getBoundingClientRect();
      const stage = document.querySelector('.world-page .surface')!.getBoundingClientRect();
      return { whole: canvas.width >= stage.width - 1 && canvas.height >= stage.height - 1,
        you: document.querySelectorAll('.board-labels [aria-current="location"]').length,
        towns: document.querySelectorAll('.board-town').length, signs: document.querySelectorAll('.board-sign').length };
    });
    expect(drawn.whole).toBe(true);
    expect(drawn.you).toBe(1);
    expect(drawn.towns).toBeGreaterThan(1);
    await page.focus('[data-action="map-place"][data-id="region__s4"]');
    await page.keyboard.press('Enter');
    expect(await page.textContent('.enter-card')).toContain('Brockfield');
    // Seen is not there: travelled to, come to its gate on the map, then entered (the owner, 5 November).
    expect(await page.locator('.enter-card [data-action="enter-hex"]').count()).toBe(0);
    await page.click('.enter-card [data-action="travel"]');
    await driver.settle();
    // Come to it, or stopped on the way where the map marks it (kite's bridge over the Redwater): either way the map
    // stays up over where the company is, and it is entered from there.
    await page.waitForSelector('.enter-card[data-state="arrived"], .world-page.interrupted', { timeout: 30000 });
    await page.click('[data-action="enter-hex"]');
    const after = await driver.inspect();
    expect([after.mode, after.place?.id !== from]).toEqual(['explore', true]);
    expect(await page.locator('.world-page.scale-scene').count()).toBe(1);
    expect(errors).toEqual([]);
    await page.close();
  }, 400000);
});
