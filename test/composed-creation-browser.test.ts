/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import { MonoDriver } from './support/mono-driver';
import { Creation } from '../web/engine/creation';

// Creation as the owner asked for it (15 November, the playback notes): one press is enough to choose, and the page
// goes on (no Continue, no second click); never more than four cards at once (ancestry and calling page on); no
// stray "Details" button; the sign has its sky. Walked from the title to setting out, at a laptop's size and a
// tablet's.
class Shape {
  static rows(page: import('playwright-core').Page) {
    return page.locator('.composed-rows > .composed-row').evaluateAll(es => es.map(e => {
      const r = e.getBoundingClientRect(), mark = e.querySelector('.row-mark')?.getBoundingClientRect();
      const label = e.querySelector('.row-label')?.getBoundingClientRect(), aside = e.querySelector('.row-aside');
      const words = aside?.textContent ? aside.getBoundingClientRect() : undefined;
      return { tall: r.height >= 32, marked: !!mark && mark.height >= 8 && mark.width >= 2,
        apart: !label || !words || words.left - label.right >= 8 };
    }));
  }
  static at(page: import('playwright-core').Page) { return page.getAttribute('.creation', 'data-page'); }
  // On to a step, the first of each step before it held; there, the card turned to (More…) and held.
  static async take(page: import('playwright-core').Page, step: string, id: string) {
    for (let n = 0; n < 8 && await Shape.at(page) !== step; n++) { await Shape.held(page, '[data-option]:not([data-option="more"]):not(:disabled) >> nth=0'); }
    for (let n = 0; n < 4 && !await page.locator(`[data-option="${id}"]`).count(); n++) { await page.click('[data-option="more"]'); }
    await Shape.held(page, `[data-option="${id}"]`);
  }
  static async held(page: import('playwright-core').Page, selector: string) {
    const where = await Shape.at(page);
    await MonoDriver.hold(page, selector);
    await page.waitForFunction(p => document.querySelector('.creation')?.getAttribute('data-page') !== p, where, { timeout: 5000 });
  }
  // The spells' rows: which are taken, which shut, and whether each stands whole in the window.
  static spells(page: import('playwright-core').Page) {
    return page.locator('.composed-rows [data-option]').evaluateAll(es => es.map(e => {
      const r = e.getBoundingClientRect();
      return { id: e.getAttribute('data-option')!, taken: e.getAttribute('aria-current') === 'true',
        shut: (e as HTMLButtonElement).disabled, whole: r.top >= 0 && r.bottom <= innerHeight };
    }));
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('creation, composed', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-composed-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1280, 800], [820, 1180]] as const)('at %ix%i: a press chooses and goes on, four cards at most, no Details', async (w, h) => {
    const { page, errors } = await MonoBrowser.page(browser, { width: w, height: h }, { site, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    const seen: string[] = [], most: number[] = [];
    for (let presses = 0; presses < 12; presses++) {
      const where = await page.getAttribute('.creation', 'data-page') ?? '';
      if (where === 'go') { break; }
      seen.push(where);
      most.push(await page.locator('.composed-rows > [data-option]:not([data-option="more"])').count());
      if (where === 'sign') { expect(await page.locator('.observatory').count()).toBe(1); }
      // Each row its own height, its mark drawn, its words and aside apart (the owner, 16 November: creation's rows had
      // been squashed together, no mark, the aside run into the words, and no spec saw it).
      for (const r of await Shape.rows(page)) { expect(r).toMatchObject({ tall: true, marked: true, apart: true }); }
      expect(await page.locator('button:has-text("Details"), button:has-text("Continue")').count()).toBe(0);
      await MonoDriver.hold(page, '[data-option]:not([data-option="more"]):not(:disabled) >> nth=0');
      await page.waitForFunction(p => document.querySelector('.creation')?.getAttribute('data-page') !== p, where, { timeout: 5000 });
    }
    expect(seen.length).toBeGreaterThan(4);
    expect(seen.length).toBeLessThanOrEqual(10);
    expect(Math.max(...most)).toBeLessThanOrEqual(4);
    expect(await page.locator('button:has-text("Details")').count()).toBe(0);
    await MonoDriver.hold(page, '[data-option="set-out"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 90000 });
    expect(errors).toEqual([]);
    await page.close();
  }, 200000);

  // The first spells chosen as one hand (OR-97, OR-98): an elf evoker's every first-level spell in view, never paged; a
  // press takes one or lets it go, the page staying; a full hand shuts the rest; "Learn these three" held goes on, and
  // beside it the instrument of what the way sets out knowing shows the spells chosen.
  it('an elf mage learns three first spells at once', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1280, height: 800 }, { site, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await Shape.take(page, 'you', 'elf');
    await Shape.take(page, 'calling', 'mage');
    await Shape.take(page, 'specialty', 'evoker');
    expect(await Shape.at(page)).toBe('learn');
    const way = Creation.catalog().callings.find(c => c.id === 'mage')!.specializations.find(t => t.id === 'evoker')!;
    let rows = await Shape.spells(page);
    expect(rows.map(r => r.id).sort()).toEqual([...way.first!.open.map(s => s.id), 'learned'].sort());
    expect(rows.filter(r => !r.whole).map(r => r.id)).toEqual([]);
    expect(rows.filter(r => r.taken).length).toBe(3);
    expect(rows.filter(r => r.shut).length).toBe(rows.length - 4);
    // Let one go with a press, and take another.
    const gone = rows.find(r => r.taken)!.id;
    await page.click(`[data-option="${gone}"]`);
    await page.waitForFunction(() => document.querySelectorAll('.composed-rows [data-option]:disabled').length === 1);
    rows = await Shape.spells(page);
    expect([await Shape.at(page), rows.filter(r => r.shut).map(r => r.id)]).toEqual(['learn', ['learned']]);
    const taken = rows.find(r => !r.taken && r.id !== gone && r.id !== 'learned')!.id;
    await page.click(`[data-option="${taken}"]`);
    await page.waitForFunction(n => document.querySelectorAll('.composed-rows [data-option]:disabled').length === n,
      rows.length - 4);
    rows = await Shape.spells(page);
    const hand = rows.filter(r => r.taken).map(r => r.id);
    expect(hand).toContain(taken);
    expect(rows.filter(r => r.shut).length).toBe(rows.length - 4);
    // The instrument beside Learn these three: the spells chosen among what the way sets out knowing.
    await page.hover('[data-option="learned"]');
    await page.waitForSelector('.creation-entry [data-entry-row]');
    const shown = await page.locator('.creation-entry [data-entry-row]').evaluateAll(es => es.map(e => e.getAttribute('data-entry-row')));
    expect(shown).toEqual(expect.arrayContaining(hand));
    expect(shown).not.toContain(gone);
    // A click does not learn them; held, they are learned and the making goes on.
    await page.click('[data-option="learned"]');
    await page.waitForTimeout(400);
    expect(await Shape.at(page)).toBe('learn');
    await Shape.held(page, '[data-option="learned"]');
    expect(await Shape.at(page)).toBe('before');
    expect(errors).toEqual([]);
    await page.close();
  }, 200000);
});
