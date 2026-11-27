import type { Choice } from '../ui/choice-list';
import type { Frame } from '../creation/protocol';
import type { Offered } from '../presentation/offer';
import type { LensAct, Lensed } from '../presentation/glance-types';
import type { Leaf } from '../presentation/fold';
import { Attending } from '../ui/attention';
import type { MenuNode } from './menu-tree';

// The place's question (the owner's playtest of 27 November, OR-1490: "one page, one menu, strict four"): what can be
// done where the company stands, worked out once here for every client, in one menu from one source. Its first page is
// the engine's four (the glance's offer: Offers.scene, the places among them, never beside them); every other row of
// the scene, one flat level (each way, each thing at hand by its look, each person by a talk, each wait), is on the
// pages after it, four at a time, turned by Something else… (focus:page:<n>, a step of the session's focus that takes
// no time), so that nothing the lenses gave is out of reach and nothing stands in a second menu or a block of its own.
// The company's own page (the character, save and Options: the backstage) is the first of them, its own row.
// rows: this page's, in the order drawn, Something else… last; promoted: how many of them lead are the four (the
// first page's); marks: each row's leaves (the four's as the glance leads them, every other as the scene's drawer
// marks it, Something else… the fold of what is not in view).
export interface PlaceAsked {
  rows: Choice[]; promoted: number; page: { at: number; of: number; top?: number }; marks: Record<string, Leaf[]>;
}
// A page of the question: its rows, the page Something else… (or Back) turns to, and its words.
interface Page { rows: Choice[]; next: number; label: string }
// A kind of row folded into pages of its own (OR-1495), named for what it holds.
interface Kind { id: string; label: string; tone: Choice['tone']; rows: Choice[] }
export class PlaceQuestion {
  static readonly more = 'place:more';
  static readonly room = 4;
  static readonly yourself: Choice = { id: 'view:company', label: 'Your character', tone: 'company',
    command: 'view:company' };
  static of(frame: Pick<Frame, 'screen' | 'leaf'> & { menu?: MenuNode; combat?: unknown }, page = 0):
    PlaceAsked | undefined {
    const offer = frame.leaf.glance?.offer, menu = frame.menu;
    if (!offer || !menu || frame.combat) { return undefined; }
    const all = [...Attending.all(menu.choices), ...Attending.all(menu.scene.subjects.flatMap(x => x.choices))];
    const four = offer.primary.map(o => this.chosen(all, o));
    const led = new Set(four.flatMap(c => [c.id, c.command ?? '']));
    const rest = [this.yourself, ...this.top(menu), ...this.lensed(frame, menu)]
      .filter(c => !led.has(c.id) && !(c.command && led.has(c.command)));
    // All of it on one page where it fits there.
    if (four.length + rest.length <= this.room) {
      const rows = [...four, ...rest];
      return { rows, promoted: four.length, page: { at: 0, of: 1, top: 1 }, marks: this.marks(menu, rows) };
    }
    return this.turned(frame, menu, { four, rest }, page);
  }
  // The rest chosen by reason (OR-1495: fourteen pages in Iscoed's square had been too many to page through): what is
  // worth doing here leads, each row whose mark bears an opportunity and each way to somewhere not yet seen; the rest
  // folds by what it is, each kind of two rows or more one row that turns to its own pages, named for what it holds
  // (the other ways from here, the others here, the things at hand, yourself). Something else… turns the first pages
  // and comes round; a kind's own pages turn among themselves and come back to the page its row stands on.
  private static turned(frame: Pick<Frame, 'screen' | 'leaf'>, menu: MenuNode, at: { four: Choice[]; rest: Choice[] },
    page: number): PlaceAsked {
    const { top, folded, starts } = this.folded(frame, menu, at.rest);
    const pages: Page[] = [{ rows: at.four, next: top.length ? 1 : 0, label: 'Something else…' },
      ...top.map((p, i) => ({ rows: p, next: i + 1 < top.length ? i + 2 : 0,
        label: i + 1 < top.length ? 'Something else…' : 'Back to the first' })),
      ...folded.flatMap(k => this.chunk(k.rows).map((rows, i, all) => ({ rows,
        next: i + 1 < all.length ? starts[k.id]! + i + 1 : 1 + top.findIndex(p => p.some(c => c.id === `place:kind:${k.id}`)),
        label: i + 1 < all.length ? `More of ${k.label.toLowerCase()}…` : 'Back' })))];
    const n = ((page % pages.length) + pages.length) % pages.length, shown = pages[n]!;
    const more: Choice = { id: this.more, label: shown.label, tone: 'way', command: `focus:page:${shown.next}` };
    const marks = { ...this.marks(menu, shown.rows),
      ...Object.fromEntries(folded.map(k => [`place:kind:${k.id}`, Object.values(this.marks(menu, k.rows)).flat()])) };
    // Something else… the fold of what the first pages hold out of view; Back, of nothing.
    const hidden = pages.filter((_, i) => i !== n && i <= top.length).flatMap(p => p.rows)
      .flatMap(c => marks[c.id] ?? this.marks(menu, [c])[c.id] ?? []);
    return { rows: [...shown.rows, more], promoted: n ? 0 : at.four.length,
      page: { at: n, of: pages.length, top: 1 + top.length },
      marks: { ...marks, [more.id]: n > top.length ? [] : hidden } };
  }
  // The rest by reason, then by kind: the first pages' rows (each kind of two or more its one row), the kinds folded,
  // and the page each kind's own pages begin at.
  private static folded(frame: Pick<Frame, 'screen' | 'leaf'>, menu: MenuNode, rest: Choice[]):
    { top: Choice[][]; folded: Kind[]; starts: Record<string, number> } {
    const marked = this.marks(menu, rest);
    const unseen = new Set(frame.screen.exits.filter(e => !e.visited && !e.crosses).map(e => e.id));
    // What is worth doing, one page of it at most, in the order the glance's offer ranks its rest (by reason).
    const ranked = new Map((frame.leaf.glance?.offer?.rest ?? []).flatMap((o, i) => [[o.choice, i], [o.command ?? '', i]]));
    const worth = rest.filter(c => (marked[c.id] ?? []).some(l => l.witnesses.some(w => w.aspects.length > 0))
      || unseen.has(c.id)).sort((a, b) => this.at(ranked, a) - this.at(ranked, b)).slice(0, this.room);
    const kinds = this.kinds.map(k => ({ ...k, rows: rest.filter(c => !worth.includes(c) && this.kind(c) === k.id) }))
      .filter(k => k.rows.length);
    const folded = kinds.filter(k => k.rows.length > 1);
    const loose = kinds.filter(k => k.rows.length < 2).flatMap(k => k.rows);
    const top = this.chunk([...worth, ...loose, ...folded.map(k => this.opener(k, 0))]);
    const starts: Record<string, number> = {};
    let n = 1 + top.length;
    for (const k of folded) { starts[k.id] = n; n += this.chunk(k.rows).length; }
    return { top: top.map(p => p.map(c => { const k = folded.find(x => c.id === `place:kind:${x.id}`);
      return k ? this.opener(k, starts[k.id]!) : c; })), folded, starts };
  }
  private static at(ranked: Map<string, number>, c: Choice): number {
    return ranked.get(c.id) ?? ranked.get(c.command ?? '') ?? Number.MAX_SAFE_INTEGER;
  }
  private static opener(k: Kind, page: number): Choice {
    return { id: `place:kind:${k.id}`, label: `${k.label}…`, tone: k.tone, command: `focus:page:${page}` };
  }
  private static chunk<T>(xs: T[]): T[][] {
    return Array.from({ length: Math.ceil(xs.length / this.room) },
      (_, i) => xs.slice(i * this.room, (i + 1) * this.room));
  }
  static readonly kinds: Omit<Kind, 'rows'>[] = [
    { id: 'ways', label: 'Other ways from here', tone: 'way' }, { id: 'people', label: 'Others here', tone: 'person' },
    { id: 'things', label: 'Things at hand', tone: 'thing' }, { id: 'yours', label: 'Yourself', tone: 'company' }];
  private static kind(c: Choice): string {
    return ['ways', 'people', 'things', 'yours'][this.rank(c)]!;
  }
  // Each row's leaves: one of the four's as the glance leads it, any other's as the scene's drawer marks it.
  private static marks(menu: MenuNode, rows: Choice[]): Record<string, Leaf[]> {
    return Object.fromEntries(rows.map(c => [c.id, menu.marks.led[c.id] ?? menu.marks.rows[c.id] ?? []]));
  }
  // The scene's rows at one flat level, as the frame's tree holds them (MenuTree.flattened): a thing's and a person's
  // own rows are their own pages', reached by the row that opens them. The ways first (where one can go is what a
  // player at a loss looks for: the owner's playtest of 27 November, "pointless wandering"), then whoever is here,
  // then what is at hand, then the company's own (its waits among them), each in the scene's order.
  private static top(menu: MenuNode): Choice[] {
    return menu.choices.map((c, i) => ({ c, i })).sort((a, b) => this.rank(a.c) - this.rank(b.c) || a.i - b.i)
      .map(x => x.c);
  }
  // What the lenses give that the scene's rows do not hold (standing one's ground before a threat, a blow at someone
  // dangerous on the picture), so that with no lens earned nothing they gave is out of reach (OR-1491); never a way
  // into another hex, which is the map's (the owner, 25 November: ways to another hex appear only on the map).
  private static lensed(frame: Pick<Frame, 'screen' | 'leaf'>, menu: MenuNode): Choice[] {
    const lenses = frame.leaf.glance?.lenses ?? {}, crossing = new Set(frame.screen.exits.filter(e => e.crosses)
      .map(e => e.id));
    const had = new Set([...Attending.all(menu.choices), ...Attending.all(menu.scene.subjects.flatMap(x => x.choices))]
      .flatMap(c => [c.id, c.command ?? '']));
    const tones = { places: 'way', people: 'person', things: 'thing', time: 'company' } as const;
    const all = Object.entries(lenses) as [string, Lensed][];
    return all.flatMap(([lens, l]) => [...l.promoted, ...l.rest].map(a => ({ a: a as LensAct, lens })))
      .filter(({ a }) => !!a.command && !had.has(a.choice) && !had.has(a.command) && !crossing.has(a.choice))
      .filter(({ a }, i, all) => all.findIndex(x => x.a.choice === a.choice) === i)
      .map(({ a, lens }) => ({ id: a.choice, label: a.label, command: a.command!,
        tone: tones[lens as keyof typeof tones] ?? 'company', ...'disabled' in a && a.disabled ? { disabled: a.disabled } : {} }));
  }
  private static rank(c: Choice): number {
    return c.tone === 'way' ? 0 : ['person', 'creature'].includes(c.tone) ? 1 : c.tone === 'thing' ? 2 : 3;
  }
  // The row one of the four is: the menu's own choice that does it, else the act as offered, done by its command.
  private static chosen(all: Choice[], o: Offered): Choice {
    return all.find(c => c.id === o.choice) ?? all.find(c => !!o.command && c.command === o.command)
      ?? { id: o.choice, label: o.label, tone: 'way', command: o.command ?? o.choice };
  }
  // The page shown as every client does it (OR-1494: one projection): each row that does something by a command, with
  // the Atlas aspects its mark bears, Something else… apart (next); a thing's page (opened, not done) and the
  // company's own page (the page's view) are the page's alone to open, the terminal and the runner listing them under
  // all.
  static paged(place: PlaceAsked): { id: string; label: string; command: string; aspects: string[]; note?: string }[] {
    return place.rows.flatMap(r => !r.command || r.command.startsWith('view:') || r.id === this.more ? [] : [{
      id: r.id, label: r.label, command: r.command, aspects: this.aspects(place, r.id),
      ...r.note ? { note: r.note } : {} }]);
  }
  // Something else…, the page turned: its command and words, as every client offers it apart from the rows (the
  // terminal's next, the runner's page.next), none where there is one page.
  static next(place: PlaceAsked): { command: string; label: string; at: number; of: number } | undefined {
    const r = place.rows.find(x => x.id === this.more);
    return r?.command ? { command: r.command, label: r.label, at: place.page.at, of: place.page.of } : undefined;
  }
  private static aspects(place: PlaceAsked, id: string): string[] {
    return [...new Set((place.marks[id] ?? []).flatMap(l => l.witnesses.flatMap(w => w.aspects)))].map(String);
  }
}
