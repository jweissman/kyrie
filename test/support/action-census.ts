/// <reference lib="dom" />
import type { Page } from 'playwright-core';
import { MonoDriver } from './mono-driver';
import { Rail } from './rail';

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
    ['.aim-card .aim-pick', 'an aim considered, which the Notes\' one menu acts on (a presentation gesture, as a cell chosen '
      + 'on the map is)'],
    ['.fight .status .quiet-word', 'the fight so far, a disclosure (ruling 1)'],
    ['.sky-out', "the sky's way back to the twelve from a sign drawn up, shown only while one is (OR-89, the owner's: a "
      + 'gesture of the instrument, as Escape and a touch on the open sky are; page-controls names it)'],
    ['.creation-cards [data-card]', "an ancestry's card, the instrument drawn from the menu's own rows: a press turns it "
      + 'over to its page, never chooses (the owner, 27 November; OR-1801)'],
    ['.creation-book [data-option]', "the menu's own row for the ancestry at the foot of its page, choosing as the "
      + "menu's does (OR-1801)"],
    ['.creation-book [data-action="cards"]', "the page's way back to the cards, a gesture of the instrument, as Escape is "
      + '(OR-1801)'],
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
  static readonly shaped = '.card, .person, .creature, .lens-tile, details.how > summary';
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
  // More than one menu in view (the owner, 16 November night: "the four promoted actions", one menu a page): each
  // visible [data-menu] not inside another, by what it holds.
  static menus(page: Page, surface: string): Promise<Pressable[]> {
    return page.evaluate(surface => {
      const shown = Array.from(document.querySelectorAll('[data-menu]')).filter(m => {
        const r = m.getBoundingClientRect(), cs = getComputedStyle(m);
        return !m.parentElement?.closest('[data-menu]') && !m.closest('[aria-hidden="true"]') && cs.visibility !== 'hidden'
          && (r.height > 2 || cs.display === 'contents') && m.querySelector('button, a[href], [data-act]');
      });
      return shown.length > 1 ? shown.map(m => ({ surface, text: `${m.className.toString().split(' ')[0] || m.tagName}: `
        + `${(m as HTMLElement).innerText.replace(/\s+/g, ' ').trim().slice(0, 40)} (one of ${shown.length} menus)` })) : [];
    }, surface);
  }
  // More than four rows in a menu's view (the owner, 17 November: "I shouldn't see any more than four action items
  // under any circumstances"): a pager is a row, and counts. The narrow exception is a list that scrolls in the menu's
  // place ([data-list]: a long counter), counted as one.
  static crowded(page: Page, surface: string): Promise<Pressable[]> {
    return page.evaluate(surface => Array.from(document.querySelectorAll('[data-menu]')).filter(m =>
      !m.parentElement?.closest('[data-menu]') && !m.closest('[aria-hidden="true"]')).flatMap(m => {
      const rows = Array.from(m.querySelectorAll('.choice-row')).filter(el => {
        const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
        return r.height > 2 && cs.visibility !== 'hidden' && +cs.opacity >= 0.05 && !el.closest('[data-list]')
          && r.bottom > 0 && r.top < innerHeight;
      }), lists = m.querySelectorAll('[data-list]').length, n = rows.length + lists;
      return n > 4 ? [{ surface, text: `${n} rows: ${rows.map(r => (r as HTMLElement).innerText.replace(/\s+/g, ' ')
        .trim().slice(0, 18)).join(' | ')}` }] : [];
    }), surface);
  }
  // What is in a menu or a rail but cannot be pressed where it is drawn: the point at its middle is another element's,
  // or nothing's (a creation rail's marks had been drawn with pointer-events none, on main for one push). Not what is
  // scrolled out of view within what scrolls (the Book's rows under a long page of notes, a scroll away, as one out of
  // the window is: OR-873 asks whether the Book's menu should stand in view).
  static unreachable(page: Page, surface: string): Promise<Pressable[]> {
    return page.evaluate(surface => Array.from(document.querySelectorAll(
      ':is([data-menu], [data-rail]) :is(button, a[href], [data-act])')).filter(el => {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      if (r.width < 2 || r.height < 2 || cs.visibility === 'hidden' || +cs.opacity < 0.05 || el.closest('[aria-hidden="true"]')
        || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) { return false; }
      for (let p = el.parentElement; p; p = p.parentElement) {
        if (!/(auto|scroll)/.test(getComputedStyle(p).overflowY)) { continue; }
        const box = p.getBoundingClientRect(), y = r.top + r.height / 2;
        if (y < box.top || y > box.bottom) { return false; }
      }
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !hit || !(hit === el || el.contains(hit));
    }).map(el => ({ surface, text: `${((el as HTMLElement).innerText || el.getAttribute('aria-label') || el.tagName)
      .replace(/\s+/g, ' ').trim().slice(0, 40)} (not pressable where it is drawn)` })), surface);
  }
  // The page's own parts, as PageFrame marks them: one header and at most one narrative in view (the owner, 16 November
  // night: "a background, a header, narrative/description block, the four promoted actions, and possibly an icon
  // rail"). Surfaces not yet drawn in the one page's parts are named, with why, and the list only shrinks.
  static readonly unframed: Record<string, string> = {};
  static framed(page: Page, surface: string): Promise<Pressable[]> {
    if (ActionCensus.unframed[surface.split(':')[0]!]) { return Promise.resolve([]); }
    return page.evaluate(surface => {
      const shown = (slot: string) => Array.from(document.querySelectorAll(`[data-slot="${slot}"]`)).filter(e => {
        const cs = getComputedStyle(e), r = e.getBoundingClientRect();
        return !e.closest('[aria-hidden="true"]') && cs.visibility !== 'hidden'
          && (cs.display === 'contents' ? e.childElementCount > 0 : r.height > 1);
      }).length;
      const header = shown('header'), narrative = shown('narrative');
      // The opening's page after its beats has no header of its own, its chapter said on the pages before (097c3a55).
      // Nor has the title, its name small at the head of its ways in, in the menu (no hero: OR-501, the owner, 24
      // November); the census had asked it for a header since.
      const headers = surface === 'opening:after' || surface === 'title' ? [0, 1] : [1];
      return headers.includes(header) && narrative <= 1 ? []
        : [{ surface, text: `${header} headers, ${narrative} narratives` }];
    }, surface);
  }
  // The opening as a player walks it: the title, each step of a life, setting out, the opening's pages, and the
  // first place, its lenses, someone talked to, the map and the Book: what is stray on each.
  static async walk(page: Page, site: string): Promise<Pressable[]> {
    const found: Pressable[] = [], d = new MonoDriver(page), at = async (s: string) => {
      await page.waitForTimeout(600);
      found.push(...await ActionCensus.stray(page, s), ...await ActionCensus.uneven(page, s),
        ...await ActionCensus.foreign(page, s), ...await ActionCensus.menus(page, s),
        ...await ActionCensus.unreachable(page, s), ...await ActionCensus.framed(page, s),
        ...await ActionCensus.crowded(page, s));
    };
    await page.goto(`file://${site}/mono.html`); await page.waitForSelector('[data-action="begin"]'); await at('title');
    await page.goto(`file://${site}/mono.html?world=kite&opening`); await page.waitForSelector('[data-mode="create"]');
    for (let i = 0; i < 9; i++) {
      const step = await page.getAttribute('.creation', 'data-page');
      await at(`creation:${step}`);
      if (step === 'go') { break; }
      await MonoDriver.enter(page, '[data-option]:not([data-option="more"]):not(:disabled) >> nth=0');
      await page.waitForFunction(p => document.querySelector('.creation')?.getAttribute('data-page') !== p, step);
    }
    await MonoDriver.enter(page, '[data-option="set-out"]');
    await page.waitForSelector('[data-mode="prologue"], [data-mode="explore"]', { timeout: 120000 });
    for (let i = 0; i < 6 && await page.locator('[data-mode="prologue"]').count(); i++) {
      await page.waitForTimeout(2400); await at(`opening:${await page.getAttribute('.prologue-page', 'data-beat')}`);
      if (await page.locator('[data-action="answer"]').count()) { await page.keyboard.press('1'); continue; }
      if (await page.locator('.prologue-page .go-on').count()) { await MonoDriver.enter(page, '.prologue-page .go-on'); }
    }
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 }); await d.settle(); await d.enter();
    await at('scene');
    for (const part of ['talk', 'go', 'look', 'wait']) {
      const mark = page.locator(`.rail-mark.opens-${part}`);
      if (!await mark.count() || !await mark.isEnabled()) { continue; }
      await Rail.click(page, `.rail-mark.opens-${part}`); await d.settle(); await at(`lens:${part}`); await page.keyboard.press('Escape'); await d.settle();
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
