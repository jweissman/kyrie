import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Frame } from '../../src/creation/protocol';
import { MenuModel } from '../../src/frame/menu-model';
import { MenuTree } from '../../src/frame/menu-tree';
import type { Choice } from '../../src/ui/choice-list';
import type { AppState, ReaderApp } from '../../web/reader/reader-app';
import { WorldStage } from '../../web/reader/stage/world-stage';

// The resting page counted as a player meets it (the owner's playtest of 27 November: "many pages showed several
// menus, and items looked unintegrated, drawn from several sources"): the page drawn whole from a frame, as the page
// draws it (WorldStage), and in it how many menus there are, which rows stand in each, and where each row comes from.
// A menu is an element PageFrame made one (data-menu), or any other element holding a row of acts of its own (an act
// drawn outside every menu: a second menu in all but name). A likeness on the painting (a glyph) is no row. A row's
// source: the engine's four (data-promoted), the place's question (data-question, its pages and Something else…), or
// anything else drawn as a row (the page's own block of ways, looks and waits: "opener").
export interface Counted {
  holders: string[]; menus: number; rows: number; promoted: number; sources: Record<string, number>; rail: boolean;
}
export class MenuCensus {
  // A page's own app over a frame: its state, and its menu as the page builds it.
  static app(frame: Frame, patch: Partial<AppState> = {}): ReaderApp {
    const state = { frame, view: 'here', open: [], cursor: 0, member: '', keyed: false, ...patch } as unknown as AppState;
    const page = { state, props: { query: new URLSearchParams() }, choose: (_: Choice) => undefined,
      setState(p: Partial<AppState>) { page.state = { ...page.state, ...p }; },
      get menu() { return MenuModel.build(page.state.frame, 'here', page.state.open); } };
    return page as unknown as ReaderApp;
  }
  static html(frame: Frame): string {
    return renderToStaticMarkup(createElement(WorldStage.View, { app: MenuCensus.app(frame) }));
  }
  // The page's menus and rows, read from its markup: each element opened is pushed with whether it is a menu, and each
  // act (a button with data-act, not a glyph) is counted in the menu it stands in, or in the element holding it.
  static count(html: string): Counted {
    const stack: { menu: boolean; id: number; promoted: boolean; question: boolean; tag: string }[] = [];
    const named = new Map<number, string>();
    const holders = new Set<number>(), sources: Record<string, number> = {};
    let n = 0, rows = 0, promoted = 0;
    const voids = /^(img|br|hr|input|meta|link|source|area|wbr|col|embed|track)$/;
    for (const m of html.matchAll(/<(\/?)([a-zA-Z0-9]+)([^>]*?)(\/?)>/g)) {
      const [, close, tag, attrs = '', self] = m;
      if (close) { stack.pop(); continue; }
      const menu = /\sdata-menu="true"/.test(attrs), inMenu = stack.findLast(s => s.menu);
      const at = { menu, id: n++, promoted: /\sdata-promoted="/.test(attrs) || !!stack.at(-1)?.promoted,
        question: /\sdata-question="/.test(attrs) || !!stack.at(-1)?.question,
        tag: `${tag}${/class="([^"]*)"/.exec(attrs)?.[1]?.replace(/^/, '.') ?? ''}` };
      named.set(at.id, at.tag);
      if (menu && !inMenu) { holders.add(at.id); }
      if (tag === 'button' && /\sdata-act="/.test(attrs) && !/\bact-glyph\b/.test(attrs)) {
        rows++;
        const source = at.promoted ? 'offer' : at.question ? 'question' : 'opener';
        if (at.promoted) { promoted++; }
        sources[source] = (sources[source] ?? 0) + 1;
        holders.add(inMenu?.id ?? stack.at(-1)?.id ?? -1);
      }
      if (!self && !voids.test(tag!)) { stack.push(at); }
    }
    return { holders: [...holders].map(h => named.get(h) ?? '?'), menus: holders.size, rows, promoted, sources,
      rail: /\sdata-rail="true"/.test(html) };
  }
  // What the lenses gave (each act of every lens: its four, its rest, and what is within its openers) that the place's
  // one menu does not reach (OR-1491: the lenses are not earned, so nothing they gave may be out of reach): an act is
  // reached where it is a row of one of the question's pages, or within the page of a row there (someone talked to,
  // a thing looked at, a way's own acts), by the row that opens it.
  static unreached(frame: Frame): string[] {
    const first = frame.question?.place;
    if (!first) { return []; }
    const rows = Array.from({ length: first.page.of }, (_, n) =>
      MenuTree.question(frame, { kind: 'place', page: n }).place?.rows ?? []).flat();
    const ids = new Set(rows.flatMap(r => [r.id, r.command ?? '']));
    const lenses = Object.values(frame.leaf.glance?.lenses ?? {});
    const acts = lenses.flatMap(l => [...l.promoted, ...l.rest, ...Object.values(l.leaves ?? {}).flat(),
      ...l.kept ?? []]);
    // A way into another hex is the map's, earned by a map found (the owner, 25 November): not the menu's to reach.
    const crossing = new Set(frame.screen.exits.filter(e => e.crosses).map(e => e.id));
    return [...new Set(acts.filter(a => !crossing.has(a.choice) && !MenuCensus.reached(ids, a))
      .map(a => `${a.choice} (${a.label})`))];
  }
  private static reached(ids: Set<string>, a: { choice: string; command?: string; subject?: string }): boolean {
    if (ids.has(a.choice) || (a.command && ids.has(a.command))) { return true; }
    const of = [a.subject, /^(.+?)[#/]/.exec(a.choice)?.[1]].filter((x): x is string => !!x);
    return of.some(x => ids.has(x) || ids.has(`${x}#talk`) || ids.has(`${x}#look`)
      || [...ids].some(id => id.startsWith(`${x}/`)));
  }
}
