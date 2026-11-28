/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';
import { LensPages } from './support/lens-pages';

// The interior walk in the browser (the owner, 14 November: CN-08, the half of the acceptance the page shows; the
// headless half is test/interior-walk). In a1's undertown at Millholm, under the corn-store: the salter talked to in
// the town first, then in, where the rail's map has given way to the compass and the column has the way on and the
// way out; a light; the lenses switched, each the scene's own and nothing done by it; the next place by the compass;
// a thing looked at; the rats fought with the target changed from one turn to the next; the place as it was after the
// fight; the way out by the compass, and the town again, where the map is back. At a laptop's 1280 by 800 and an iPad
// upright; screenshots of each step to KYRIE_CONTINUITY_SHOTS where it is given (aesthetic/continuity/).
class Interior {
  constructor(readonly page: Page, readonly d: MonoDriver, readonly size: string) {}
  async shot(name: string) {
    const dir = process.env.KYRIE_CONTINUITY_SHOTS;
    if (!dir) { return; }
    await mkdir(dir, { recursive: true });
    await this.d.settle(); await this.page.waitForTimeout(500);
    await this.page.screenshot({ path: join(dir, `${this.size}-${name}.png`) });
  }
  count(selector: string) { return this.page.locator(selector).count(); }
  // Gone to by the places lens: the way there or the walk there, among its four or the rest unfolded.
  async to(place: string) {
    const { page, d } = this;
    if (!await page.locator('.glance .lens-places').count()) { await d.click('.rail-mark.opens-go'); }
    const row = `.glance .lens :is([data-act="travel:${place}"], [data-act^="exit:${place}"]) >> nth=0`;
    await LensPages.seek(page, row);
    await d.click(row);
  }
  // Inside: the compass where the map was; the way out a row of the engine's offer like any other, its indicator at
  // its left (OR-188: it had been a row of the page's own, an arrow where the indicator stands); nothing across the
  // country offered.
  out() { return this.page.locator('.glance .choice-row', { hasText: /^\s*Out to / }); }
  async inside() {
    const out = this.out();
    return { compass: await this.count('.scene-rail .opens-compass'), map: await this.count('.scene-rail [data-view="map"]'),
      out: await out.count(), marked: await out.locator('> .row-mark').count() };
  }
  async told() { return (await this.d.inspect()).log.length; }
  async place() { return (await this.d.inspect()).place?.id; }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the interior walk, in the browser', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-interior-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1280, 800], [820, 1180]] as const)('at %ix%i', async (width, height) => {
    const { page, driver: d, errors } = await MonoBrowser.page(browser, { width, height }, { site, query: '?world=a1' });
    const w = new Interior(page, d, `${width}x${height}`), steps: string[] = [];
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    // Someone talked to: the salter on the green, of the rats in the corn-store.
    await w.to('region__s2_green');
    await d.talk();
    await d.click('.surface .portraits [data-subject="region__s2_merchant"] .portrait');
    // The job is asked after once told what the matter is (OR-423, OR-370).
    await d.pick(c => /what the matter is/.test(c.label), 'what the matter is');
    await d.pick(c => /^Ask about the rats in the corn-store/.test(c.label), 'the rats');
    await w.shot('01-talked'); steps.push('talked');
    await d.away();
    // In, under the corn-store: the compass, not the map.
    await w.to('region__s2_u_store'); await w.to('region__s2_u_cellar');
    expect(await w.inside()).toEqual({ compass: 1, map: 0, out: 1, marked: 1 });
    await w.shot('02-in-the-cellar'); steps.push('in');
    await d.pick(c => /light|Light/.test(c.label), 'a light');
    // The lenses switched: each drawn in the column, and nothing done by turning one on (nothing told, still here).
    const at = await w.place(), told = await w.told();
    const turned: string[] = [];
    for (const part of ['look', 'wait', 'go'] as const) {
      if (!await w.count(`.rail-mark.opens-${part}:not([disabled])`)) { continue; }
      turned.push(part);
      await d.click(`.rail-mark.opens-${part}`);
      expect([part, await w.count('.glance .lens')]).toEqual([part, 1]);
      await w.shot(`03-lens-${part}`);
      await d.click(`.rail-mark.opens-${part}`);
    }
    expect([await w.place(), await w.told()]).toEqual([at, told]);
    expect(turned.length).toBeGreaterThan(1);
    steps.push(`lenses ${turned.join(', ')}`);
    // The warren by its way.
    if (await w.place() !== 'region__s2_u_warren') { await w.to('region__s2_u_warren'); }
    await w.shot('04-the-way-on');
    // A thing looked at, by the things lens: something told of it.
    if (await w.count('.rail-mark.opens-look:not([disabled])')) { await d.click('.rail-mark.opens-look'); }
    // A row that looks (the lens's first had become an act at a risk, MT-15's culvert, or the way down looked into,
    // SI-09, which a spec of a look should not lean on).
    const looks = '.glance .lens [data-act]:has-text("Look") >> nth=0';
    const thing = page.locator(looks);
    if (await thing.count()) {
      const before = await w.told();
      await d.click(looks);
      // One that asks again before it is done (a change at a risk: the culvert's foul air propped clear, needing brawn,
      // which MT-15 put back by the warren's way down) is chosen again, as a player who has read what it risks, as
      // MonoDriver.pick does.
      if ((await d.inspect()).confirming) { await d.click(looks); }
      expect(await w.told()).toBeGreaterThan(before);
      steps.push('a thing looked at');
    }
    await w.shot('05-a-thing-looked-at');
    if (await w.count('.glance .lens')) { await d.click('.rail-mark.opens-look'); }
    // The rats fought, the target changed from one turn to the next.
    await d.pick(c => c.id === 'region__s2_u_rats/0:Attack', 'the rats');
    const picked: string[] = [];
    for (let guard = 0; guard < 80 && (await d.inspect()).mode === 'combat'; guard++) {
      const state = await d.inspect();
      if (state.combat?.outcome) { await d.pick(c => c.id === 'onward', 'go on'); break; }
      if (!state.combat?.ours) { await page.waitForTimeout(40); continue; }
      if (picked.length < 2 && await w.count('.fight .hand-menu [data-action="attack"]')) {
        await d.click('.fight .hand-menu [data-action="attack"]');
        const targets = page.locator('.fight .foes .fighter.target');
        const n = await targets.count();
        if (n) {
          const at = picked.length % n, id = await targets.nth(at).getAttribute('data-fighter');
          if (picked.length === 1) { await w.shot('06-the-target-changed'); }
          await targets.nth(at).locator('.pick').first().click(); await d.settle();
          picked.push(id ?? '');
          continue;
        }
        await d.key('Escape');
      }
      await d.key('t');
    }
    expect((await d.inspect()).mode).not.toBe('combat');
    if (picked.length > 1) { expect(new Set(picked).size).toBeGreaterThan(1); steps.push('target changed'); }
    // The place as it was after the fight: still inside, its compass and its lenses.
    expect(await w.place()).toBe('region__s2_u_warren');
    expect(await w.inside()).toEqual({ compass: 1, map: 0, out: 1, marked: 1 });
    await w.shot('07-after-the-fight'); steps.push('after the fight');
    // Out by the way out: walked, and the town again, where the map is back (folded with the lenses, once earned) and
    // the compass still, the character's own from the start (OR-1880).
    await d.click('.glance .choice-row:has-text("Out to") >> nth=0');
    expect((await w.inside()).compass).toBe(1);
    expect(await w.count('.scene-rail [data-view="map"]')).toBe(1);
    await w.shot('08-out-in-the-town'); steps.push('out');
    console.log(`INTERIOR ${width}x${height}: ${steps.join(' | ')} (targets ${picked.join(', ')})`);
    expect(errors).toEqual([]);
    await page.close();
  }, 400000);
});
