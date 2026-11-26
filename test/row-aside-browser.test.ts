/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// No words cut to a stub on a phone (the owner, 26 November). A row's aside is said whole or not at all (RowAside):
// beside the drove's aim on Porthalen's green at 390 wide, "take it up as your aim" had been cut to "t.". And a map
// card taller than the room above the dock says it goes on (its foot faded, data-more), where it had been cut at the
// screen's foot with nothing to say so. Opt in with KYRIE_BROWSER=1.
class Cut {
  // Every aside drawn: its words, and whether it shows them whole (or is dropped, showing none of them).
  static asides(page: Page) {
    return page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.row-aside')]
      .filter(e => e.offsetParent !== null).map(e => ({ words: e.textContent ?? '', whole: e.scrollWidth <= e.clientWidth + 1 })));
  }
}
describe.skipIf(!process.env.KYRIE_BROWSER)('a row\'s aside at 390', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-aside-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  it('is whole or not there, on the green and on the map, and a long map card says it goes on', async () => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 390, height: 844 },
      { site, pointer: true, query: '?world=iscoed' });
    await page.waitForFunction(() => 'kyrieMono' in window, null, { timeout: 120000 });
    await page.evaluate(`window.kyrieMono.begin(${JSON.stringify({ campaign: 'world', seed: 'iscoed', origin: 'drove',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }], opening: 'none' })})`);
    await page.waitForFunction('window.kyrieMono.inspect().mode === "explore"', null, { timeout: 180000 });
    await page.evaluate(() => document.fonts.ready);
    const green = await Cut.asides(page);
    expect(green.filter(a => !a.whole)).toEqual([]);
    await d.mode('m');
    await page.waitForSelector('[data-action="map-view"]', { timeout: 20000 });
    await page.click('[data-action="map-view"] >> nth=0');
    await page.waitForSelector('.route-card [data-action="set-out"]');
    expect((await Cut.asides(page)).filter(a => !a.whole)).toEqual([]);
    const card = await page.locator('.route-card').evaluate(e => ({ more: e.scrollHeight > e.clientHeight + 4,
      said: e.hasAttribute('data-more') }));
    expect(card).toEqual({ more: true, said: true });
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
});
