import type { Choice } from '../ui/choice-list';
import { Attending, type Talk } from '../ui/attention';
import { SceneModel } from '../ui/scene';
import { TalkFocus } from '../ui/talk-focus';
import type { Counter } from '../ui/trade-model';
import type { Frame } from '../creation/protocol';
import { Fold, type Leaf } from '../presentation/fold';
import { Attest } from '../presentation/attest';
import type { Focus, Conversation } from '../session/focus';
import { Wares, type Ware } from './wares';
import { Paging } from './paging';
import type { TalkLine } from './talk-lines';
import type { Menu } from './menu-model';
import type { PlaceAsked } from './place-question';

// The question asked from the focus, on every frame (OR-1451, engine-focus.md §4): the focus, and while it is a talk,
// the talk's menu, worked out once here for every client (the page draws it, the terminal prints it, the runner offers
// it). Examination, the map, the place's parts and sheets join it in their own steps.
// At the place, its rows: the four, then the rest a page at a time (PlaceQuestion, OR-1490), where the frame's menu
// is had to ask it of.
export interface Question { focus: Focus; talk?: TalkAsked; place?: PlaceAsked }
// A conversation's question: whom, what has passed (its lines), and what can be said now, in the order it is drawn
// (an answer owed, a page of what can be said with Trade among it, taking leave; or, trading, what they buy of the
// company's, their wares and services, and Back); each row with its command, and the leaves each row's mark is the
// fold of (marks: the rows' by id; a reply asked already bears nothing, as the frame's marks hold it).
export interface TalkAsked {
  talk: Talk; lines: TalkLine[]; trading: boolean;
  // The ids of what has been asked in it, and of what the last answer opened.
  asked: string[]; opened: string[];
  answers: Choice[]; shown: (Choice | 'trade')[]; page: { at: number; of: number }; trades: boolean;
  // Trading: what they would buy of the company's, the rest of their services, the wares on their counter, what they
  // would buy and cannot pay for, and what they buy.
  sales: Choice[]; services: Choice[]; wares: Ware[]; short: NonNullable<Counter['short']>; buys: Counter['buys'];
  // Every row of the question as drawn, each with its command: Trade (focus:trade:on), the next page
  // (focus:page:<n>), Back from trading (focus:trade:off) and the leave (take_leave, or focus:place) among them.
  rows: Choice[]; marks: Record<string, Leaf[]>;
}
export class TalkQuestion {
  static readonly trade = 'talk:trade';
  static readonly more = 'talk:more';
  static readonly back = 'talk:back';
  // The menu a client draws while the focus is a talk: the question's rows, the scene kept whole so that what is said
  // is said to them by name (MenuModel.said).
  static menu(frame: Pick<Frame, 'screen' | 'question'>): Menu | undefined {
    const t = frame.question?.talk;
    if (!t) { return undefined; }
    return { scene: SceneModel.build(frame.screen), talk: t.talk, choices: t.rows, sections: [{ id: t.talk.subject.id,
      title: t.talk.subject.name, tone: 'person', glyph: '☺', choices: t.rows }] };
  }
  static of(frame: Pick<Frame, 'screen' | 'leaf'>, focus: Focus, conversation?: Conversation): Question {
    if (focus.kind !== 'talk') { return { focus }; }
    const talk = this.talk(frame, focus);
    return talk ? { focus, talk: this.asked(frame, focus, talk, conversation) } : { focus: { kind: 'place' } };
  }
  // The one talked with as the scene holds them, their leave the session's own where the world has none to take (a
  // companion's talk, turned to by its holder).
  private static talk(frame: Pick<Frame, 'screen'>, focus: Extract<Focus, { kind: 'talk' }>): Talk | undefined {
    const talk = Attending.talk(SceneModel.build(frame.screen), focus.with);
    if (!talk) { return undefined; }
    return talk.leave.command ? talk : { ...talk, leave: { ...talk.leave, command: 'focus:place' } };
  }
  private static asked(frame: Pick<Frame, 'screen' | 'leaf'>, focus: Extract<Focus, { kind: 'talk' }>, talk: Talk,
    conversation?: Conversation): TalkAsked {
    const screen = frame.screen, g = frame.leaf.glance, who = talk.subject.id;
    const counter = screen.trade.find(c => c.id === who), { wares, rest } = Wares.of(counter, talk.replies);
    const all = Attending.all(TalkFocus.simple(rest)), asked = this.ids(all, conversation?.asked ?? []);
    const heard = conversation?.heard && this.ids(all, conversation.heard);
    const led = g?.acts.find(a => a.subject === who)?.for;
    // What the place led with about them as they were turned to, or as it leads now.
    const marked = conversation?.turned.length ? conversation.turned
      : (g?.acts ?? []).filter(a => a.subject === who).flatMap(a => (a.inside ?? []).map(x => x.command));
    const focused = TalkFocus.of(rest, { ...led ? { led } : {}, marked, ...heard ? { heard } : {}, asked,
      weighty: screen.weighty ?? [], paying: screen.paying ?? [] });
    const trades = wares.length > 0 || focused.services.length > 0 || (counter?.buys.length ?? 0) > 0;
    const room = 3 - focused.answers.length;
    const paged = Paging.of([...focused.salient, ...trades ? ['trade' as const] : [], ...focused.more], room, focus.page);
    const { sales, rest: services } = TalkFocus.parted(focused.services);
    const replies = this.replies(g, talk, screen.paying ?? [], asked);
    const out = { talk, lines: conversation?.lines ?? [], trading: focus.trading, asked, opened: [...focused.opened],
      answers: focused.answers, shown: paged.shown, page: { at: paged.at, of: paged.pages }, trades, sales, services,
      wares, short: counter?.short ?? [], buys: counter?.buys ?? [] };
    const rows = focus.trading ? this.trading(out) : this.talking(out, focused.salient, focused.more);
    const hidden = [...focused.salient, ...trades ? ['trade' as const] : [], ...focused.more]
      .filter(x => !paged.shown.includes(x)).flatMap(x => x === 'trade' ? focused.services : [x]);
    return { ...out, rows, marks: this.marks(rows, replies, { services: focused.services, hidden }) };
  }
  // Talking: an answer owed, the page shown (Trade in its place among it), taking leave, and the next page.
  private static talking(q: Omit<TalkAsked, 'rows' | 'marks'>, salient: Choice[], more: Choice[]): Choice[] {
    const next = q.page.of > 1 ? [{ id: this.more, tone: 'person' as const, command: `focus:page:${q.page.at + 1}`,
      label: [...salient, ...more].every(c => this.spent(q.asked, c)) ? 'Ask again…' : 'Something else…',
      note: `${q.page.at + 1} of ${q.page.of}` }] : [];
    return [...q.answers, ...q.shown.map(c => c === 'trade' ? { id: this.trade, label: 'Trade', tone: 'person' as const,
      command: 'focus:trade:on' } : c), q.talk.leave, ...next];
  }
  // Trading: what they would buy of the company's, each thing on their counter that can be bought (a row for each of
  // the company where it is bought for one of them), the rest of what is had of them, and Back to what is said.
  private static trading(q: Omit<TalkAsked, 'rows' | 'marks'>): Choice[] {
    const bought = q.wares.flatMap(w => !w.buy ? [] : w.buy.children?.length ? w.buy.children : [w.buy]);
    return [...q.sales, ...bought, ...q.services, { id: this.back, label: 'Back', tone: 'person', command: 'focus:trade:off' }];
  }
  // What each thing to say bears, as the talk drawer marks it: itself, or what it opens; asked again, or put already
  // in this talk, nothing (see MenuTree.replies).
  private static replies(g: Frame['leaf']['glance'], talk: Talk, paying: readonly string[], asked: string[]):
    Record<string, Leaf[]> {
    const out: Record<string, Leaf[]> = {};
    for (const c of Attending.all(talk.replies)) {
      out[c.id] ??= (c.children?.length && !c.command ? Attending.all(c.children).filter(k => !k.children?.length)
        : [c]).map(k => Fold.leaf(k, /_again(\(|$)/.test(k.command ?? '') ? [] : Attest.reply(g, k, paying)))
        .filter(l => !asked.includes(l.id));
    }
    return out;
  }
  // Each row's leaves: a reply's own; Trade, the fold of the services; the next page, of what is not in view.
  private static marks(rows: Choice[], replies: Record<string, Leaf[]>, of: { services: Choice[]; hidden: Choice[] }):
    Record<string, Leaf[]> {
    return Object.fromEntries(rows.map(r => [r.id, r.id === this.trade ? this.fold(replies, of.services)
      : r.id === this.more ? this.fold(replies, of.hidden) : replies[r.id] ?? []]));
  }
  private static fold(replies: Record<string, Leaf[]>, cs: Choice[]): Leaf[] {
    return cs.flatMap(c => replies[c.id] ?? []);
  }
  // A reply put already, or asked again.
  private static spent(asked: string[], c: Choice): boolean {
    return asked.includes(c.id) || /_again(\(|$)/.test(c.command ?? '');
  }
  // The ids of what can be said that are one of these (by its id as it was drawn, or the command it did).
  private static ids(all: Choice[], put: string[]): string[] {
    const of = new Set(put);
    return all.filter(c => of.has(c.id) || (c.command && of.has(c.command))).map(c => c.id);
  }
}
