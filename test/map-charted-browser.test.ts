/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The fresh playtest of 7 November: "A lone tower, on the map", in the Notes, opened the map on the town, the tower
// neither chosen nor in sight; its mark, only heard of, had been given up under the town's card, the card that never
// moves. An aim's place opened on the map from the Notes is chosen there, said on the card, and brought into view clear
// of the card; and nothing only heard of is given up from the map. Opt in with KYRIE_BROWSER=1.
describe.skipIf(!process.env.KYRIE_BROWSER)('an aim\'s place, on the map from the Notes', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-charted-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch(['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']);
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('is chosen, said on the card and brought clear of it', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, pointer: false, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    // Play begins in the town (Mission 20's amendment 1).
    await page.waitForSelector('.world-page.scale-scene', { timeout: 180000 });
    await driver.go('s2_green');
    await driver.mode('j');
    await page.click('.aims-more summary');
    await page.click('[data-action="aim-map"][data-id="region__w1"]');
    await page.waitForSelector('.field-land.board[data-board="ready"]', { timeout: 180000 });
    await page.waitForTimeout(2500);
    const seen = await page.evaluate(() => {
      const mark = document.querySelector('.board-labels [data-id="region__w1"]')!;
      const card = document.querySelector('.world-page.scale-board .focus')!;
      const a = mark.querySelector('i')!.getBoundingClientRect(), b = card.getBoundingClientRect();
      const over = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      const away = [...document.querySelectorAll('.board-sign[data-known="heard"]:not(.off)')]
        .filter(e => e.classList.contains('away')).map(e => e.getAttribute('data-id'));
      return { chosen: mark.classList.contains('chosen'), card: card.textContent ?? '', over, away,
        shown: !mark.classList.contains('off') && !mark.classList.contains('away') };
    });
    expect([seen.chosen, seen.shown, seen.over]).toEqual([true, true, false]);
    expect(seen.card).toContain('Gaudumport');
    expect(seen.away).toEqual([]);
    expect(errors).toEqual([]);
    await page.close();
  }, 500000);
});
