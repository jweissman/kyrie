/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';
import { LensPages } from './support/lens-pages';
import { Rail } from './support/rail';
import { PlacePages } from './support/place-pages';

// The fight holds still (CN-06, the owner, 14 November: "Selecting an enemy currently causes its card to expand
// vertically … switching targets must not reflow the scene"; "the highlighted menu unexpectedly becomes a horizontal
// row"). The rats under Millholm's corn-store, three of them, at a laptop's 1280 by 800 and an iPad upright: every
// card, the hand and each row of its menu keep their boxes from choosing, through a kind opened and put away, aiming
// and moving the reticle from rat to rat, to after the blow; the menu is a column; nothing is outside the safe zone.
type Box = [number, number, number, number];
class Walk {
  static async boxes(page: Page): Promise<Record<string, Box>> {
    return page.evaluate(() => {
      const box = (e: Element): [number, number, number, number] => {
        const r = e.getBoundingClientRect();
        return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)];
      };
      const out: Record<string, [number, number, number, number]> = {};
      // A card where it stands in the field (its scroll added back): the field scrolling is not the field reflowing.
      const sides = document.querySelector('.fight .sides');
      document.querySelectorAll('.fight .fighter').forEach(f => {
        const [x, y, w, h] = box(f);
        out[`card ${(f as HTMLElement).dataset.fighter}`] = [x, y + Math.round(sides?.scrollTop ?? 0), w, h];
      });
      for (const sel of ['.fight .sides', '.fight .hand', '.fight .hand-menu', '.fight .hand-detail']) {
        const e = document.querySelector(sel);
        if (e) { out[sel] = box(e); }
      }
      document.querySelectorAll('.fight .hand-menu > button').forEach((b, i) => { out[`row ${i}`] = box(b); });
      return out;
    });
  }
  // A column: every row of the menu at one left edge, each below the one before.
  static async column(page: Page): Promise<boolean> {
    return page.evaluate(() => {
      const rows = [...document.querySelectorAll('.fight .hand-menu > button')].map(b => b.getBoundingClientRect());
      return rows.length > 0
        && rows.every((r, i) => i === 0 || (Math.abs(r.left - rows[0]!.left) < 1 && r.top >= rows[i - 1]!.bottom - 1));
    });
  }
  // How far the hand's first row stands from the frame's menu column, where every page's rows stand (--menu-x).
  static async columned(page: Page): Promise<{ x: number; width: number }> {
    return page.evaluate(() => {
      const shell = getComputedStyle(document.querySelector('.shell')!), px = (v: string) => {
        const probe = document.createElement('div'); probe.style.width = v; document.body.append(probe);
        const w = probe.getBoundingClientRect().width; probe.remove(); return w;
      };
      const r = document.querySelector('.fight .hand-menu > button')!.getBoundingClientRect();
      return { x: r.left - px(shell.getPropertyValue('--menu-x')),
        width: r.width - px(shell.getPropertyValue('--menu-rows')) };
    });
  }
  static moved(a: Record<string, Box>, b: Record<string, Box>): string[] {
    return Object.keys(a).filter(k => b[k] && a[k]!.some((v, i) => Math.abs(v - b[k]![i]!) > 1))
      .map(k => `${k}: ${a[k]!.join(',')} → ${b[k]!.join(',')}`);
  }

  constructor(readonly page: Page, readonly d: MonoDriver) {}
  // Gone to by the places lens (CN-01): the way there or the walk there, among its four or the rest unfolded.
  async to(place: string) {
    const { page } = this;
    if (await page.locator('.act.opens-go').count()) { await Rail.click(page, '.opens-go'); await this.d.settle(); return; }
    await Rail.click(page, '.opens-go');
    const row = `.glance .lens :is([data-act="travel:${place}"], [data-act^="exit:${place}"]) >> nth=0`;
    await LensPages.seek(page, row);
    // A journey is held to set out on (OR-111); the driver holds what is held.
    await this.d.click(row);
  }

  // Into the rats' fight: the salter's job, the corn-store, its cellar lit, the rat-runs.
  async rats() {
    const { page, d } = this;
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await this.to('region__s2_green');
    // Talked to by her row, on whichever of the place's pages holds it (OR-1490: one menu; OR-1564: her portrait had
    // been pressed, which no longer opens a talk there, and the walk stopped before the fight).
    const bask = '.glance ol.led [data-act="region__s2_merchant#talk"]';
    if (await PlacePages.seek(page, bask, () => d.settle())) { await d.click(bask); } else {
      await d.talk(); await page.click('.surface .portraits [data-subject="region__s2_merchant"] .portrait');
    }
    await d.settle();
    // The job is asked after once told what the matter is (OR-423, OR-370).
    await d.pick(c => /what the matter is/.test(c.label), 'what the matter is');
    await d.pick(c => /^Ask about the rats in the corn-store/.test(c.label), 'the rats');
    await d.away();
    await this.to('region__s2_u_store'); await this.to('region__s2_u_cellar');
    await d.pick(c => /light|Light/.test(c.label), 'a light');
    await this.to('region__s2_u_warren');
    await d.pick(c => c.id === 'region__s2_u_rats/0:Attack', 'the rats');
    for (let i = 0; i < 100 && !((await d.inspect()).combat?.ours); i++) { await page.waitForTimeout(30); }
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('a fight that holds still', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-fight-geometry-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  // States, each against the fight as first drawn: a kind opened and put away; aiming, the reticle on each rat in turn;
  // aiming put away; a technique chosen and the blow it struck (damage); an act that cannot be done, chosen; then the
  // way out of it (a retreat where one is offered, else the fight let go on to its end) and the place again.
  it.each([[1280, 800], [820, 1180]] as const)('at %ix%i: no state of the fight moves a card, the hand or a row', async (width, height) => {
    const { page, driver: d, errors } = await MonoBrowser.page(browser, { width, height }, { site, query: '?world=a1&earned' });
    // On the earned stage (OR-1245): the walk to the rats goes by the lenses and the map.
    await new Walk(page, d).rats();
    const before = (await d.inspect()).place?.id;
    expect((await d.inspect()).mode).toBe('combat');
    const still = async () => { await d.settle(); await page.waitForTimeout(900); return Walk.boxes(page); };
    const ours = async () => {
      for (let i = 0; i < 200 && (await d.inspect()).mode === 'combat' && !((await d.inspect()).combat?.ours); i++) {
        await page.waitForTimeout(30);
      }
    };
    const first = await still(), moved: string[] = [];
    const states: string[] = [];
    const seen = (state: string, b: Record<string, Box>, cards = false) => {
      states.push(state);
      const keys = Object.keys(first).filter(k => !cards || k.startsWith('card '));
      moved.push(...Walk.moved(Object.fromEntries(keys.map(k => [k, first[k]!])), b).map(m => `${state}: ${m}`));
    };
    expect(await Walk.column(page)).toBe(true);
    // On a wide screen the hand's rows stand in the frame's menu column, hard right, where every page's do (the owner,
    // 25 November: "a page like any other"), at its width.
    if (width > 900) {
      const off = await Walk.columned(page);
      expect([Math.abs(off.x) < 2, Math.abs(off.width) < 2]).toEqual([true, true]);
    }
    // A kind opened (the category): its moves in place of the hand's, never a list beside it (ruling 2); and put away.
    await page.click('.fight .hand-menu [data-action="panel"] >> nth=0');
    expect([await page.locator('.fight .hand-menu [data-action="move"]').count() <= 4,
      await page.locator('.fight .hand-detail [data-act]').count()]).toEqual([true, 0]);
    seen('a kind opened', await still());
    await page.click('.fight [data-action="panel-back"]'); seen('put away', await still());
    // Aiming: Attack, three rats to choose from; the reticle on each (changing target); then not now.
    await page.click('.fight .hand-menu [data-action="attack"]');
    expect(await page.locator('.fight.aiming').count()).toBe(1);
    // Whom is asked in place of the hand's rows (OR-1296): the cards hold still; the hand's rows are its question's,
    // the targets standing where the hand's first rows stood, the hand and its details region unmoved (OR-1563).
    seen('aiming', await still());
    // Nothing made see-through to say who is aimed at or whose turn it is, and a foe's card no taller than it needs
    // (OR-115, the owner's play of 18 November).
    const looks = await page.evaluate(() => [...document.querySelectorAll('.fight .fighter')].map(f =>
      [+getComputedStyle(f).opacity, f.closest('.foes') ? f.getBoundingClientRect().height : 0]));
    expect(looks.filter(([o]) => o! < 1)).toEqual([]);
    expect(looks.filter(([, h]) => h! > height * .2)).toEqual([]);
    if (process.env.KYRIE_SHOT) { await page.screenshot({ path: `${process.env.KYRIE_SHOT}/fight-${width}.png` }); }
    const targets = page.locator('.fight .foes .fighter.target');
    expect(await targets.count()).toBeGreaterThan(1);
    // And asked in place of the hand's rows, one row for each (OR-116, OR-1296): clicking a card is not the only way.
    expect(await page.locator('.fight .hand .whom [data-action="whom"]').count()).toBe(await targets.count());
    expect(await page.locator('.fight .hand-menu:not(.whom)').count()).toBe(0);
    // Where the hand's rows stood: the menu's column, hard right on a wide screen (OR-1563: they had been at the left).
    expect(await Walk.column(page)).toBe(true);
    if (width > 900) {
      const off = await Walk.columned(page);
      expect([Math.abs(off.x) < 2, Math.abs(off.width) < 2]).toEqual([true, true]);
    }
    for (let i = 0; i < await targets.count(); i++) {
      await targets.nth(i).hover(); seen(`the reticle on rat ${i + 1}`, await still(), true);
    }
    await d.key('Escape'); seen('not now', await still());
    expect(await Walk.column(page)).toBe(true);
    // A technique chosen from its kind; aimed where it asks whom; the blow struck and answered (damage).
    await page.click('.fight .hand-menu [data-action="panel"] >> nth=0');
    await page.locator('.fight .hand-menu [data-action="move"][data-act]').first().click(); await d.settle();
    if (await page.locator('.fight.aiming').count()) { await page.locator('.fight .fighter.target .pick').first().click(); }
    await ours();
    if ((await d.inspect()).mode === 'combat') { seen('after a technique and the blows', await still(), true); }
    // An act that cannot be done, where the hand has one: chosen, it changes nothing.
    const shut = page.locator('.fight .hand [aria-disabled="true"]');
    if ((await d.inspect()).mode === 'combat' && await shut.count()) { await shut.first().click(); seen('an act that cannot be done', await still()); }
    // The way out: a retreat where one is offered, else let the fight go on to its end; then on, to the place.
    for (let guard = 0; guard < 60 && (await d.inspect()).mode === 'combat'; guard++) {
      const state = await d.inspect();
      if (state.combat?.outcome) { states.push(`ended: ${state.combat.outcome}`); await d.pick(c => c.id === 'onward', 'go on'); break; }
      if (!state.combat?.ours) { await page.waitForTimeout(40); continue; }
      const flee = state.choices.find(c => /^(Flee|Fall back|Retreat|Withdraw|Run)/i.test(c.label));
      if (flee && guard === 0) { states.push(`retreat: ${flee.label}`); await d.pick(c => c.id === flee.id, 'retreat'); continue; }
      seen(`round ${guard}`, await still(), true);
      await d.key('t');
    }
    expect((await d.inspect()).mode).not.toBe('combat');
    // Back to exploring: the place as it was, its painting and its telling, and no fight left on the page.
    states.push('back to exploring');
    expect(await page.locator('.fight').count()).toBe(0);
    expect(await page.locator('.world-page .scene-surface').count()).toBe(1);
    expect((await d.inspect()).place?.id).toBe(before);
    console.log(`FIGHT ${width}x${height} states: ${states.join(' | ')}`);
    expect(moved).toEqual([]);
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
});
