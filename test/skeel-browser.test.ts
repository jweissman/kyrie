/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// Fair Weather as a player meets it in the browser, at a desk: the coast road, the town, the tide-board, and the dog on
// the Strand. Keeps screenshots in doc/adventures/fair-weather/playtest when SKEEL_SHOTS is set. Opt in with
// KYRIE_BROWSER=1.
const shots = process.env.SKEEL_SHOTS ? 'doc/adventures/fair-weather/playtest' : '';
const act = async (d: MonoDriver, ...labels: string[]) => {
  for (const label of labels) {
    for (const part of label.split(' › ')) {
      const re = new RegExp(part, 'i');
      await d.pick(c => re.test(c.label), part);
    }
  }
};
const text = (page: Page) => page.evaluate(() => document.body.innerText);
// What a place shows and what is a touch away: the glance, then Look about (L) and Every way (W), each put away again.
const whole = async (page: Page) => {
  const seen = [await text(page)];
  for (const key of ['l', 'w']) {
    await page.keyboard.press(key); await page.waitForTimeout(150);
    seen.push(await text(page)); await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  }
  return seen.join('\n');
};

describe.skipIf(!process.env.KYRIE_BROWSER)('Fair Weather in the browser', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-skeel-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('comes down the coast road into Skeel, reads the tide-board, and meets the dog on the Strand', async () => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, query: '?campaign=skeel' });
    await page.waitForSelector('[data-action="start"]');
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    expect(await text(page)).toMatch(/nine miles of shining water/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-1-coast-road.png` }); }
    await act(d, '^To Fore Street');
    expect(await whole(page)).toMatch(/Wooden Saints/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-2-fore-street.png` }); }
    await act(d, '^To the quay');
    expect(await whole(page)).toMatch(/THE SEA TAKES THE FIFTH/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-3-quay.png` }); }
    await act(d, '^To the Slip', '^Wait', '^A while', '^Wait', '^A while', '^Wait', '^A while', '^Wait', '^A while', '^Wait', '^A while', '^Wait', '^A while');
    await act(d, '^To the open Strand');
    expect(await whole(page)).toMatch(/black dog|curly dog/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-4-strand.png` }); }
    expect(errors).toEqual([]);
  }, 300000);
});
