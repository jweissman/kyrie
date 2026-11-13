/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// The game's scenes, each as a player meets it (Mission 21's aesthetic transformation, completion plan §3: designed,
// built and judged scene by scene, not component by component): resting quiet and crowded, a conversation, waiting,
// the Pack, a fight, and the Encyclopedia, at a laptop's 1280 by 800 and an iPad upright. Each holds still and stays
// on the screen: nothing scrolls the page sideways, nothing reaches past the screen's edge, and the scene's own box
// does not move once it has settled. Screenshots of each to KYRIE_SCENE_SHOTS where it is given
// (aesthetic/scenes/<scene>/).
type Box = [number, number, number, number];
class Scenes {
  constructor(readonly page: Page, readonly d: MonoDriver, readonly size: string) {}
  async shot(scene: string, name = 'scene', page = this.page) {
    const dir = process.env.KYRIE_SCENE_SHOTS;
    if (!dir) { return; }
    await mkdir(join(dir, scene), { recursive: true });
    await page.screenshot({ path: join(dir, scene, `${this.size}-${name}.png`) });
  }
  // Settled: the same boxes a moment apart, the page not wider than the screen, nothing past its edge.
  async held(scene: string): Promise<string[]> {
    const { page } = this, faults: string[] = [];
    await this.d.settle(); await page.waitForTimeout(700);
    const boxes = () => page.evaluate(() => [...document.querySelectorAll('button, h1, h2, h3, p, img, figure')]
      .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).slice(0, 80)
      .map(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); }));
    const a = await boxes() as Box[];
    await page.waitForTimeout(500);
    const b = await boxes() as Box[];
    if (JSON.stringify(a) !== JSON.stringify(b)) { faults.push(`${scene}: moved while still`); }
    const wide = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    if (wide) { faults.push(`${scene}: wider than the screen`); }
    const past = await page.evaluate(() => [...document.querySelectorAll('button, .choice-row, .scene-rail')]
      .filter(e => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1);
      })
      .map(e => (e as HTMLElement).className).slice(0, 3));
    if (past.length) { faults.push(`${scene}: past the edge: ${past.join(', ')}`); }
    return faults;
  }
  async to(place: string) {
    const { page, d } = this;
    if (!await page.locator('.glance .lens-places').count()) { await d.click('.rail-mark.opens-go'); }
    const row = `.glance .lens :is([data-act="travel:${place}"], [data-act^="exit:${place}"]) >> nth=0`;
    const all = '.glance .lens [data-action="lens-all"][aria-expanded="false"]';
    if (!await page.locator(row).count() && await page.locator(all).count()) { await d.click(all); }
    await d.click(row);
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the scenes', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-scenes-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1280, 800], [820, 1180]] as const)('at %ix%i each holds still and on the screen', async (width, height) => {
    const { page, driver: d, errors } = await MonoBrowser.page(browser, { width, height }, { site, query: '?world=a1' });
    const s = new Scenes(page, d, `${width}x${height}`), faults: string[] = [];
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    // Resting, quiet: where the company begins.
    faults.push(...await s.held('resting-quiet')); await s.shot('resting-quiet');
    // Waiting: the time lens.
    await d.click('.rail-mark.opens-wait');
    faults.push(...await s.held('waiting')); await s.shot('waiting');
    await d.click('.rail-mark.opens-wait');
    // Resting, crowded: the green, its people shown.
    await s.to('region__s2_green');
    if (await page.locator('.rail-mark.opens-talk[aria-pressed="false"]').count()) { await d.click('.rail-mark.opens-talk'); }
    faults.push(...await s.held('resting-crowded')); await s.shot('resting-crowded');
    // A conversation: the salter.
    await d.click('.surface .portraits [data-subject="region__s2_merchant"] .portrait');
    faults.push(...await s.held('dialogue')); await s.shot('dialogue');
    await d.pick(c => /^Ask about the rats in the corn-store/.test(c.label), 'the rats');
    faults.push(...await s.held('dialogue')); await s.shot('dialogue', 'answered');
    await d.away();
    // The Pack.
    await d.mode('i');
    faults.push(...await s.held('pack')); await s.shot('pack');
    await d.key('Escape');
    // A fight: the rats under the corn-store.
    await s.to('region__s2_u_store'); await s.to('region__s2_u_cellar');
    await d.pick(c => /light|Light/.test(c.label), 'a light');
    await s.to('region__s2_u_warren');
    await d.pick(c => c.id === 'region__s2_u_rats/0:Attack', 'the rats');
    for (let i = 0; i < 100 && !((await d.inspect()).combat?.ours); i++) { await page.waitForTimeout(30); }
    faults.push(...await s.held('combat')); await s.shot('combat');
    await d.click('.fight .hand-menu [data-action="attack"]');
    await s.shot('combat', 'aiming');
    await d.key('Escape');
    // The Encyclopedia: its title page and a chapter, over the game.
    const enc = await browser.newPage({ viewport: { width, height } });
    await enc.goto(`file://${join(site, 'encyclopedia', 'index.html')}`);
    await s.shot('encyclopedia', 'title', enc);
    const first = enc.locator('.cards a.card').first();
    if (await first.count()) {
      await first.click(); await enc.waitForLoadState();
      await s.shot('encyclopedia', 'chapter', enc);
      expect(await enc.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(false);
    }
    await enc.close();
    expect(faults).toEqual([]);
    expect(errors).toEqual([]);
    await page.close();
  }, 400000);
});
