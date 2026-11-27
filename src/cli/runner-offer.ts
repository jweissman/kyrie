import type { Screen } from '../ui/screen-types';
import type { Leaf } from '../presentation/narrator';
import type { Lens } from '../presentation/glance-types';
import { Offers, type Offered as Glanced } from '../presentation/offer';
import { Doable, type Row } from '../presentation/doable';
import { Typography } from '../presentation/typography';
import { RunnerTalks } from './runner-talks';
import type { Offered, Said } from './runner';
import { ChoiceWords } from '../ui/choice-words';
import { Leaving } from '../presentation/leaving';

// Where the runner keeps a row of the rest: the page's lenses, the place's own first; then the company's gear, and
// the journeys (twelve "Set out for…" had come before the place's things: cold play 5, CL-33).
export type Kept = Lens | 'gear' | 'journeys' | 'pack';
interface At { names: Map<string, string>; entries: Map<string, Glanced>; byDoes: Map<string, Glanced> }
type Glance = NonNullable<Leaf['glance']>;

// The runner's offer, read from Doable and nothing else (TB-12): what each row is and what taking it does. Its four
// as the page leads with them: one led for an act within it (asking Wenna to come along) as that act (TB-01); an
// opener with its rows under it, never done by its first (the speaking door's gold opener had been done as "Push and
// pull": cold play 5, CL-34). The rest an opener's rows each its own, by lens, every row by the command that does it.
export class RunnerOffer {
  static readonly order: Kept[] = ['things', 'people', 'places', 'time', 'gear', 'journeys'];
  // The offer, and every row it holds before the talks are folded (what can be asked for by its id).
  // journeys: every journey, those kept in the rest first; folded ones are under too (offered, as the page's map
  // offers them), and counted in the offer's more.
  // pack: what is done with the things carried, held in the pack (Row.pack), out of the rest as the journeys are.
  static of(screen: Screen, g: Leaf['glance'], names: Map<string, string>, talking?: string)
    : { offer: Said['offer']; under: Offered[]; journeys: Offered[]; pack: Offered[] } {
    const rows = g ? Doable.of(g, screen) : [], at = this.at(g, rows, names);
    const primary = rows.filter(r => r.led).flatMap(r => this.row(r, at));
    const lens = new Map<string, Lens>(), seen = new Set(this.flat(primary).map(o => o.does ?? o.id));
    // A row led with as the one thing it is led for (a talk drawn as its first question) holds more than that: its
    // other rows are offered too, as the page's drawer holds them. Kynes's bed and supper, under a talk led as a
    // question, had been offered nowhere, in the scene or in the talk (the reference journey's recovery, 24 Nov).
    const under = rows.filter(r => !r.led || (r.for && r.opens)).flatMap(r => this.leaves(r).flatMap(k => {
      const o = this.one(k, at, k === r ? at.entries.get(r.id) : undefined, at.entries.get(r.id));
      if (!o || seen.has(o.does ?? o.id)) { return []; }
      seen.add(o.does ?? o.id);
      if (k.lens) { lens.set(o.id, k.lens); }
      return [o];
    }));
    // The journeys are the engine's, those on the map folded out of the rest as it marks them (MT-18).
    const all = RunnerTalks.talks(screen, rows, under, talking);
    const mapped = new Set(Doable.flat(rows).flatMap(r => r.map && r.does ? [r.does] : []));
    const packed = new Set(Doable.flat(rows).flatMap(r => r.pack && r.does ? [r.does] : []));
    const folded = all.filter(o => mapped.has(o.does ?? '')), pack = all.filter(o => packed.has(o.does ?? ''));
    const rest = all.filter(o => !folded.includes(o) && !pack.includes(o));
    const grouped = this.grouped(rows, rest, { lens, talking });
    // The map's journeys are not counted: its row says no number (the owner, 25 November: "Why is the map sending
    // you a notification?"), and an ordinary turn lays none but the aim's (Itineraries.charted). The pack's are.
    const more = pack.length ? { pack: pack.length } : {};
    // What leaves last of all (Leaving: the engine's one rule): a way out the four led with is the rest's last.
    const ways = Leaving.ways(screen);
    return { offer: { primary: primary.filter(o => !Leaving.is(o, ways)), ...grouped,
      rest: Leaving.last([...grouped.rest, ...primary.filter(o => Leaving.is(o, ways))], o => Leaving.is(o, ways)),
      ...Object.keys(more).length ? { more } : {} },
      under: [...under, ...folded, ...pack], journeys: [...grouped.lenses.journeys ?? [], ...folded], pack };
  }
  // A lens's own acts, ranked as the scene's are, each as a row that can be done.
  static lensed(screen: Screen, g: Glance, names: Map<string, string>, lens: Lens): Said['offer'] {
    const l = g.lenses[lens], all = [...g.offer?.primary ?? [], ...g.offer?.rest ?? []];
    const at = this.at(g, Doable.of(g, screen), names);
    const ranked = Offers.ranked([...l.promoted, ...l.rest], a => all.find(o => o.choice === a.choice)
      ?? { choice: a.choice, ...a.command ? { command: a.command } : {}, label: a.label, type: 'other', aspects: [],
        marks: [] });
    return { primary: this.lensRows(screen, g, ranked.primary, at), rest: this.lensRows(screen, g, ranked.rest, at) };
  }
  // A lens's acts as rows, none led with what it is led for (only the four are: TB-01).
  private static lensRows(screen: Screen, g: Glance, os: Glanced[], at: At): Offered[] {
    return os.flatMap(o => this.row({ ...Doable.one(g, screen, o.choice, o.command), for: undefined }, at, o));
  }
  // What taking a row does: its command, which may be asked for in place of its id (Offered.does); an opener's id.
  static act(o: Offered): string { return o.does ?? o.id; }
  // Every row of an offer, an opener's under it.
  static flat(os: readonly Offered[]): Offered[] { return os.flatMap(o => [o, ...this.flat(o.opens ?? [])]); }
  private static at(g: Leaf['glance'], rows: Row[], names: Map<string, string>): At {
    const entries = new Map([...g?.offer?.primary ?? [], ...g?.offer?.rest ?? []].map(o => [o.choice, o]));
    const byDoes = new Map(rows.flatMap(r => r.does && entries.has(r.id) ? [[r.does, entries.get(r.id)!]] : []));
    return { names, entries, byDoes };
  }
  // A row led with: as what it is led for, as an opener with its rows, or as the act it does.
  // One opening the map at where it goes (Row.chart) is the offer's journey there, by the map's id.
  private static row(r: Row, at: At,
    entry: Glanced | undefined = at.entries.get(r.id) ?? at.entries.get(`travel:${r.chart}`)): Offered[] {
    if (r.for && at.names.has(r.for)) {
      return [this.made(r.id, r.called ?? at.names.get(r.for)!, entry, { does: r.for })];
    }
    if (!r.opens) { return [this.one(r, at, entry, entry)].flatMap(o => o ?? []); }
    const opens = this.leaves(r).flatMap(k => this.one(k, at, undefined, entry) ?? []);
    // A talk with no greeting of its own is turned to by the session's command (MenuTree.turning, OR-1451).
    const who = /^(.+)#talk$/.exec(r.id)?.[1], turn = who ? { does: `focus:talk:${who}` } : {};
    return opens.length ? [{ ...this.made(r.id, r.label, entry, turn), opens, ...r.says ? { says: r.says } : {} }] : [];
  }
  private static leaves(r: Row): Row[] { return r.opens ? r.opens.flatMap(k => this.leaves(k)) : [r]; }
  // A row done by its command (Doable makes none that does what nothing here offers: Doable.made, so none is
  // refused here; an aim to follow, follow:, had been, as no choice of the world's): called by the offer's words where
  // the offer has it, else by its choice's own ("Push and pull at the padlock"); its meaning the offer's, never its
  // opener's.
  private static one(r: Row, at: At, entry?: Glanced, opener?: Glanced): Offered | undefined {
    const id = r.does;
    if (!id) { return undefined; }
    // One that is an opener's one act is called by that act's whole words ("Ask the apprentice about the old drain").
    const whole = at.names.get(id), own = entry ?? at.byDoes.get(id);
    const label = r.only ? (whole && ChoiceWords.whole(whole)) ?? r.label
      : entry ? r.label : own?.label ?? at.names.get(id) ?? r.label;
    return { ...this.made(r.id, label, own, { does: id, minutes: r.minutes }),
      ...own || !opener ? {} : { type: opener.type }, ...r.note ? { note: Typography.plain(r.note) } : {} };
  }
  // A row by the engine's id, doing its command; a journey the scene's offer left out is the engine's row's own: a
  // journey, as long as the row says.
  private static made(id: string, label: string, o?: Glanced, as: { does?: string; minutes?: number } = {}): Offered {
    const minutes = o?.minutes ?? as.minutes;
    return { id, label: Typography.plain(label), ...as.does ? { does: as.does } : {}, aspects: o?.aspects ?? [],
      type: o?.type ?? (/^(travel|view:map):/.test(as.does ?? '') ? 'journey' : 'act'), ...minutes ? { minutes } : {},
      marks: o?.marks.map(m => m.kind) ?? [],
      ...o?.bearing ? { bearing: o.bearing } : {}, ...this.aside(o) };
  }
  // A fight that could be lost says so on its row, its odds and the help that can be had, as the page and the
  // terminal ask it before it is done (Grave): the runner had said only "danger" over a fight that killed (CL-52).
  private static aside(o?: Glanced): Pick<Offered, 'aside'> {
    const said = o?.marks.find(m => m.kind === 'fight' && m.ask)?.said;
    return said ? { aside: Typography.plain(`${said.charAt(0).toUpperCase()}${said.slice(1)}`) } : {};
  }
  // The rest by lens, in the order they are met (the one talked with first, CL-07), and flat in that order.
  private static grouped(rows: readonly Row[], rest: Offered[], at: { lens: Map<string, Lens>; talking?: string })
    : { rest: Offered[]; lenses: Partial<Record<Kept, Offered[]>> } {
    const whose = RunnerTalks.whose(rows);
    const order = at.talking ? ['people' as const, ...this.order.filter(k => k !== 'people')] : this.order;
    const lenses = order.map(k => [k, rest.filter(o => this.where(o, at.lens, whose) === k)] as const)
      .filter(([, os]) => os.length);
    return { rest: lenses.flatMap(([, os]) => os), lenses: Object.fromEntries(lenses) };
  }
  // The lens a row is kept in: the page's, else by what it is (a way out of the place by road is a journey).
  private static where(o: Offered, lens: Map<string, Lens>, whose: Map<string, string>): Kept {
    if (o.type === 'journey' || (o.type === 'go' && !lens.has(o.id))) { return 'journeys'; }
    return lens.get(o.id) ?? (o.type === 'talk' || whose.has(o.does ?? o.id) ? 'people' : o.type === 'wait' ? 'time'
      : o.type === 'light' || o.type === 'other' ? 'gear' : 'things');
  }
}
