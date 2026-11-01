/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// Behind the Wainscot as a player meets it in the browser: the moor road into Bootscrape, the notice on the Mat's
// door, the doorstep and the Slot, the Letterdrift, the Wainscot, and the Long Clock at dusk. Keeps screenshots in
// doc/adventures/behind-the-wainscot/playtest when HOLLINS_SHOTS is set. Opt in with KYRIE_BROWSER=1.
const shots = process.env.HOLLINS_SHOTS ? 'doc/adventures/behind-the-wainscot/playtest' : '';
const act = async (d: MonoDriver, ...labels: string[]) => {
  for (const label of labels) {
    for (const part of label.split(' › ')) {
      const re = new RegExp(part, 'i');
      await d.pick(c => re.test(c.label), part);
    }
  }
};
const text = (page: Page) => page.evaluate(() => document.body.innerText);

describe.skipIf(!process.env.KYRIE_BROWSER)('Behind the Wainscot in the browser', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-hollins-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('comes down the moor road into Bootscrape, goes in by the Slot, and is in the Hall when the Clock strikes', async () => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, query: '?campaign=hollins' });
    await page.waitForSelector('[data-action="start"]');
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    expect(await text(page)).toMatch(/windows in it, each window as tall as a church/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-1-moor-road.png` }); }
    await act(d, 'To Bootscrape street');
    expect(await text(page)).toMatch(/WANTED, A RATCATCHER/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-2-bootscrape.png` }); }
    await act(d, 'To the top of the doorstep', 'by the Slot', 'To the Letterdrift');
    expect(await text(page)).toMatch(/three hundred years of letters/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-3-letterdrift.png` }); }
    await act(d, 'To the Skirting');
    if (shots) { await page.screenshot({ path: `${shots}/browser-4-skirting.png` }); }
    await act(d, 'To the Hearth');
    expect(await text(page)).toMatch(/town in a cold grate/);
    if (shots) { await page.screenshot({ path: `${shots}/browser-5-hearth.png` }); }
    await act(d, 'To the Skirting', 'To the Readers', 'To the Library floor', 'To the chart table');
    if (shots) { await page.screenshot({ path: `${shots}/browser-6-chart.png` }); }
    // She cannot be spoken to before she knows anyone is there: no conversation is offered with her.
    expect(await text(page)).not.toMatch(/Talk to the Lady/);
    expect(await text(page)).toMatch(/glass as big as a millpond/);
    expect(errors).toEqual([]);
  }, 300000);
});
