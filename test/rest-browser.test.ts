/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The place at rest and the pack as the owner's own play of 7 November met them, coming home to Broadholm: Look…
// offers no close look that finds nothing, opens over the picture alone with the telling and the place's touches still
// to hand, and goes away once nothing is left at hand; the wagoner whose thanks would pay two coin is badged, and
// named with a capital where his page heads; taking leave is drawn whole, not dashed; everyone in the market-place is
// on the picture, with no likeness set into the telling; the pack is a grid of plates, the one chosen said beside it.
// Opt in with KYRIE_BROWSER=1.
class Rest {
  static count(page: Page, selector: string) { return page.locator(selector).count(); }
  // Whether the place's touches beside Look… are uncovered: the topmost thing at the middle of each is itself.
  static touchable(page: Page) {
    return page.evaluate(() => Array.from(document.querySelectorAll('.focus .openers > *')).every(e => {
      const r = e.getBoundingClientRect(), top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return !!top && e.contains(top);
    }));
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('a place at rest, and the pack', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-rest-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1280, 800], [1024, 1366]] as const)('at %ix%i', async (width, height) => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width, height }, { site, query: '?world=kite' });
    await page.waitForSelector('[data-action="start"]', { timeout: 120000 });
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await d.enter();
    await d.talk();
    const carter = '.surface .portraits li[data-subject="origin__carter"]';
    expect([await Rest.count(page, carter), await Rest.count(page, `${carter}.owed`)]).toEqual([1, 0]);
    // Look… turns on the things lens in the scene (CN-01): no page over the place, nothing modal, no "look closely".
    await d.click('.opens-look');
    expect([await Rest.count(page, '.glance .lens-things'), await Rest.count(page, '.explorer'),
      await Rest.count(page, '[aria-modal="true"]')]).toEqual([1, 0, 0]);
    expect(await page.locator('.glance .lens').innerText()).not.toMatch(/look closely/i);
    expect(await Rest.touchable(page)).toBe(true);
    const shoulder = page.locator('.glance .lens [data-act] >> text=/^Put your shoulder/');
    if (!await shoulder.count()) { await d.click('.glance .lens [data-action="lens-all"]'); }
    await shoulder.first().click(); await d.settle();
    // Done, it is not offered again, what came of it is told on the place, and the wagoner is owed.
    expect(await Rest.count(page, '.glance [data-act] >> text=/^Put your shoulder/')).toBe(0);
    expect(await page.locator('.focus').innerText()).toMatch(/stands square on the road again/);
    // Owed, by the likeness's one pip, which says so (see Pip).
    expect(await Rest.count(page, `${carter}.owed .pip[aria-label*="to gain"]`)).toBe(1);
    await d.click(`${carter} .portrait`);
    expect(await page.locator('.sitter .n').innerText()).toBe('The wagoner');
    expect(await page.locator('.dialogue .leave .act').evaluate(e => getComputedStyle(e).borderTopStyle)).toBe('solid');
    await d.click('.replies .act >> text=/Let him thank you/');
    await d.away();
    expect(await Rest.count(page, `${carter}.owed`)).toBe(0);
    // The one way on, among the four the engine offers (Glance.offer) or as itself.
    await d.click(await Rest.count(page, '.act.opens-go') ? '.act.opens-go' : 'ol.led [data-act^="exit:"] >> nth=0');
    // Everyone in the market-place on the picture under Talk (Kite's has seven), none folded away; no likeness in the
    // telling. Turned on, Talk puts Go's ways away.
    await d.talk();
    expect(await Rest.count(page, '.surface .portraits > li')).toBeGreaterThan(5);
    expect([await Rest.count(page, '.portrait.more'), await Rest.count(page, '.told-col img')]).toEqual([0, 0]);
    await d.mode('i');
    expect(await Rest.count(page, '.pack-grid .pack-tile .pack-plate img')).toBeGreaterThan(2);
    await d.click('.pack-tile >> text=/^A torch$/');
    expect(await page.locator('.pack-chosen h4').innerText()).toBe('A torch');
    expect(await Rest.count(page, '.pack-chosen .act')).toBeGreaterThan(0);
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
});
