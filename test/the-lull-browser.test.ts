/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// The Lull as a player meets it in the browser: the march road into Sixways, the board by the pump, the Fold-stone,
// the wait, and the valley below the Tump on its morning. Keeps screenshots in doc/adventures/the-lull/playtest when
// LULL_SHOTS is set. Opt in with KYRIE_BROWSER=1.
const shots = process.env.LULL_SHOTS ? 'doc/adventures/the-lull/playtest' : '';
const act = async (d: MonoDriver, ...labels: string[]) => {
  for (const label of labels) {
    for (const part of label.split(' › ')) {
      const re = new RegExp(part, 'i');
      await d.pick(c => re.test(c.label), part);
    }
  }
};
const text = (page: Page) => page.evaluate(() => document.body.innerText);

describe.skipIf(!process.env.KYRIE_BROWSER)('The Lull in the browser', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-lull-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('comes down the march road into Sixways, waits at the stone, and goes down into the Lull on its morning', async () => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, query: '?campaign=the-lull' });
    await page.waitForSelector('[data-action="start"]');
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    expect(await text(page)).toMatch(/a hamlet of one street/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-1-march-road.png` }); }
    await act(d, 'Sixways street');
    expect(await text(page)).toMatch(/the seventh it is a door/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-2-sixways.png` }); }
    await act(d, 'To the Fold-stone', 'Sit down by the Fold-stone');
    expect(await text(page)).toMatch(/another road/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-3-stone.png` }); }
    await act(d, "To the Tump's shoulder");
    expect(await text(page)).toMatch(/the whole valley is below you/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-4-shoulder.png` }); }
    await act(d, 'To Linger green');
    expect(await text(page)).toMatch(/Long Table/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-5-green.png` }); }
    expect(errors).toEqual([]);
  }, 300000);
});
