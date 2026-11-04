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
// through, not a database browsed, and its places as they are seen, not graphs of them. In a1 with the default
// character, on the real runtime: the town as it is painted, a way chosen and gone by; Bask spoken to and the rats job
// taken; the corn-store and the cellar under it, the place's words in the light and the way up above them, the rats
// fought; back up the way it came; out into the country on the map, and back into the town, seen whole before it is
// walked into. Opt in with KYRIE_BROWSER=1.
class Walk {
  constructor(readonly page: Page, readonly d: MonoDriver) {}
  async here(): Promise<string | undefined> { return (await this.d.inspect()).place?.id; }
  // A way from here chosen on the scene, and chosen again: gone by.
  async to(place: string) {
    // A way's own going is its choice, or the first of its acts where it has several (a locked door's).
    const way = `.scene-surface :is([data-way="exit:${place}"], [data-way^="exit:${place}/"])`;
    await this.page.click(way);
    await this.page.waitForSelector(`.chosen-place:is([data-id="exit:${place}"], [data-id^="exit:${place}/"])`,
      { timeout: 30000 });
    await this.page.click(way);
    await this.d.settle();
    expect(await this.here()).toBe(place);
  }
  async scene(): Promise<string> {
    return this.page.evaluate(() => document.querySelector('.scene-surface')?.className ?? '');
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

  it('goes from the town\'s plan into the rooms under it and back, and out into the country and in again', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, pointer: false, query: '?world=a1' });
    const w = new Walk(page, driver);
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    // The town as it is painted, its ways along the foot of the painting: the camp chosen, and gone to.
    expect(await w.scene()).toContain('painted');
    await w.to('region__s2_green');
    expect(await w.here()).toBe('region__s2_green');
    // Bask, at his house door: the rats job, and the key.
    await page.click('[data-subject="region__s2_merchant"] button');
    await driver.settle();
    await driver.pick(c => /^Ask about the rats in the corn-store/.test(c.label), 'the rats');
    await driver.away();
    // Into the corn-store and down: under the ground, the place's words in the light, the way up above them.
    await w.to('region__s2_u_store');
    await driver.pick(c => /^Down to the corn-store cellar/.test(c.label), 'down');
    expect(await page.locator('[data-id="depth"]').textContent()).toBe('One storey down');
    await driver.pick(c => /light|Light/.test(c.label), 'a light');
    expect(await w.scene()).toContain('unpainted');
    expect(await page.locator('.scene-surface .openings.up [data-way^="exit:region__s2_u_store"]').count()).toBe(1);
    await w.to('region__s2_u_warren');
    await driver.pick(c => c.id === 'region__s2_u_rats/0:Attack', 'the rats');
    await driver.fight();
    await driver.away();
    expect(await w.here()).toBe('region__s2_u_warren');
    expect(await page.locator('.scene-surface [data-way^="exit:region__s2_u_nest"]').count()).toBe(1);
    // Back the way it came, by the ways from each place.
    await w.to('region__s2_u_cellar');
    await w.to('region__s2_u_store');
    expect(await w.scene()).not.toContain('under');
    // Out into the country by the map, and back: the town seen whole, then walked into.
    await driver.mode('m');
    await page.waitForSelector('.field-land.board[data-board="ready"]', { timeout: 180000 });
    await page.waitForTimeout(4000);
    const you = (await page.locator('.board-you').boundingBox())!;
    await page.mouse.click(you.x + you.width * 2.5, you.y + you.height - 4);
    await page.waitForSelector('.plan [data-action="set-out"]', { timeout: 30000 });
    await page.click('.plan [data-action="set-out"]');
    await driver.settle();
    expect((await driver.inspect()).place?.id).not.toMatch(/^region__s2_/);
    await driver.mode('m');
    await page.waitForSelector('[data-action="map-place"][data-id="region__s2"]', { timeout: 120000 });
    await page.focus('[data-action="map-place"][data-id="region__s2"]');
    await page.keyboard.press('Enter');
    await page.click('.plan [data-action="set-out"]');
    await driver.settle();
    await page.waitForSelector('[data-region="overview"]', { timeout: 60000 });
    await page.click('[data-action="walk-in"]');
    expect(await page.locator('[data-region="overview"]').count()).toBe(0);
    expect(await w.scene()).toContain('painted');
    expect(await page.evaluate(() => document.scrollingElement!.scrollHeight <= innerHeight + 1)).toBe(true);
    expect(errors).toEqual([]);
    await page.close();
  }, 600000);
});
