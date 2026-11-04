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
// through, not a database browsed. In a1 with the default character, on the real runtime: the town laid out as a
// plan, a place on it chosen and gone to; Bask spoken to and the rats job taken; the corn-store and the cellar under
// it gone into on the plan, the rooms below laid out, the rats fought; back up the way it came, the plan saying where
// the company is at every step; out into the country on the map, and back into the town, seen whole before it is
// walked into. Opt in with KYRIE_BROWSER=1.
class Walk {
  constructor(readonly page: Page, readonly d: MonoDriver) {}
  async here(): Promise<string | undefined> { return (await this.d.inspect()).place?.id; }
  // A place on the plan chosen, and chosen again: gone to.
  async to(place: string) {
    await this.page.click(`.plan-surface [data-place="${place}"]`);
    await this.page.waitForSelector(`.chosen-place[data-id="${place}"]`, { timeout: 30000 });
    await this.page.click(`.plan-surface [data-place="${place}"]`);
    await this.page.waitForSelector(`.plan-surface [data-place="${place}"][aria-current="location"]`, { timeout: 60000 });
    await this.d.settle();
  }
  async plan(): Promise<{ kind: string; here?: string }> {
    return this.page.evaluate(() => ({ kind: document.querySelector('.plan-surface')?.className ?? '',
      here: (document.querySelector('.plan-surface [aria-current="location"]') as HTMLElement | null)?.dataset.place }));
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
    // The town, laid out: the camp chosen on the plan and gone to.
    expect((await w.plan()).here).toBe(await w.here());
    await w.to('region__s2_green');
    expect(await w.here()).toBe('region__s2_green');
    // Bask, at his house door: the rats job, and the key.
    await page.click('[data-subject="region__s2_merchant"] button');
    await driver.settle();
    await driver.pick(c => /^Ask about the rats in the corn-store/.test(c.label), 'the rats');
    await driver.away();
    // Into the corn-store and down: the rooms below laid out, the company where it stands.
    await w.to('region__s2_u_store');
    await driver.pick(c => /^Down to the corn-store cellar/.test(c.label), 'down');
    expect(await page.locator('[data-id="depth"]').textContent()).toBe('One storey down');
    await driver.pick(c => /light|Light/.test(c.label), 'a light');
    expect((await w.plan()).kind).toContain('kind-under');
    await w.to('region__s2_u_warren');
    await driver.pick(c => c.id === 'region__s2_u_rats/0:Attack', 'the rats');
    await driver.fight();
    await driver.away();
    expect(await w.here()).toBe('region__s2_u_warren');
    expect(await page.locator('.plan-surface [data-place="region__s2_u_nest"]').count()).toBe(1);
    // Back the way it came, on the plan.
    await w.to('region__s2_u_cellar');
    await w.to('region__s2_u_store');
    expect((await w.plan()).kind).not.toContain('kind-under');
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
    expect((await w.plan()).here).toBe(await w.here());
    expect(await page.evaluate(() => document.scrollingElement!.scrollHeight <= innerHeight + 1)).toBe(true);
    expect(errors).toEqual([]);
    await page.close();
  }, 600000);
});
