/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The map's board (Mission 18, the owner's addendum), where the browser can draw in three dimensions: the country as
// hex tiles over the whole map, where you are on it, each town and place known a button reached by the keys, and a
// town chosen there planned and set out for as on the flat map. Software GL in a headless browser stands in for a
// GPU. Opt in with KYRIE_BROWSER=1.
describe.skipIf(!process.env.KYRIE_BROWSER)('the map\'s board, in three dimensions', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-board-'));
    await SiteBuild.site(site, {});
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
    await driver.mode('m');
    await page.waitForSelector('.field-land.board[data-board="ready"]', { timeout: 180000 });
    const drawn = await page.evaluate(() => {
      const canvas = document.querySelector('.field-land.board canvas')!.getBoundingClientRect();
      return { whole: canvas.width >= innerWidth - 1 && canvas.height >= innerHeight - 1,
        you: document.querySelectorAll('.board-labels [aria-current="location"]').length,
        towns: document.querySelectorAll('.board-town').length, signs: document.querySelectorAll('.board-sign').length };
    });
    expect(drawn.whole).toBe(true);
    expect(drawn.you).toBe(1);
    expect(drawn.towns).toBeGreaterThan(1);
    await page.focus('[data-action="map-place"][data-id="region__s4"]');
    await page.keyboard.press('Enter');
    expect(await page.textContent('.plan')).toContain('Fearnglaed');
    await page.click('[data-action="set-out"]');
    await driver.settle();
    const after = await driver.inspect();
    expect([after.mode, after.place?.id !== from]).toEqual(['explore', true]);
    expect(errors).toEqual([]);
    await page.close();
  }, 400000);
});
