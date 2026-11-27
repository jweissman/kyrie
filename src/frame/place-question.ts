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
  rows: Choice[]; promoted: number; page: { at: number; of: number }; marks: Record<string, Leaf[]>;
}
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
    // All of it on one page where it fits there; else the four, then the rest a page of four at a time.
    if (four.length + rest.length <= this.room) {
      const rows = [...four, ...rest];
      return { rows, promoted: four.length, page: { at: 0, of: 1 }, marks: this.marks(menu, rows) };
    }
    const pages = [four, ...Array.from({ length: Math.ceil(rest.length / this.room) },
      (_, i) => rest.slice(i * this.room, (i + 1) * this.room))];
    const at = ((page % pages.length) + pages.length) % pages.length, next = (at + 1) % pages.length;
    const more: Choice = { id: this.more, label: next ? 'Something else…' : 'Back to the first',
      tone: 'way', command: `focus:page:${next}`, note: `${next + 1} of ${pages.length}` };
    const hidden = this.marks(menu, pages.filter((_, i) => i !== at).flat());
    return { rows: [...pages[at]!, more], promoted: at ? 0 : four.length, page: { at, of: pages.length },
      marks: { ...this.marks(menu, pages[at]!), [more.id]: Object.values(hidden).flat() } };
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
}
