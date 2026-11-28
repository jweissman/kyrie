/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import { MonoDriver } from './support/mono-driver';

// The names page holds still (the owner's play, 18 November, OR-119: "some kind of flickering behavior on the names
// screen (we should check for remounts there)"): come to from how you present, it shows the names drawn for it once
// (it had shown the hand drawn before, a woman's names, then swapped in a man's: the page had gone on before the
// engine's answer, CreationStep.leads); and the hand passing over the names, the keys going down them, and a name
// written letter by letter replace no element of the page.
class Still {
  // To how you present, each step's first option held on the way.
  static async toPresenting(page: Page) { await Still.to(page, 'presenting'); }
  // To a step by its id, each step's first option held on the way: found by what it is, never by its order (how one
  // presents was moved to second, CR-03, the owner, 19 November).
  static async to(page: Page, step: string) {
    for (let i = 0; i < 12 && await page.getAttribute('.creation', 'data-page') !== step; i++) {
      const was = await page.getAttribute('.creation', 'data-page');
      await MonoDriver.enter(page, '.composed-rows [data-option]:not(:disabled) >> nth=0');
      await page.waitForFunction(p => document.querySelector('.creation')?.getAttribute('data-page') !== p, was,
        { timeout: 5000 });
    }
  }
  // Every hand of names the page shows from now on, in the order it shows them: on the name page alone, so that the
  // steps between how one presents and the name (asked second since CR-03) are not counted as hands of names.
  static hands(page: Page) {
    return page.evaluate(() => {
      const w = window as unknown as { hands: string[] };
      w.hands = [];
      const look = () => {
        if (document.querySelector('.creation')?.getAttribute('data-page') !== 'name') { return; }
        const hand = [...document.querySelectorAll('.composed-list [data-option]')].map(o => o.getAttribute('data-option'))
          .join('|');
        if (hand && w.hands.at(-1) !== hand) { w.hands.push(hand); }
      };
      new MutationObserver(look).observe(document.body, { childList: true, subtree: true, attributes: true });
    });
  }
  // Every element added or taken away under the page from now on, by its tag and class.
  static watch(page: Page) {
    return page.evaluate(() => {
      const w = window as unknown as { replaced: string[] };
      w.replaced = [];
      const said = (n: Node) => n instanceof Element ? `${n.tagName.toLowerCase()}.${n.className}` : '';
      new MutationObserver(records => {
        for (const r of records) {
          for (const n of [...r.addedNodes, ...r.removedNodes]) { if (said(n)) { w.replaced.push(said(n)); } }
        }
      }).observe(document.querySelector('#page')!, { childList: true, subtree: true });
    });
  }
  static replaced(page: Page) {
    return page.evaluate(() => (window as unknown as { replaced: string[] }).replaced);
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the names page', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-names-still-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('shows one hand of names, and replaces nothing as the hand and the keys go over the names and a name is written', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1180, height: 820 }, { site, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await Still.toPresenting(page);
    // Presenting as a man deals his names: the page shows them once, never the hand drawn before it first.
    await Still.hands(page);
    await MonoDriver.enter(page, '[data-option="he"]');
    await Still.to(page, 'name');
    await page.waitForTimeout(600);
    const hands = await page.evaluate(() => (window as unknown as { hands: string[] }).hands);
    expect(hands).toHaveLength(1);
    // The embers go on before creation's curtain (OR-1800), by their own drift, which replaces nothing on the page.
    await Still.watch(page);
    const rows = page.locator('.composed-list [data-option]');
    for (let i = 0; i < await rows.count(); i++) { await rows.nth(i).hover(); await page.waitForTimeout(60); }
    for (let i = 0; i < 4; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(60); }
    const hovered = await Still.replaced(page);
    await page.click('[data-field="name"]');
    await page.keyboard.type('Halloran', { delay: 40 });
    await page.waitForTimeout(500);
    const typed = (await Still.replaced(page)).slice(hovered.length);
    expect([hovered, typed]).toEqual([[], []]);
    expect(await page.inputValue('[data-field="name"]')).toBe('Halloran');
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
});
