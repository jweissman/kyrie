import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Frame } from '../../src/creation/protocol';
import { SceneModel } from '../../src/ui/scene';
import { Attending } from '../../src/ui/attention';
import { MenuModel } from '../../src/frame/menu-model';
import { TalkStage } from '../../web/reader/stage/talk-stage';

// A conversation held to the focus contract (OR-212; BRIEF §5B: the census extended to the rendered talk drawer, its
// paging and its focus): each person's talk drawer rendered as the page renders it (TalkStage.View, opened on them,
// nothing asked), every page of it as More… turns them. On every page their leave-taking is drawn (leaving is plain),
// nothing is drawn that is not an act of theirs the engine offers (the place's other acts recede), and every topic the
// engine offers with them is drawn on one page or another (their topics together, none out of reach). What is sold
// is drawn under Trade, not among the topics. Each breach is said, by whom and what.
export class TalkTruth {
  static of(frame: Frame): string[] {
    const out: string[] = [];
    for (const sub of SceneModel.build(frame.screen).subjects.filter(x => x.kind === 'person')) {
      const pages = this.pages(frame, sub.id);
      if (!pages) { continue; }
      const theirs = Attending.all(sub.choices ?? []), ids = new Set(theirs.map(c => c.id));
      const drawn = new Set(pages.flat());
      for (const [i, page] of pages.entries()) {
        if (!page.some(a => a.endsWith('#leave'))) { out.push(`${sub.name}: no leave-taking on page ${i + 1}`); }
        for (const a of page.filter(x => !ids.has(x) && !x.endsWith('#leave'))) {
          out.push(`${sub.name}: drawn in their talk, not theirs: ${a}`);
        }
      }
      const topics = theirs.filter(c => c.command && /\/0:Talk\/0:/.test(c.id));
      for (const t of topics.filter(c => !drawn.has(c.id))) { out.push(`${sub.name}: a topic out of reach: ${t.label}`); }
    }
    return out;
  }
  // The acts each page of their drawer draws, by the page's own ids; none where no talk is drawn for them.
  static pages(frame: Frame, id: string): string[][] | undefined {
    const menu = MenuModel.build(frame, 'here', [], { attention: { kind: 'person', id }, asked: [] });
    if (!menu.talk) { return undefined; }
    const app = { state: { frame, asked: [], talk: [], open: [], keyed: false }, menu,
      props: { query: new URLSearchParams() }, trade: () => undefined } as never;
    const html = (at: number) => renderToStaticMarkup(createElement(TalkStage.View, { app, talk: menu.talk!, at }));
    const first = html(0), of = Number(/more-talk[\s\S]*?\d+ of (\d+)/.exec(first)?.[1] ?? 1);
    return Array.from({ length: of }, (_, at) => at ? html(at) : first)
      .map(h => [...h.matchAll(/data-act="([^"]*)"/g)].map(m => this.text(m[1]!)));
  }
  // An attribute's text as written in the markup.
  private static text(html: string): string {
    return html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  }
}
