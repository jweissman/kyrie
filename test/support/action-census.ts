/// <reference lib="dom" />
import type { Page } from 'playwright-core';
import { MonoDriver } from './mono-driver';

// The page's one structure (the owner, 16 November night): a background, a header, the narrative, the menu of four,
// and perhaps a rail of icons. Everything that can be pressed is in the page's menu ([data-menu]) or its rail
// ([data-rail]); what else may be pressed is named here, each with why, and the list only shrinks.
export interface Pressable { surface: string; text: string; why?: string }
export class ActionCensus {
  // What may be pressed outside the menu and the rail, and why.
  static readonly allowed: [string, string][] = [
    ['.more-told', 'a disclosure of more of the place (ruling 1: information, not an act)'],
    ['details.how > summary', 'how a roll fell, a disclosure (ruling 1)'],
    ['.board-labels *', "the map's own marks: places, signs, as the instrument draws them"],
    ['.surface .portraits [data-act], .portraits [data-act]', "a likeness on the scene: the scene's people, who open a "
      + 'conversation (the settled resting scene, M19; OR-38 decided)'],
    ['.book-head .quiet-word', "the Book's way back, the header's one way back (OR-38 decided)"],
    ['input[data-field="name"]', 'writing your own name'],
    ['.fight .status .quiet-word', 'the fight so far, a disclosure (ruling 1)'],
  ];
  // Every pressable thing in view on the page as it is now, outside the menu, the rail and what is allowed.
  static stray(page: Page, surface: string): Promise<Pressable[]> {
    return page.evaluate(({ surface, allowed }) => {
      const sel = 'button, a[href], [role="button"], summary, input, select, [data-act], [data-action]';
      const out: { surface: string; text: string }[] = [], seen = new Set<Element>();
      for (const e of Array.from(document.querySelectorAll(sel))) {
        const el = e.closest(sel)!;
        if (seen.has(el)) { continue; }
        seen.add(el);
        const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
        if (r.width < 2 || r.height < 2 || cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.05) { continue; }
        if (r.bottom < 0 || r.top > innerHeight || el.closest('[aria-hidden="true"], [data-menu], [data-rail]')) { continue; }
        if (allowed.some(a => el.matches(a))) { continue; }
        out.push({ surface, text: ((el as HTMLElement).innerText || el.getAttribute('aria-label') || el.tagName)
          .replace(/\s+/g, ' ').trim().slice(0, 50) });
      }
      return out;
    }, { surface, allowed: ActionCensus.allowed.map(([s]) => s) });
  }
  // Rows of the menu not of the one height (the owner, 16 November night: "the heights of the items can't vary from
  // page to page"); a card (ancestry, calling) and a likeness's tile are compositions of their own.
  static readonly shaped = '.card, .composed-card, .person, .creature, .lens-tile, details.how > summary';
  static uneven(page: Page, surface: string): Promise<Pressable[]> {
    return page.evaluate(({ surface, shaped }) => {
      const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--choice-h')) || 46;
      return Array.from(document.querySelectorAll('[data-menu] :is(button, [data-act])')).filter(el => {
        const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
        return r.height > 2 && cs.display !== 'none' && cs.visibility !== 'hidden' && !el.matches(shaped)
          && !el.closest(shaped) && el.closest('[data-menu] > *, [data-menu] li') && Math.abs(r.height - h) > 1.5;
      }).map(el => ({ surface, text: `${(el as HTMLElement).innerText.replace(/\s+/g, ' ').trim().slice(0, 40)} `
        + `(${Math.round(el.getBoundingClientRect().height)} px, not ${h})` }));
    }, { surface, shaped: ActionCensus.shaped });
  }
  // Rows of the menu not drawn by the one row (ChoiceRow: its class, .choice-row): the same mark, words, aside and key,
  // whatever the page (the owner, 16 November night: "always render the menu items in the same structured way").
  static foreign(page: Page, surface: string): Promise<Pressable[]> {
    return page.evaluate(({ surface, shaped }) => Array.from(document.querySelectorAll(
      '[data-menu] :is(button, a[href], [data-act], [role="button"])')).filter(el => {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      return r.height > 2 && cs.display !== 'none' && cs.visibility !== 'hidden' && !el.matches(shaped)
        && !el.closest(shaped) && !el.closest('.choice-row') && !el.closest('[aria-hidden="true"]');
    }).map(el => ({ surface, text: `${((el as HTMLElement).innerText || el.getAttribute('aria-label') || el.tagName)
      .replace(/\s+/g, ' ').trim().slice(0, 40)} (${el.tagName.toLowerCase()}.${el.className.toString().split(' ')[0]}, `
      + 'not the one row)' })), { surface, shaped: ActionCensus.shaped });
  }
  // The opening as a player walks it: the title, each step of a life, setting out, the opening's pages, and the
  // first place, its lenses, someone talked to, the map and the Book: what is stray on each.
  static async walk(page: Page, site: string): Promise<Pressable[]> {
    const found: Pressable[] = [], d = new MonoDriver(page), at = async (s: string) => {
      await page.waitForTimeout(600);
      found.push(...await ActionCensus.stray(page, s), ...await ActionCensus.uneven(page, s),
        ...await ActionCensus.foreign(page, s));
    };
    await page.goto(`file://${site}/mono.html`); await page.waitForSelector('[data-action="begin"]'); await at('title');
    await page.goto(`file://${site}/mono.html?world=kite&opening`); await page.waitForSelector('[data-mode="create"]');
    for (let i = 0; i < 9; i++) {
      const step = await page.getAttribute('.creation', 'data-page');
      await at(`creation:${step}`);
      if (step === 'go') { break; }
      await MonoDriver.hold(page, '[data-option]:not([data-option="more"]):not(:disabled) >> nth=0');
      await page.waitForFunction(p => document.querySelector('.creation')?.getAttribute('data-page') !== p, step);
    }
    await MonoDriver.hold(page, '[data-option="set-out"]');
    await page.waitForSelector('[data-mode="prologue"], [data-mode="explore"]', { timeout: 120000 });
    for (let i = 0; i < 6 && await page.locator('[data-mode="prologue"]').count(); i++) {
      await page.waitForTimeout(2400); await at(`opening:${await page.getAttribute('.prologue-page', 'data-beat')}`);
      if (await page.locator('[data-action="answer"]').count()) { await page.keyboard.press('1'); continue; }
      if (await page.locator('.prologue-page .go-on').count()) { await MonoDriver.hold(page, '.prologue-page .go-on'); }
    }
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 }); await d.settle(); await d.enter();
    await at('scene');
    for (const part of ['talk', 'go', 'look', 'wait']) {
      const mark = page.locator(`.rail-mark.opens-${part}`);
      if (!await mark.count() || !await mark.isEnabled()) { continue; }
      await mark.click(); await d.settle(); await at(`lens:${part}`); await page.keyboard.press('Escape'); await d.settle();
    }
    const talk = page.locator('[data-act$="#talk"]').first();
    if (await talk.count()) { await talk.click(); await d.settle(); await at('talk'); await d.away(); }
    for (const [label, s] of [['The map', 'map'], ['Your book', 'book']] as const) {
      const mark = page.locator(`.rail-mark[aria-label="${label}"]`);
      if (!await mark.count()) { continue; }
      await mark.click(); await d.settle(); await page.waitForTimeout(1200); await at(s);
      await page.keyboard.press('Escape'); await d.settle();
    }
    return found;
  }
}
