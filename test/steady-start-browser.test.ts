/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The start holds still (the owner on the live build, 14 November: "the cards keep shuffling on me; and there's some
// weird vertical dissolve that seems to scroll a blank screen out of the way when you start"). IG-08: on creation's
// pages a press moves no card, at a desk by the mouse and on an iPad by touch, and the deck shows what it showed (the
// four, the rest only when the player opens them). IG-12: from the studio's mark through the title and creation into
// the opening, no animation slides, scrolls or wipes (no translate, no clip-path) and the page never scrolls; a passage
// is a cut or a short fade in place. The studio's mark's own drawing is apart; the title's sky is still (IG-11).
class Steady {
  static cards(page: Page) {
    return page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.creation .card')].map(c => {
      const r = c.getBoundingClientRect();
      return `${c.dataset.choice ?? c.dataset.id}:${[r.x, r.y, r.width, r.height].map(Math.round).join(',')}`;
    }));
  }
  // Every animation running now that slides or wipes, by what it animates; and how far the page is scrolled.
  static moving(page: Page) {
    return page.evaluate(() => ({
      sliding: document.getAnimations().flatMap(a => {
        const effect = a.effect as KeyframeEffect | null, target = effect?.target as Element | null;
        if (!effect || !target || target.closest('.ident')) { return []; }
        const frames = effect.getKeyframes().map(k => `${k.transform ?? ''} ${k.clipPath ?? ''}`).join(' ');
        return /translate|inset\(/.test(frames) ? [`${target.className}: ${frames.trim()}`] : [];
      }),
      scrolled: Math.round(document.scrollingElement?.scrollTop ?? 0),
    }));
  }
  static async watch(page: Page, ms: number, into: string[]) {
    for (let t = 0; t < ms; t += 150) {
      const m = await Steady.moving(page);
      into.push(...m.sliding, ...m.scrolled ? [`scrolled ${m.scrolled}`] : []);
      await page.waitForTimeout(150);
    }
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the start holds still', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-steady-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1280, 800, false], [820, 1180, true]] as const)('at %ix%i (touch: %s)', async (width, height, touch) => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width, height },
      { site, pointer: touch, query: '?ident&opening' });
    const moved: string[] = [];
    // The studio's mark into the title, watched.
    await page.waitForSelector('.ident', { timeout: 30000 });
    await Steady.watch(page, 4500, moved);
    await page.waitForSelector('.beat-ready', { timeout: 30000 });
    await d.click('[data-action="begin"]');
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await Steady.watch(page, 1200, moved);
    // Creation: on each page, a press moves no card; the last of the four pressed, and one of the rest once opened.
    const shuffled: string[] = [];
    for (let step = 0; step < 4 && await page.locator('[data-action="next"]').count(); step++) {
      await page.waitForTimeout(700);
      const cards = page.locator('.creation .card:not([disabled])'), n = await cards.count();
      if (n > 1) {
        const before = await Steady.cards(page);
        await (touch ? cards.nth(n - 1).tap() : cards.nth(n - 1).click()); await page.waitForTimeout(700);
        const after = await Steady.cards(page);
        if (JSON.stringify(after) !== JSON.stringify(before)) { shuffled.push(`step ${step}: ${before.join(' ')} → ${after.join(' ')}`); }
      }
      if (await page.locator('[data-action="more-cards"]').count()) {
        await d.click('[data-action="more-cards"]'); await page.waitForTimeout(500);
        const before = await Steady.cards(page), last = page.locator('.creation .card:not([disabled])').last();
        await (touch ? last.tap() : last.click()); await page.waitForTimeout(700);
        const after = await Steady.cards(page);
        if (JSON.stringify(after) !== JSON.stringify(before)) { shuffled.push(`step ${step}, the rest: changed`); }
      }
      await d.click('[data-action="next"]');
    }
    expect(shuffled).toEqual([]);
    // Set out, into the opening: watched.
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="prologue"], [data-mode="explore"]', { timeout: 120000 });
    await Steady.watch(page, 2000, moved);
    expect([...new Set(moved)]).toEqual([]);
    expect(errors).toEqual([]);
    await page.close();
  }, 400000);
});
