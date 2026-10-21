/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../bin/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// The Varrow, played through the real client by keys: rumours and gear in Hollin, the Candle Tombs under Two
// Barrows by torchlight (the rite at the threshold, the gilded lie, the true tomb, the dead door), on to Crake's
// Ford, and up to the Lanthorn's gate to ask for Ninefingers. Opt in with KYRIE_BROWSER=1.
class Valley {
  static readonly query = '?campaign=data/campaigns/varrow.campaign.json';
  static async walk(d: MonoDriver, ...places: string[]) { for (const p of places) { await d.go(p); } }
  static async light(d: MonoDriver) {
    if ((await d.inspect()).choices.some(c => c.label.includes('light a torch'))) {
      await d.pick(c => c.label.includes('light a torch'), 'a torch');
    }
  }
  static async text(page: Page) { return page.evaluate(() => document.body.innerText); }
  static async log(d: MonoDriver) { return (await d.inspect()).log.flatMap(e => e.lines).join(' '); }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the Varrow, in a real browser', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-varrow-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('the Candle Tombs by torchlight, then the road to the Lanthorn\'s gate', async () => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, query: Valley.query });
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]');
    // Hollin: what is said on the road, the reeve's bounty, and torches and a rope from Ottar.
    await Valley.walk(d, 'wheatsheaf');
    await d.do('wenna', 'Ask Wenna what is said');
    expect(await Valley.log(d)).toContain('lights at Two Barrows');
    await Valley.walk(d, 'market', 'reeve_hall');
    await d.do('garrow', 'Ask the reeve');
    await Valley.walk(d, 'market', 'chandlery');
    for (const ware of ['Torch', 'Torch', 'Torch', 'Coil of rope']) { await d.do('ottar', 'Buy'); await d.choose(ware); }
    // Two Barrows: the slot behind the brambles, found by searching.
    await Valley.walk(d, 'market', 'barrows');
    await d.pick(c => c.label.startsWith('Search here'), 'search');
    await d.go('antechamber');
    await Valley.light(d);
    // The rite: a candle at the threshold, and the dead sleep.
    await d.do('threshold', 'Light a candle');
    await Valley.walk(d, 'processional', 'gilded');
    await d.do('image', 'Look closely');
    expect(await Valley.log(d)).toContain('gilded lead');
    await d.do('image', 'Try', 'Push');
    await Valley.light(d);
    await d.go('true_tomb');
    await Valley.light(d);
    await d.do('coffin_lid', 'Examine');
    await d.do('disc', 'Take out');
    expect((await d.inspect()).log.flatMap(e => e.lines).join(' ')).not.toContain('sits up in an alcove');
    await Valley.light(d);
    await Valley.walk(d, 'far_barrow', 'barrows');
    // On to the ford, and the smith who knows the goat path.
    await Valley.walk(d, 'alders', 'ford_green', 'smithy');
    await d.do('jory', 'Ask Jory');
    expect(await Valley.log(d)).toContain('goat path');
    // Saved as it goes: a reloaded page continues the same company, at the same place and hour.
    const [place, clock] = [(await d.inspect()).place?.id, await page.textContent('[data-id="clock"]')];
    await page.reload();
    await d.click('[data-action="continue"]');
    await page.waitForSelector('[data-mode="explore"]');
    expect([(await d.inspect()).place?.id, await page.textContent('[data-id="clock"]')]).toEqual([place, clock]);
    await d.mode('j');
    const journal = await page.textContent('.known');
    expect([journal?.includes('Lamplighters'), journal?.includes('goat path')]).toEqual([true, true]);
    expect((await MonoBrowser.metrics(page)).scroll).toBe(false);
    expect(errors).toEqual([]);
    await page.close();
  }, 600000);
});
