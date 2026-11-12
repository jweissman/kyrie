/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';
import { SafeZone } from './support/safe-zone';

// Everything that can be touched stays inside the safe zone the page itself draws (?safe), through the first hour's
// pages, as a player goes through them: the life chosen, the road in, the town, Go… opened, a talk, the corn-store and
// its cellar, the rats fought and after, the map, and a town's own country, where the way into the town is offered on
// the map's card (the owner, 11 November late: safe zones not reliably respected; and in a town's hex the town had
// been only under Go…). At an iPad held either way, a desktop and a phone (SAFE_SIZES); SAFE_SHOTS keeps a picture of
// each page with the zone drawn. Opt in with KYRIE_BROWSER=1.
const sizes = (process.env.SAFE_SIZES ?? '1180x820,390x844').split(',').map(s => s.split('x').map(Number) as [number, number]);
class Pages {
  readonly found: string[] = [];
  constructor(readonly page: Page, readonly d: MonoDriver, readonly size: string) {}
  async check(name: string) {
    await this.d.settle();
    for (const b of await SafeZone.breaches(this.page)) { this.found.push(`${this.size} ${name}: ${b}`); }
    if (process.env.SAFE_SHOTS) {
      await mkdir(process.env.SAFE_SHOTS, { recursive: true });
      await this.page.screenshot({ path: join(process.env.SAFE_SHOTS, `${this.size}-${name}.png`) });
    }
  }
  async here(): Promise<string | undefined> { return (await this.d.inspect()).place?.id; }
  async to(place: string) {
    if (await this.page.locator('.act.opens-go').count()) { await this.page.click('.opens-go'); await this.d.settle(); return; }
    await this.page.click('.opens-go');
    const quarter = this.page.locator(`.wayfinder [data-holds~="${place}"]`);
    if (await quarter.count()) {
      await quarter.click(); await this.d.settle();
      if (await this.here() === place) { return; }
      await this.page.click('.opens-go');
    }
    await this.d.goBy(`.wayfinder :is([data-pick="exit:${place}"], [data-pick^="exit:${place}/"])`);
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the safe zone', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-safe-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  for (const [width, height] of sizes) {
    it(`holds everything that can be touched at ${width}×${height}`, async () => {
      const { page, driver } = await MonoBrowser.page(browser, { width, height },
        { site, pointer: false, query: '?world=a1&safe' });
      const p = new Pages(page, driver, `${width}x${height}`);
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      await p.check('creation');
      await page.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
      await p.check('opening');
      await p.to('region__s2_green');
      await p.check('town');
      await page.click('.opens-go'); await p.check('go-open'); await driver.key('Escape');
      await driver.talk(); await p.check('talk-lens');
      await page.click('.surface .portraits [data-subject="region__s2_merchant"] .portrait');
      await p.check('talk');
      await driver.pick(c => /^Ask about the rats in the corn-store/.test(c.label), 'the rats');
      // The job taken up, followed from the talk by its id: offered on the aim's line, and gone once it is followed.
      expect(await page.locator('.lines .line.aim .follow-aim').count()).toBe(1);
      await page.click('.lines .line.aim .follow-aim'); await driver.settle();
      await page.waitForSelector('.lines .line.aim .follow-aim', { state: 'detached', timeout: 10000 });
      await driver.away();
      await p.to('region__s2_u_store');
      await p.to('region__s2_u_cellar');
      await driver.pick(c => /light|Light/.test(c.label), 'a light');
      await p.check('cellar');
      await p.to('region__s2_u_warren');
      await driver.pick(c => c.id === 'region__s2_u_rats/0:Attack', 'the rats');
      let fought = false;
      for (let guard = 0; guard < 200; guard++) {
        const state = await driver.inspect();
        if (state.mode !== 'combat') { break; }
        if (state.combat?.ours && !state.combat.outcome) {
          if (!fought) { await p.check('fight'); fought = true; }
          await driver.key('t');
        }
        else if (state.combat?.outcome) { await p.check('fight-end'); await driver.pick(c => c.id === 'onward', 'go on'); }
        else { await page.waitForTimeout(20); }
      }
      await p.check('after-fight');
      await p.to('region__s2_u_cellar'); await p.to('region__s2_u_store'); await p.to('region__s2_green');
      // Out by the map to the next hex, and back into Millholm's own country (a1: hex 89) by its step.
      await driver.mode('m');
      await page.waitForSelector('.field-land.board[data-board="ready"]', { timeout: 180000 });
      await p.check('map');
      const you = (await page.locator('.board-you').boundingBox())!;
      await page.mouse.click(you.x + you.width * 2.5, you.y + you.height - 4);
      await page.waitForSelector('.plan [data-action="set-out"]', { timeout: 30000 });
      await p.check('map-chosen');
      await page.click('.plan [data-action="set-out"]');
      await driver.settle();
      await p.check('hex');
      // Into Millholm's own country (a1: hex 89), as a journey across country comes to it or is stopped in it: the
      // board's tap on the hex takes the town, so the journey is made as automation makes one (kyrieMono.act).
      await page.evaluate(() => (window as unknown as { kyrieMono: { act(c: string, s: string): void } }).kyrieMono
        .act('travel:region__t89', 'Go to the country about Millholm'));
      await page.waitForSelector('.hex-card .entrance', { timeout: 60000 });
      await p.check('town-hex');
      // The way into the town at hand, on the card, by name.
      expect(await page.locator('.hex-card .entrance').textContent()).toContain('Enter Millholm');
      await page.click('.hex-card .entrance');
      await driver.settle();
      expect(await p.here()).toMatch(/^region__s2_/);
      await p.check('entered');
      expect(p.found).toEqual([]);
      await page.close();
    }, 900000);
  }
});
