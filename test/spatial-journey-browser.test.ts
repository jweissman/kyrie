/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// The spatial journey (doc/architecture/mission-19/spatial-play.md; the owner, 4 November evening): a world moved
// through, not a database browsed. In a1 with the default character, on the real runtime: the town as it is painted,
// every way from it beside the picture and taken at a touch; Bask spoken to and the rats job taken; the corn-store
// and the cellar under it (a painting of a dim room, the way up among its ways), the rats fought; back up the way it
// came; out into the country, where the world map is the whole stage and the hex the company stands in is described
// and entered, not acted in; and back into the town from its card on the map. Opt in with KYRIE_BROWSER=1.
class Walk {
  constructor(readonly page: Page, readonly d: MonoDriver) {}
  async here(): Promise<string | undefined> { return (await this.d.inspect()).place?.id; }
  // A way from here, taken as a player takes it: Go…, and its name in the wayfinder, which goes at a click; a place in
  // another quarter of the town by that quarter first (its row says what it holds), then from there.
  async to(place: string) {
    // With one way on, it is offered as itself ("To the yard…"), and taken at once (M19-109).
    if (await this.page.locator('.act.opens-go').count()) {
      await this.page.click('.opens-go'); await this.d.settle();
      expect(await this.here()).toBe(place); return;
    }
    await this.page.click('.opens-go');
    const quarter = this.page.locator(`.wayfinder [data-holds~="${place}"]`);
    if (await quarter.count()) {
      await quarter.click(); await this.d.settle();
      // The place may be the quarter's heart, where its row goes.
      if (await this.here() === place) { return; }
      await this.page.click('.opens-go');
    }
    await this.d.goBy(`.wayfinder :is([data-pick="exit:${place}"], [data-pick^="exit:${place}/"], `
      + `[data-pick="travel:${place}"])`);
    expect(await this.here()).toBe(place);
  }
  async page_(): Promise<string> {
    return this.page.evaluate(() => document.querySelector('.world-page')?.className ?? '');
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('a journey through the world, laid out', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-spatial-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('goes into the rooms under the town and back, and out onto the map and in again', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, pointer: false, query: '?world=a1' });
    const w = new Walk(page, driver);
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    // Play begins in the town, as it is painted (Mission 20's amendment 1: no longer on the map), nothing over the
    // picture but whoever is here, and no list of ways.
    expect(await w.page_()).toContain('scale-scene');
    expect(await page.locator('.scene-surface button, .scene-surface nav, .focus .ways-here').count()).toBe(0);
    await w.to('region__s2_green');
    // Bask, at his house door, by his likeness on the picture: the rats job, and the key.
    await page.click('.surface .portraits [data-subject="region__s2_merchant"] .portrait');
    await driver.settle();
    await driver.pick(c => /^Ask about the rats in the corn-store/.test(c.label), 'the rats');
    await driver.away();
    // Into the corn-store and down: a picture of a dim room, the depth said, the way up among the ways.
    await w.to('region__s2_u_store');
    await w.to('region__s2_u_cellar');
    expect(await page.locator('[data-id="depth"]').textContent()).toBe('One storey down');
    await driver.pick(c => /light|Light/.test(c.label), 'a light');
    expect(await page.locator('.scene-surface .scenery img').count()).toBe(1);
    await page.click('.opens-go');
    expect(await page.locator('.wayfinder .wf-row .glyph.whither-up').count()).toBe(1);
    await page.click('[data-action="explore-shut"]');
    await w.to('region__s2_u_warren');
    await driver.pick(c => c.id === 'region__s2_u_rats/0:Attack', 'the rats');
    await driver.fight();
    await driver.away();
    expect(await w.here()).toBe('region__s2_u_warren');
    // Back the way it came.
    await w.to('region__s2_u_cellar');
    await w.to('region__s2_u_store');
    await w.to('region__s2_green');
    // Out into the country by the map, the one map: raised over the stage, a hex beside the town chosen and set out
    // for; there the map is the whole stage, the hex described, entered by its button.
    await driver.mode('m');
    expect(await w.page_()).toContain('scale-board');
    await page.waitForSelector('.field-land.board[data-board="ready"]', { timeout: 180000 });
    await page.waitForTimeout(4000);
    const you = (await page.locator('.board-you').boundingBox())!;
    await page.mouse.click(you.x + you.width * 2.5, you.y + you.height - 4);
    await page.waitForSelector('.plan [data-action="set-out"]', { timeout: 30000 });
    await page.click('.plan [data-action="set-out"]');
    await driver.settle();
    expect((await driver.inspect()).place?.id).not.toMatch(/^region__s2_/);
    expect(await w.page_()).toContain('scale-board');
    expect(await page.locator('.focus .ways-here, .focus .plates').count()).toBe(0);
    await page.click('[data-action="enter-hex"]');
    expect(await w.page_()).toContain('scale-scene');
    await page.click('[data-action="back-to-map"]');
    expect(await w.page_()).toContain('scale-board');
    // Back to the town from its card on the map: chosen, travelled to, come to, and entered by its large button.
    await page.waitForSelector('[data-action="map-place"][data-id="region__s2"]', { timeout: 120000 });
    await page.click('[data-action="map-place"][data-id="region__s2"]');
    await page.click('.enter-card [data-action="travel"]');
    await driver.settle();
    await page.click('.enter-card[data-state="arrived"] [data-action="enter-hex"]');
    expect((await driver.inspect()).place?.id).toMatch(/^region__s2_/);
    expect(await w.page_()).toContain('scale-scene');
    expect(await page.evaluate(() => document.scrollingElement!.scrollHeight <= innerHeight + 1)).toBe(true);
    expect(errors).toEqual([]);
    await page.close();
  }, 600000);
});
