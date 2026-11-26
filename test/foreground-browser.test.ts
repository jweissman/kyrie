/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import { MonoDriver } from './support/mono-driver';
import { Rail } from './support/rail';

// One foreground menu (the owner, 15 November: at most four items, every gameplay action through one of them; the
// deployed play met compound menus, a fifth row, duplicate names). The first minutes of an ordinary player's journey,
// by the page's own rows, with each state counted: the visible items that commit an act are never more than four, none
// is a fold (aria-expanded), and no two are called the same. A state that breaks it is named, with what was drawn.
interface Seen { mode: string; n: number; rows: string[]; ids: string[]; folds: number }
class Foreground {
  static async seen(page: Page): Promise<Seen> {
    return page.evaluate(() => {
      // The likenesses of who is here are the way of attending to someone (a focus; the talk it opens replaces the
      // foreground), not acts of the foreground: they are counted apart.
      const acts = [...document.querySelectorAll('[data-act]')]
        .filter(e => (e as HTMLElement).offsetParent !== null && !e.closest('.portraits, details:not([open])'));
      const words = acts.map(e => (e as HTMLElement).innerText.replace(/\s+/g, ' ').trim().slice(0, 60));
      return { mode: document.querySelector('[data-mode]')?.getAttribute('data-mode') ?? '', n: acts.length, rows: words,
        ids: acts.map(e => e.getAttribute('data-act') ?? ''),
        folds: acts.filter(e => e.hasAttribute('aria-expanded')).length };
    });
  }
  static broken(s: Seen): string[] {
    const named = s.rows.filter(Boolean);
    return [...s.n > 4 ? [`${s.n} items`] : [], ...s.folds ? [`${s.folds} folds`] : [],
      ...new Set(named).size < named.length ? ['a name twice'] : [],
      ...new Set(s.ids).size < s.ids.length ? ['an act twice'] : []].map(x => `${x}: ${s.rows.join(' | ')}`);
  }
}
describe.skipIf(!process.env.KYRIE_BROWSER)('the foreground, as a player meets it', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-fg-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  for (const world of ['a1', 'b2']) {
  it(`holds at four items, with no fold and no name twice, through the first scenes, a talk and a fight: ${world}`, async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1180, height: 820 }, { site, pointer: true,
      query: `?world=${world}&opening` });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    const broke: string[] = [];
    let explored = 0, lensed = false;
    for (let n = 0; n < 70 && explored < 22; n++) {
      await page.waitForTimeout(900);
      const s = await Foreground.seen(page);
      if (s.mode === 'prologue') {
        // The opening's pages wait on a held Continue; a question on its numbers (GRAMMAR: the input contract).
        if (await page.locator('[data-action="answer"]').count()) { await page.keyboard.press('1'); continue; }
        if (await page.locator('.prologue-page .go-on').count()) {
          await MonoDriver.enter(page, '.prologue-page .go-on').catch(() => undefined);
        }
        continue;
      }
      if (s.mode === 'combat') { await page.keyboard.press('1'); continue; }
      if (s.mode === 'explore' && !lensed) {
        // Each lens of the rail is one menu in place of the four, never beside them: the one way is not drawn twice.
        lensed = true;
        await Rail.unfold(page);
        const rail = page.locator('[data-action="explore"]:visible').first();
        if (await rail.count()) {
          await rail.click(); await page.waitForTimeout(800);
          const inLens = await Foreground.seen(page);
          broke.push(...Foreground.broken(inLens).map(b => `lens: ${b}`));
          await rail.click().catch(() => undefined); await page.waitForTimeout(600);
          continue;
        }
      }
      if (s.mode === 'talk' && Foreground.broken(s).length) {
        console.log('TALKHTML', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-act]')].filter(e => (e as HTMLElement).offsetParent !== null && !(e as HTMLElement).innerText.trim()).slice(0, 3).map(e => e.outerHTML.slice(0, 300)))));
      }
      if (s.mode === 'explore' || s.mode === 'talk') { explored++; broke.push(...Foreground.broken(s).map(b => `${s.mode}: ${b}`)); }
      // The first row, then now and then another (a talk, a notice, a way), so that more than one road is walked.
      const rows = page.locator('[data-act]:visible'), count = await rows.count();
      if (count) { await rows.nth(n % 3 === 2 ? Math.min(1, count - 1) : 0).click().catch(() => undefined); } else { await page.keyboard.press('Enter'); }
    }
    expect(broke).toEqual([]);
    expect(explored, 'scenes walked').toBeGreaterThan(8);
    expect(errors).toEqual([]);
  }, 400000);
  }
});
