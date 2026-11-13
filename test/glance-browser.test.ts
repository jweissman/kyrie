/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { HexBoundary } from '../src/hex-boundary';
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
    // Four at most: three, and someone to talk to (Promotion.all).
    return { scroll: m.scroll, panes: await page.locator('.place-foot, .on-pane').count(), led: await this.led(page) <= 4 };
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
    // A step into the next hex is set out on, as the page does it from the map (the campaign refuses it otherwise).
    let at = from;
    return Journey.way(g.campaign.world, from, to).map(([passage, place]) => {
      const step = HexBoundary.crosses(g.campaign.module, at, place) ? `travel:${place}` : `go(${passage},${place})`;
      at = place;
      return step;
    });
  }
  // The Liberty of the Ice down to Freezeland Street, as its glance test plays it: each command it did.
  static async freezeland(): Promise<string[]> {
    const p = await Pellam.start();
    await p.play('go:swan_lane', 'Shake on a penny a stair', 'go:swan_foot', '=9:00');
    for (const hop of p.route('freezeland')) { await p.play(hop); }
    return p.j.session.campaign.history.map(e => e.action);
  }
  // A place at rest (the owner, 4 November, late, and 5 November, late): the picture, with whoever is here a touch away
  // under Talk (12 November), the place told whole and never folded away, and a few quiet touches; no ways, no list of
  // what can be done.
  // Go… turns on the places lens in the scene and Wait… the time lens (CN-01, CN-05, the owner, 14 November): no page
  // over it, the telling kept; the places lens holds the ways and nothing else (no one to talk to, no acts on things);
  // the same mark puts it away.
  static async atRest(page: Page) {
    const at = (s: string) => page.locator(`.world-page ${s}`).count();
    const rest = { talk: await at('.opens-talk'), go: await at('.opens-go'),
      told: await at('.focus .setting p') > 0, folds: await at('details'), listed: await at('.focus .ways-here'),
      keys: await page.locator('.glance-keys').count() };
    await page.click('.opens-go');
    const go = { ways: await at('.glance .lens-places [data-act]') > 0, page: await at('.explorer'),
      kept: await at('.focus .setting p') > 0,
      others: await at('.glance .lens :is(.portrait, .chip, .plate, .yours-here, .at-ways, .about-here)') };
    await page.click('.opens-go');
    await page.click('.opens-wait');
    const wait = { waits: await at('.glance .lens-time [data-act]') > 0 };
    await page.click('.opens-wait');
    return { ...rest, ...go, ...wait };
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
      // Go… is for going, and only for going (the owner, 5 November, late).
      expect(await Glancing.atRest(page)).toEqual({ talk: 1, go: 1, told: true, folds: 0, listed: 0, keys: 0,
        ways: true, page: 0, kept: true, others: 0, waits: true });
      // A digit beyond what it leads with does nothing out of sight.
      if (!pointer) {
        const at = (await d.inspect()).place?.id;
        await d.key('9');
        const now = await d.inspect();
        expect([now.mode, now.place?.id]).toEqual(['explore', at]);
      }
      // Your brother, by his likeness on the picture: someone in sight is talked to by touching them (the owner,
      // 4 November, late).
      await d.talk();
      await d.click('.surface .portraits [data-subject="drover__son"] .portrait');
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
    // The drop is the ledge's one way on, so the scene offers it as itself, "To the still water…" (M19-109: two
    // clicks for no choice); the places lens, turned on by its key, still holds it, and says on it what it risks.
    expect(await page.locator('.act.opens-go').innerText()).toMatch(/^to the still water/i);
    await d.key('g');
    const drop = page.locator('.glance .lens-places [data-act^="exit:"][data-act*="pool"] >> nth=0');
    if (!await drop.count()) { await page.click('.glance .lens [data-action="lens-all"]'); }
    expect(await drop.innerText()).toMatch(/no coming back|no way back/i);
    await d.key('Escape');
    // Taken from the scene, it asks before it is taken, and says why.
    await Glancing.shot(page, 'one-way-offered');
    await d.click('.act.opens-go');
    await Glancing.shot(page, 'one-way-asked');
    expect(await page.locator('.opens-go .grave-said').innerText()).toMatch(/no coming back.+Choose it again/);
    expect((await d.inspect()).place?.id).toBe('p__ledge');
    await d.click('.act.opens-go');
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
