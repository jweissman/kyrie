/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { Origins } from '../src/world/origins';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Typography } from '../src/presentation/typography';
import { MonoBrowser } from './support/mono-browser';
import { Identity } from '../src/presentation/identity';

// The opening and the choice of a life (Mission 18's A3 and A6), and the stage held inside the screen (A1). The studio
// mark plays when asked for (automation is otherwise spared it, and so is one who asks for less motion), its name set
// beneath it, and any key goes straight to the ways in under the game's name; a tap or a click that skips does only
// that, though it lands where Begin is about to be; another name asked for by the address is shown instead, and keeps
// to one line on a phone; the gold mark about the ways in closes on the name of the one pointed at;
// creation asks first why you have come, shows no likeness of you anywhere, and goes on by Continue, the chosen card's
// rules behind Details; and at a desktop's size, a tablet's either way up and a phone's, creation is the whole screen
// and play's stage stays inside it, keeping its margins where there is room for them, and the page itself never
// scrolls.
class Stage {
  static bounds(page: Page) {
    return page.evaluate(() => {
      const f = document.querySelector('.frame')!.getBoundingClientRect();
      const doc = document.scrollingElement!;
      return { inside: f.left >= 0 && f.top >= 0 && f.right <= innerWidth && f.bottom <= innerHeight,
        margin: Math.round(Math.min(f.left, innerWidth - f.right)),
        scrolls: doc.scrollHeight > innerHeight || doc.scrollWidth > innerWidth };
    });
  }
  // Where the gold mark stands about the way it is on, beside where that way's name is.
  static indicator(page: Page) {
    return page.evaluate(() => {
      const mark = document.querySelector('.title-menu .indicator')!.getBoundingClientRect();
      const name = document.querySelector('.way-in[aria-current="true"] .n')!.getBoundingClientRect();
      return { before: Math.round(name.left - mark.left), after: Math.round(mark.right - name.right),
        middle: Math.abs(Math.round(mark.top - (name.top + name.height / 2))) };
    });
  }
  // Where the opening has got to, and where Begin's middle is (laid out though not yet shown).
  static begin(page: Page) {
    return page.evaluate(() => {
      const r = document.querySelector('[data-action="begin"]')!.getBoundingClientRect();
      return { beat: document.querySelector('.title-page')!.className.replace(/^.*beat-/, ''),
        x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
  }
  // Where the name's first and last letters fall, and the screen's width.
  static mark(page: Page) {
    return page.evaluate(() => {
      const letters = Array.from(document.querySelectorAll('.mark span')).map(e => e.getBoundingClientRect());
      return { left: Math.round(letters[0]!.left), right: Math.round(letters.at(-1)!.right), width: innerWidth };
    });
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the opening and the choice of a life', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-opening-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('plays the studio mark when asked, and a key goes straight to the ways in', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1440, height: 900 }, { site, query: '?ident' });
    await page.waitForSelector('.ident', { timeout: 30000 });
    expect(await page.textContent('.ident .studio')).toBe(Identity.studio);
    expect(await page.locator('[data-action="begin"]').isVisible()).toBe(false);
    await page.keyboard.press('Space');
    await page.waitForSelector('.ident', { state: 'detached', timeout: 5000 });
    expect(await page.locator('[data-action="begin"]').isVisible()).toBe(true);
    const named = [await page.getAttribute('.mark', 'aria-label'), await page.title()];
    expect(named).toEqual([Identity.spoken(), Identity.spoken()]);
    // The gold mark goes to the way pointed at.
    const at = () => page.locator('.title-menu .indicator').evaluate(e => getComputedStyle(e).transform);
    const before = await at();
    await page.hover('[data-action="options"]');
    await page.waitForTimeout(400);
    expect(await at()).not.toBe(before);
    // It closes about that way's name, a little before and after it, at the name's middle (to a pixel's rounding).
    const mark = await Stage.indicator(page);
    expect([mark.before - 22, mark.after - 22, mark.middle].map(d => Math.abs(d) <= 1)).toEqual([true, true, true]);
    expect(errors).toEqual([]);
    await page.close();
  }, 120000);

  it('lets a tap or a click that skips the opening do nothing else, where Begin is about to be', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1024, height: 1366 },
      { site, pointer: true, query: '?ident' });
    const tapped: string[] = [];
    for (const [beat, how] of [['ident', 'tap'], ['dark', 'tap'], ['reveal', 'tap'], ['reveal', 'click']] as const) {
      if (tapped.length) { await page.reload(); }
      await page.waitForSelector(`.beat-${beat}`, { timeout: 30000 });
      const begin = await Stage.begin(page);
      await (how === 'tap' ? page.touchscreen.tap(begin.x, begin.y) : page.mouse.click(begin.x, begin.y));
      await page.waitForSelector('.beat-ready', { timeout: 5000 });
      await page.waitForTimeout(600);
      tapped.push(`${begin.beat === 'ready' ? 'too late' : 'opening'} ${how}: ${
        await page.getAttribute('[data-mode]', 'data-mode')}`);
    }
    expect(tapped).toEqual(['opening tap: title', 'opening tap: title', 'opening tap: title', 'opening click: title']);
    // Once the ways in are there, a tap on Begin begins.
    const begin = await Stage.begin(page);
    await page.touchscreen.tap(begin.x, begin.y);
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);

  it('shows the names the address asks for, and spares one who asks for less motion the mark', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 390, height: 844 },
      { site, pointer: true, query: '?studio=freehaven&name=Seven%20Lamps' });
    await page.waitForSelector('.ident', { timeout: 30000 });
    expect(await page.textContent('.ident .studio')).toBe('FREEHAVEN');
    await page.touchscreen.tap(30, 30);
    await page.waitForSelector('.ident', { state: 'detached', timeout: 5000 });
    expect([await page.textContent('.mark'), await page.title()]).toEqual(['SEVEN\u00a0LAMPS', 'Seven Lamps']);
    const mark = await Stage.mark(page);
    expect(mark.left >= 0 && mark.right <= mark.width).toBe(true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.waitForSelector('[data-action="begin"]', { timeout: 30000 });
    expect(await page.locator('.ident').count()).toBe(0);
    expect(errors).toEqual([]);
    await page.close();
  }, 120000);

  it('begins a life from why you have come, with no likeness of you, and goes on by Continue', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1180, height: 820 }, { site, query: '' });
    await page.click('[data-action="begin"]');
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    expect(await page.textContent('.ask')).toMatch(/^Why have you come to /);
    expect(await page.locator('[data-page="why"] .card').count()).toBeGreaterThan(2);
    await page.click('[data-action="next"]');
    expect(await page.getAttribute('.creation-body', 'data-page')).toBe('you');
    // A country is drawn anew from its own seed, and its first protagonist may be of a people no thief comes of.
    await page.click('[data-choice="raceId:human"]');
    await page.click('[data-action="next"]');
    await page.click('[data-choice="classId:thief"]');
    expect(await page.getAttribute('[data-choice="classId:thief"]', 'aria-pressed')).toBe('true');
    // The chosen card's sentence is beneath the cards, and its rules behind Details, over the page.
    expect(await page.textContent('.chosen-lead')).toContain('quick blade');
    await page.click('[data-action="details"]');
    expect(await page.textContent('[aria-modal="true"]')).toContain('Hit points');
    await page.keyboard.press('Escape');
    expect(await page.locator('[aria-modal="true"]').count()).toBe(0);
    expect(await page.getAttribute('.creation-body', 'data-page')).toBe('calling');
    expect(await page.locator('.creation img').count()).toBe(0);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);

  // Set out, a new game opens on its opening (OWN-17), asked for here as automation is otherwise spared it: the way in
  // over the whole screen, nothing of play on it; the origin's chapter, small and gold; why you came, then by a key or
  // a touch, once the way on has appeared, the way in, naming the town; and one Go on, into the first place, which
  // tells neither, nor your aim, which the opening has just told. Where motion is unwanted, the way on is there at
  // once.
  it.each([[1440, 900, 'kin', false], [390, 844, 'wanderer', true]] as [number, number, string, boolean][])(
    'at %i by %i sets out into the opening of %s, and goes on into the place', async (width, height, origin, touch) => {
      const { page, errors, driver } = await MonoBrowser.page(browser, { width, height }, { site, pointer: touch,
        query: '?world=kite&opening' });
      if (touch) { await page.emulateMedia({ reducedMotion: 'reduce' }); }
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      await page.click(`[data-action="origin"][data-id="${origin}"]`);
      await page.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="prologue"]', { timeout: 120000 });
      expect(await page.locator('[data-action="book"], .place-foot, .on-pane, [data-action="choice"]').count()).toBe(0);
      expect((await Stage.bounds(page)).margin).toBe(0);
      const title = (await Origins.load(NodeBundleSource.shared)).find(o => o.manifest.id === origin)!.manifest.title;
      expect(await page.textContent('[data-id="chapter"]')).toBe(Typography.curl(title));
      const first = (await page.textContent('[data-id="beat"]'))!;
      expect(await page.locator('[data-action="go-on"]').count()).toBe(0);
      // Pressed at once, before its way on has appeared, it stays (two Enters had gone past a beat unread).
      if (!touch) {
        await page.keyboard.press('Enter');
        expect(await page.textContent('[data-id="beat"]')).toBe(first);
        await page.waitForSelector('[data-action="beat"]', { state: 'visible' });
      }
      // Where motion is unwanted, the way on is there at once, and held only long enough that one touch is not two.
      if (touch) { await page.waitForTimeout(400); await driver.click('[data-action="beat"]'); } else { await page.keyboard.press('Enter'); }
      // The way in names the town the place is in.
      const second = (await page.textContent('[data-id="beat"]'))!, town = (await driver.inspect()).path!
        .find(p => p.kind === 'settlement')!.name;
      expect([second !== first, second.includes(Typography.curl(town))]).toEqual([true, true]);
      if (touch) {
        const go = page.locator('[data-action="go-on"]');
        expect(await go.evaluate(e => getComputedStyle(e).animationName)).toBe('none');
        await page.waitForTimeout(400);
      }
      await driver.click('[data-action="go-on"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 30000 });
      // The place opens without the chapter, either beat (not even the way in's first sentence) or the aim.
      expect(await page.locator('.place-head .chapter, [data-id="aim"]').count()).toBe(0);
      const place = (await page.textContent('.scene'))!, opens = (t: string) => /^.*?[.!?](?=\s|$)/.exec(t)?.[0] ?? t;
      expect([place.includes(opens(first)), place.includes(opens(second)), place.includes('looking for work')])
        .toEqual([false, false, false]);
      expect(await page.locator('[data-action="book"]').count()).toBe(1);
      expect(errors).toEqual([]);
      await page.close();
    }, 240000);

  it.each([[1440, 900, 130], [1180, 820, 40], [820, 1180, 16], [390, 844, 0]])(
    'at %i by %i holds the stage inside the screen, its margins kept, the page still', async (width, height, margin) => {
      const { page, errors } = await MonoBrowser.page(browser, { width, height }, { site, pointer: width < 900,
        query: '?world=kite' });
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      const creating = await Stage.bounds(page);
      await page.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
      const playing = await Stage.bounds(page);
      // Creation is the whole screen, as the title is (OWN-14: no window frame); play keeps the stage's margins.
      expect([creating.inside, creating.margin, creating.scrolls]).toEqual([true, 0, false]);
      expect([playing.inside, playing.margin >= margin, playing.scrolls]).toEqual([true, true, false]);
      expect(errors).toEqual([]);
      await page.close();
    }, 240000);
});
