import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Frame } from '../../src/creation/protocol';
import { Indicator } from '../../src/presentation/indicator';
import { SceneModel } from '../../src/ui/scene';
import { PlaySession } from '../../src/session/play-session';
import { MenuModel } from '../../web/reader/menu-model';
import { TalkStage } from '../../web/reader/stage/talk-stage';
import { DrawerTruth } from './drawer-truth';
import { Glanced } from './glanced';

// A mark against every drawer, page and focus it opens (OR-302, OR-303; AGENTS.md: a pip has a witness, a lens's
// contents inherit its mark, the gold stays continuous to its destination). For each person here whose likeness is
// marked: the drawer as the page draws it, nothing asked, on every page its More… turns to (a tone on More… is drawn
// on a row of a later page, and the likeness's on a row of one of them); the drawer again once the company has
// turned to them, the act the page does on opening it (the gold had gone from Nest's question at Gatesend the
// moment she was turned to, nothing done that it promised); and, where the mark is the aim's gold, the act it
// promises done, after which that act is gold no more. With DrawerTruth's both ways. Each breach said, by turn,
// person and what was drawn.
export class MarkTruth {
  static readonly most = 6;
  static async of(session: PlaySession, turn: string): Promise<string[]> {
    const g = Glanced.of(session), frame = g.frame(), out = DrawerTruth.of(frame).map(b => `${turn}: ${b}`);
    for (const sub of SceneModel.build(frame.screen).subjects.filter(x => x.kind === 'person')) {
      const tone = Indicator.of({ aspects: frame.leaf.glance?.likenesses?.[sub.id]?.aspects ?? [] }).tone;
      const talk = sub.choices.find(c => c.does === 'talk_to' && c.command);
      if (!tone || !talk?.command) { continue; }
      const said = `${turn}: ${sub.name}, ${tone}`;
      out.push(...this.paged(frame, sub.id, tone).map(b => `${said}, ${b}`));
      const turned = Glanced.of(PlaySession.fromSave(structuredClone(session.campaign.save())));
      await turned.perform(talk.command);
      const after = this.pages(turned.frame(), sub.id);
      // Unless a danger here warned the company off in the moment it took to turn to them: the warning leads, and what
      // else is here recedes (the road's footpads at the golden walk's camp, OR-321, and the pedlar there, turn 45).
      const warned = !frame.screen.warned && !!turned.screen.warned;
      if (!warned && !after.some(p => p.rows.has(tone))) { out.push(`${said}, turned to: drawn ${this.said(after)}`); }
      if (warned || tone !== 'gold') { continue; }
      const promised = turned.glance.acts.find(a => a.subject === sub.id && a.continues)?.inside?.[0]?.command;
      if (!promised) { out.push(`${said}, turned to: no act is the gold's`); continue; }
      await turned.perform(promised);
      const still = turned.glance.acts.find(a => a.continues)?.inside?.some(x => x.command === promised);
      if (still) { out.push(`${said}, ${promised} done, still gold`); }
    }
    return out;
  }
  // A drawer's pages: the tones on its rows, and on the row that turns to the next.
  private static paged(frame: Frame, id: string, tone: string): string[] {
    const pages = this.pages(frame, id), out: string[] = [];
    if (!pages.some(p => p.rows.has(tone))) { out.push(`its drawer drawn ${this.said(pages)}`); }
    const later = new Set(pages.slice(1).flatMap(p => [...p.rows]));
    const promised = [...pages[0]?.more ?? []].filter(t => !later.has(t));
    if (promised.length) { out.push(`More… ${promised.join('+')} and no later page's row`); }
    return out;
  }
  static pages(frame: Frame, id: string): { rows: Set<string>; more: Set<string> }[] {
    const menu = MenuModel.build(frame, 'here', [], { attention: { kind: 'person', id }, asked: [] });
    if (!menu.talk) { return []; }
    const app = { state: { frame, asked: [], talk: [], open: [], keyed: false }, menu,
      props: { query: new URLSearchParams() }, trade: () => undefined } as never;
    const out: { rows: Set<string>; more: Set<string> }[] = [];
    for (let at = 0; at < this.most; at++) {
      const html = renderToStaticMarkup(createElement(TalkStage.View, { app, talk: menu.talk, at }));
      const answer = /<div class="answer">(.*)/s.exec(html)?.[1] ?? '';
      const [rows, more = ''] = answer.split('<li class="more-talk">');
      out.push({ rows: this.tones(rows!), more: this.tones(more.split('</li>')[0]!) });
      if (!more) { break; }
      const pages = Number(/(\d+) of (\d+)/.exec(more)?.[2] ?? 1);
      if (at + 1 >= pages) { break; }
    }
    return out;
  }
  private static tones(html: string): Set<string> {
    return new Set([...html.matchAll(/--tone-(\w+)/g)].map(m => m[1]!));
  }
  private static said(pages: { rows: Set<string> }[]): string {
    return pages.map(p => [...p.rows].join('+') || 'plain').join(' | ') || 'no drawer';
  }
}
