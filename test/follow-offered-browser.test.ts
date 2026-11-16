/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// One action grammar (the owner, 15 November: a stray "Follow this" sent the player to the roadmap, and nothing at the
// end of it said what to do): an aim held and not followed is offered as an act among the four, never as a button of
// its own in the prose; chosen, the aim's next step is gold and stays so, and the offer is gone.
class Journey {
  static async open(page: Page) {
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('.prologue-page', { timeout: 120000 });
    await page.keyboard.press('Escape');
    for (let i = 0; i < 40 && await page.locator('.prologue-page').count(); i++) {
      const meeting = page.locator('.page-meeting [data-act], .page-meeting button').first();
      if (await page.locator('.page-meeting').count() && await meeting.count()) { await meeting.click(); }
      else { await page.keyboard.press('Enter'); }
      await page.waitForTimeout(700);
    }
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
  }
}
describe.skipIf(!process.env.KYRIE_BROWSER)('following an aim', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-follow-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  it('is an act among the four, and its next step stays gold once chosen', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1280, height: 800 }, { site, pointer: false,
      query: '?world=a1&opening' });
    await Journey.open(page);
    const follow = page.locator('[data-choice^="follow:"]');
    expect(await page.locator('.follow-aim').count()).toBe(0);
    expect(await follow.count()).toBe(1);
    await follow.click();
    await page.waitForSelector('li[data-continues]', { timeout: 30000 });
    expect(await follow.count()).toBe(0);
    expect(await page.locator('.follow-aim').count()).toBe(0);
    // Gold is steady, never a flash: the same next step is gold at every sample, and a way on is always offered.
    for (let i = 0; i < 4; i++) {
      expect(await page.locator('li[data-continues]').count()).toBe(1);
      await page.waitForTimeout(400);
    }
    // Taken to the map, the aim's road is the one the set-out is gold on (not cream beside a gold invitation).
    await page.keyboard.press('m');
    await page.waitForSelector('.route-card', { timeout: 30000 });
    expect(await page.locator('.rc-go.aimed').count()).toBe(1);
    // Set out on it: at the end, the scene is back with acts to take, and the aim's next step still gold or finished.
    await page.click('.rc-go.aimed');
    await page.waitForTimeout(8000);
    // Never inert: some control to go on with is on the page, whether the map or the scene. (Known gap, register PB-14:
    // stopped on the road by a meeting, the map offers Enter here but not the aim's own gold Set out to Millholm.)
    expect(await page.locator('button:visible').count()).toBeGreaterThan(0);
    // The map is a focus with its own menu (travel, the nearest roads, Put away the map): a road is taken from it
    // as an act,
    // and putting the map away brings the scene's four back, none of which is a road over into another hex.
    const roads = page.locator('.map-menu [data-action="map-road"]');
    if (await roads.count()) {
      await roads.first().click();
      await page.waitForFunction(() => !(window as unknown as { kyrieMono: { inspect(): { pending: boolean } } })
        .kyrieMono.inspect().pending, null, { timeout: 120000 });
      await page.waitForTimeout(2500);
    }
    const away = page.locator('[data-action="put-away-map"], [data-action="back-to-place"]').first();
    await away.click(); await page.waitForTimeout(2500);
    await page.waitForSelector('ol.led li', { timeout: 60000 });
    expect(await page.locator('ol.led li').count()).toBeGreaterThan(0);
    expect(await page.locator('ol.led li').count()).toBeLessThanOrEqual(5);
    expect(errors).toEqual([]);
  }, 300000);
  // A character who perceives no gold can still go: the map's set-out is there, not gold, and travelling by it comes
  // to a scene with acts to take (the owner, 15 November: gold is never required for ordinary travel).
  it('travels from the map with no aim followed, the set-out not gold', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1280, height: 800 }, { site, pointer: false,
      query: '?world=a1&opening' });
    await Journey.open(page);
    expect(await page.locator('[data-choice^="follow:"]').count()).toBe(1);
    await page.keyboard.press('m');
    await page.waitForSelector('.board-you', { timeout: 30000 });
    const you = (await page.locator('.board-you').boundingBox())!;
    await page.mouse.click(you.x + you.width * 2.5, you.y + you.height - 4);
    await page.waitForSelector('.rc-go', { timeout: 30000 });
    expect(await page.locator('.rc-go.aimed').count()).toBe(0);
    await page.click('.rc-go');
    await page.waitForFunction(() => !(window as unknown as { kyrieMono: { inspect(): { pending: boolean } } })
      .kyrieMono.inspect().pending, null, { timeout: 120000 });
    await page.waitForTimeout(3000);
    expect(await page.locator('button:visible').count()).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  }, 300000);
});
