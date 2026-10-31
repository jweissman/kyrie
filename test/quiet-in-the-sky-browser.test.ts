/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// The Quiet in the Sky as a player meets it in the browser: the valley road into Larum, the Hark, the guide, the White,
// the Teller at the Coming-in, the Field, and Halt. Keeps screenshots in doc/adventures/the-quiet-in-the-sky/playtest
// when LARUM_SHOTS is set. Opt in with KYRIE_BROWSER=1.
const shots = process.env.LARUM_SHOTS ? 'doc/adventures/the-quiet-in-the-sky/playtest' : '';
const act = async (d: MonoDriver, ...labels: string[]) => {
  for (const label of labels) {
    for (const part of label.split(' › ')) {
      const re = new RegExp(part, 'i');
      await d.pick(c => re.test(c.label), part);
    }
  }
};
const text = (page: Page) => page.evaluate(() => document.body.innerText);

describe.skipIf(!process.env.KYRIE_BROWSER)('The Quiet in the Sky in the browser', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-larum-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('comes up the valley road into Larum, goes up through the White with the guide, and down onto the Field to Halt', async () => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, query: '?campaign=the-quiet-in-the-sky' });
    await page.waitForSelector('[data-action="start"]');
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    expect(await text(page)).toMatch(/turf-roofed houses/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-1-valley-road.png` }); }
    await act(d, 'To Larum street', 'Into the Hark');
    expect(await text(page)).toMatch(/BALLAD OF HALVARD ELD/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-2-hark.png` }); }
    await act(d, 'Talk to Bet Garside', 'Ask why she cannot sleep');
    if (shots) { await page.screenshot({ path: `${shots}/browser-3-bet.png` }); }
    await act(d, 'Take your leave', 'Out to Larum street', "Into the guide's house", 'Talk to Jory', 'Pay Jory Whitlock six coin|six coin');
    expect(await text(page)).toMatch(/no column for breathing/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-4-coming-in.png` }); }
    await act(d, 'To the southern Field', 'To Trophy Row');
    expect(await text(page)).toMatch(/walls of shields/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-5-halt.png` }); }
    await act(d, 'To the ring of spears');
    expect(await text(page)).toMatch(/ring of spears/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-6-ring.png` }); }
    expect(errors).toEqual([]);
  }, 300000);
});
