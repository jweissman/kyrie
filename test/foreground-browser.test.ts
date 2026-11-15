/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// One foreground menu (the owner, 15 November: at most four items, every gameplay action through one of them; the
// deployed play met compound menus, a fifth row, duplicate names). The first minutes of an ordinary player's journey,
// by the page's own rows, with each state counted: the visible items that commit an act are never more than four, none
// is a fold (aria-expanded), and no two are called the same. A state that breaks it is named, with what was drawn.
interface Seen { mode: string; n: number; rows: string[]; folds: number }
class Foreground {
  static async seen(page: Page): Promise<Seen> {
    return page.evaluate(() => {
      const acts = [...document.querySelectorAll('[data-act]')].filter(e => (e as HTMLElement).offsetParent !== null);
      const words = acts.map(e => (e as HTMLElement).innerText.replace(/\s+/g, ' ').trim().slice(0, 60));
      return { mode: document.querySelector('[data-mode]')?.getAttribute('data-mode') ?? '', n: acts.length, rows: words,
        folds: acts.filter(e => e.hasAttribute('aria-expanded')).length };
    });
  }
  static broken(s: Seen): string[] {
    const named = s.rows.filter(Boolean);
    return [...s.n > 4 ? [`${s.n} items`] : [], ...s.folds ? [`${s.folds} folds`] : [],
      ...new Set(named).size < named.length ? ['a name twice'] : []].map(x => `${x}: ${s.rows.join(' | ')}`);
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
  it('holds at four items, with no fold and no name twice, through the first scenes, a talk and a fight', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1180, height: 820 }, { site, pointer: true,
      query: '?world=a1&opening' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    const broke: string[] = [];
    let explored = 0;
    for (let n = 0; n < 70 && explored < 22; n++) {
      await page.waitForTimeout(900);
      const s = await Foreground.seen(page);
      if (s.mode === 'prologue') {
        if (s.n) { await page.locator('[data-act]:visible').first().click().catch(() => undefined); } else { await page.keyboard.press('Enter'); }
        continue;
      }
      if (s.mode === 'combat') { await page.keyboard.press('1'); continue; }
      if (s.mode === 'explore' || s.mode === 'talk') { explored++; broke.push(...Foreground.broken(s).map(b => `${s.mode}: ${b}`)); }
      // The first row, then now and then another (a talk, a notice, a way), so that more than one road is walked.
      const rows = page.locator('[data-act]:visible'), count = await rows.count();
      if (count) { await rows.nth(n % 3 === 2 ? Math.min(1, count - 1) : 0).click().catch(() => undefined); } else { await page.keyboard.press('Enter'); }
    }
    expect(broke).toEqual([]);
    expect(explored, 'scenes walked').toBeGreaterThan(8);
    expect(errors).toEqual([]);
  }, 400000);
});
