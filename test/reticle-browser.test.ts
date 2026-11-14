/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The pointer is the reticle (IG-15, the owner: "target reticule" meant the mouse cursor), and the buttons answer the
// hand (IG-16). At a laptop's 1280 by 800 with a mouse: wherever the hand is, the cursor is a small ring; over anything
// that can be chosen, the ring a little wider, never ticked; pressed, at once, tightened and filled. What the hand is
// on is lit in its own tone (the row's mark's), never by corners drawn on it, and nothing moves or changes size under
// the hand, over or pressed: on the title's ways, creation's cards and the scene's rows. One click commits.
class Hand {
  static at = { x: 0, y: 0 };
  static async over(page: Page, selector: string) {
    const b = (await page.locator(selector).first().boundingBox())!;
    Hand.at = { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) };
    await page.mouse.move(Hand.at.x, Hand.at.y); await page.waitForTimeout(200);
  }
  // Which reticle the page gives the pointer where it is now: rest, act or press, or none of them.
  static cursor(page: Page) {
    return page.evaluate(({ x, y }) => {
      const under = document.elementFromPoint(x, y), cursor = under ? getComputedStyle(under).cursor : '';
      return /reticle-(rest|act|press)/.exec(cursor)?.[1] ?? cursor;
    }, Hand.at);
  }
  static boxes(page: Page, selector: string) {
    return page.evaluate(sel => [...document.querySelectorAll(sel)].map(e => {
      const r = e.getBoundingClientRect();
      return [r.x, r.y, r.width, r.height].map(Math.round).join(',');
    }), selector);
  }
  // Over it, then held down: the reticle each time, and every box of its kind the same throughout. Released off it.
  static async press(page: Page, selector: string, all: string) {
    const before = await Hand.boxes(page, all);
    await Hand.over(page, selector);
    const over = [await Hand.cursor(page), await Hand.boxes(page, all)];
    await page.mouse.down(); await page.waitForTimeout(50);
    const down = [await Hand.cursor(page), await Hand.boxes(page, all)];
    await page.mouse.move(2, 2); await page.mouse.up(); await page.waitForTimeout(150);
    return { over, down, before };
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the pointer is the reticle', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-reticle-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('rings the hand, closes over a choice, fills pressed, and nothing moves', async () => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width: 1280, height: 800 }, { site, query: '' });
    await page.waitForSelector('.beat-ready', { timeout: 30000 }); await page.waitForTimeout(600);
    // The title: a ring on the dark; the ways in, each as it was over and pressed; no corners drawn on any.
    Hand.at = { x: 30, y: 400 }; await page.mouse.move(30, 400); await page.waitForTimeout(100);
    expect(await Hand.cursor(page)).toBe('rest');
    const title = await Hand.press(page, '[data-action="begin"]', '.title-menu .way-in');
    expect([title.over, title.down]).toEqual([['act', title.before], ['press', title.before]]);
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('.way-in')!).getPropertyValue('--reticule')))
      .toBe('');
    await page.click('[data-action="begin"]');
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 }); await page.waitForTimeout(700);
    // Creation: a card, over and pressed, every card where it was; one click chooses it.
    const card = '.creation .card[aria-pressed="false"]:not([disabled])';
    const id = await page.locator(card).first().getAttribute('data-id');
    const cards = await Hand.press(page, `.creation .card[data-id="${id}"]`, '.creation .card');
    expect([cards.over, cards.down]).toEqual([['act', cards.before], ['press', cards.before]]);
    await page.click(`.creation .card[data-id="${id}"]`);
    expect(await page.getAttribute(`.creation .card[data-id="${id}"]`, 'aria-pressed')).toBe('true');
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 }); await d.settle(); await page.waitForTimeout(900);
    // The scene: a row of the four, over and pressed, every row where it was; lit in its own mark's tone.
    const row = '.glance .led .choice-row';
    const rows = await Hand.press(page, `${row} >> nth=0`, row);
    expect([rows.over, rows.down]).toEqual([['act', rows.before], ['press', rows.before]]);
    const tones = await page.evaluate(sel => [...document.querySelectorAll<HTMLElement>(sel)].map(r => {
      const mark = r.querySelector<HTMLElement>(':scope > .row-mark');
      const tone = mark?.style.getPropertyValue('--prism').match(/tone-(\w+)/)?.[1];
      return [tone ?? 'none', getComputedStyle(r).getPropertyValue('--row-tone').trim(),
        tone ? getComputedStyle(document.documentElement).getPropertyValue(`--tone-${tone}`).trim() : 'rgb(236, 230, 217)'];
    }), row);
    expect(tones.length).toBeGreaterThan(0);
    expect(tones.filter(([, own, expected]) => own !== expected)).toEqual([]);
    // One click commits it.
    const told = (await d.inspect()).log.length;
    await page.locator(`${row}[data-act]:not([aria-expanded])`).first().click(); await d.settle();
    expect((await d.inspect()).log.length).toBeGreaterThan(told);
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
});
