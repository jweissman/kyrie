/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { Journey } from '../src/session/journey';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';
import { Glanced } from './support/glanced';
import { Pellam } from './support/pellam';

// A place at a glance on the page (OWN-18, OWN-19): one column under the place's head, at most three things worth
// doing, no foot of status and acts, no panes side by side, nothing wider or taller than the screen; Look about, Every
// way and More each a sheet raised by one touch or key and put away by Esc; the key 1 does what the glance leads with
// (talks to your brother); a way with no coming back says so and asks again. Screenshots for the owner go to
// GLANCE_SHOTS when it is set: the first arrival, a return, Thorn Hole, the fells, Freezeland Street. Opt in with
// KYRIE_BROWSER=1.
class Glancing {
  static shots = process.env.GLANCE_SHOTS;
  static async shot(page: Page, name: string) {
    if (!this.shots) { return; }
    await mkdir(this.shots, { recursive: true });
    await page.screenshot({ path: join(this.shots, `${page.viewportSize()!.width}-${name}.png`) });
  }
  static led(page: Page) { return page.locator('[data-region="glance"] [data-promoted]').count(); }
  static async quiet(page: Page) {
    const m = await MonoBrowser.metrics(page);
    return { scroll: m.scroll, panes: await page.locator('.place-foot, .on-pane').count(), led: await this.led(page) <= 3 };
  }
  // A command done as automation does it (kyrieMono.act), and nothing gone wrong.
  static async act(page: Page, d: MonoDriver, command: string) {
    await page.evaluate(c => (window as unknown as { kyrieMono: { act(c: string, s: string): void } })
      .kyrieMono.act(c, c), command);
    await d.settle();
    expect([command, (await d.inspect()).error]).toEqual([command, '']);
  }
  // Into the hex the company stands in, from the world map: nothing in a hex is done from the map (owner, 4 November).
  static async enter(page: Page, d: MonoDriver) {
    if (await page.locator('[data-action="enter-hex"]').count()) { await d.click('[data-action="enter-hex"]'); }
  }
  // Each step on the shortest way from one place to another, as the world joins them.
  static async way(from: string, to: string): Promise<string[]> {
    const g = await Glanced.country('kite');
    return Journey.way(g.campaign.world, from, to).map(([passage, place]) => `go(${passage},${place})`);
  }
  // The Liberty of the Ice down to Freezeland Street, as its glance test plays it: each command it did.
  static async freezeland(): Promise<string[]> {
    const p = await Pellam.start();
    await p.play('go:swan_lane', 'Shake on a penny a stair', 'go:swan_foot', '=9:00');
    for (const hop of p.route('freezeland')) { await p.play(hop); }
    return p.j.session.campaign.history.map(e => e.action);
  }
  // Nothing a sheet away (the owner, 4 November evening: Every way, Look about and More had been crutches): the ways
  // from here, who is here and what the company can do of itself are in the focus beside the place, at once.
  static async atOnce(page: Page) {
    const at = (s: string) => page.locator(`.world-page .focus ${s}`).count();
    return { ways: await at('.ways-here .way-row') > 0, yourself: await at('.yours-here .act') > 0,
      keys: await page.locator('.glance-keys').count() };
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('a place at a glance', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-glance-'));
    await SiteBuild.site(site, { fixtures: true });
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1440, 900, false], [1024, 1366, true], [390, 844, true]] as const)(
    'at %i by %i: leads with three at most, keeps the rest a touch away, and is quiet', async (width, height, pointer) => {
      const { page, errors, driver: d } = await MonoBrowser.page(browser, { width, height },
        { site, pointer, query: '?world=kite' });
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      await page.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
      expect(await Glancing.quiet(page)).toEqual({ scroll: false, panes: 0, led: true });
      await d.pick(c => /^To the bridge-foot/.test(c.label), 'the bridge-foot');
      expect(await Glancing.quiet(page)).toEqual({ scroll: false, panes: 0, led: true });
      expect((await d.inspect()).glance?.arrival).toBe('first');
      await Glancing.shot(page, 'first-arrival');
      expect(await Glancing.atOnce(page)).toEqual({ ways: true, yourself: true, keys: 0 });
      // A digit beyond what it leads with does nothing out of sight.
      if (!pointer) {
        const at = (await d.inspect()).place?.id;
        await d.key('9');
        const now = await d.inspect();
        expect([now.mode, now.place?.id]).toEqual(['explore', at]);
      }
      // Your brother, by his plate, which the glance edges as the one it would lead with: someone in sight is talked to
      // by their plate, not by a lead above it as well (the owner, 4 November).
      await d.click('[data-region="glance"] .act.plate.leading');
      expect((await d.inspect()).mode).toBe('talk');
      expect(await page.locator('.dialogue').count()).toBe(1);
      await d.away();
      // Into the taproom and back: a return, briefer.
      await d.pick(c => c.id === 'exit:region__s2_taproom', 'the taproom');
      await d.pick(c => c.id === 'exit:region__s2_green', 'back to the bridge-foot');
      expect((await d.inspect()).glance?.arrival).toBe('return');
      expect(await Glancing.quiet(page)).toEqual({ scroll: false, panes: 0, led: true });
      await Glancing.shot(page, 'return');
      expect(errors).toEqual([]);
      await page.close();
    }, 300000);
  it('marks a way with no coming back before it is taken, and asks again', async () => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: false, query: '?campaign=test/fixtures/probes/endings-ways/probe.campaign.json' });
    await page.waitForSelector('[data-action="start"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    // Among the ways beside the place, the way says what it risks, and asks before it is taken (spatial-play.md).
    const drop = '.ways-here [data-choice^="exit:"][data-choice*="pool"]';
    expect(await page.locator(`${drop} .mark-one-way`).first().innerText()).toMatch(/no way back/i);
    await d.click(`${drop} >> nth=0`);
    expect(await page.locator(`${drop} .grave-said`).first().innerText()).toMatch(/no coming back.+Choose it again/);
    expect((await d.inspect()).place?.id).toBe('p__ledge');
    await d.click(`${drop} >> nth=0`);
    expect((await d.inspect()).place?.id).toBe('p__pool');
    expect(errors).toEqual([]);
    await page.close();
  }, 120000);
  it('meets Thorn Hole with what can be done about it, and the fells with their own', async () => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: false, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    for (const step of await Glancing.way((await d.inspect()).place!.id, 'region__w11')) { await Glancing.act(page, d, step); }
    await Glancing.enter(page, d);
    const den = (await d.inspect()).glance!;
    // The way back is led only from a fight that could be lost (the owner, 4 November: led from every fight, it had
    // taken a player following the page out of each site at its first foe).
    expect(den.acts.slice(0, 2).map(a => a.why)).toEqual(['danger', 'danger']);
    expect(den.acts[1]!.marks).toContain('fight');
    expect(await page.locator('[data-region="glance"] .threat').count()).toBe(1);
    expect(await Glancing.quiet(page)).toEqual({ scroll: false, panes: 0, led: true });
    await Glancing.shot(page, 'thorn-hole');
    await Glancing.act(page, d, (await Glancing.way('region__w11', 'region__t2'))[0]!);
    expect((await d.inspect()).glance!.acts.map(a => a.why)).toContain('own');
    // And no step across the country on the page: that is the map's alone (the owner, 4 November).
    expect(await page.locator('[data-region="glance"] .glance-row li.step').count()).toBe(0);
    await Glancing.shot(page, 'fells');
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
  it('comes to Freezeland Street by its own line and someone at their doings', async () => {
    const steps = await Glancing.freezeland();
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1440, height: 900 },
      { site, pointer: false, query: '?campaign=the-liberty-of-the-ice' });
    await page.waitForSelector('[data-action="start"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    for (const step of steps) { await Glancing.act(page, d, step); }
    expect((await d.inspect()).glance?.sight).toBe('pellam__freezeland_scene');
    expect(await page.locator('[data-region="glance"] .life').count()).toBe(1);
    expect(await Glancing.quiet(page)).toEqual({ scroll: false, panes: 0, led: true });
    await Glancing.shot(page, 'pellam');
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
});
