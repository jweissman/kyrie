import { ChoiceList, type Choice } from '../ui/choice-list';
import type { Act, Screen } from '../ui/screen-types';
import { Attending } from '../ui/attention';
import { SceneModel } from '../ui/scene';
import { Attest, type Witness } from './attest';
import type { Aspect, Glance, Lens, Promoted } from './glance-types';
import { Fold } from './fold';
import { DoableJourneys } from './doable-journeys';

// One resolution from the engine's offer to rows that can be done (mission-22/doable-design.md, TB-12): what each
// offered choice is, what taking it does, and what it opens, read once from the scene the page draws its menu from
// (SceneModel, Attending.place), so that no client reads a row for itself. A row with a command does it; an opener
// does nothing of its own: taken, it opens, its rows first the one the engine leads it for (Promoted.for, inside).
// Its indicator is its witnesses (Attest), as the page draws it.
// for: what the engine leads it for within it (the question the aim waits on, under a talk), where it does: the four
// are led with that, as the page draws it (Promoted.inside, TB-01). only: an opener with one thing to do under it,
// which is that thing (its words the thing's own; a client that knows the act's full words says those). says: what
// opening it reads out, whole, before its rows (a riddle on a door, its rows the answers: Choice.focus, CL-34).
// called: what a row led for an act within it is called where that act's own words would not do (see called).
export interface Row {
  id: string; label: string; does?: string; opens?: Row[]; for?: string; lens?: Lens; led?: true; only?: true;
  says?: string; called?: string; witnesses: Witness[];
  // Its words drawn under what holds it, where those are shorter than its own (a topic under its person's talk, "Ask
  // about her work" for "Ask Sabine about her work"; an act under its thing in the pack, "Light" for "Light a torch"):
  // the engine's, so that a client drawing it there says the engine's words, not its own (MT-18).
  short?: string;
  // The row it is held under, where the scene holds it under another (a question under its person's talk): every
  // client draws it there, the engine saying so (MT-18; the runner and the page had each grouped asks their own way).
  within?: string;
  // What a person's talk holds: the rows within it, in the engine's order (mt18-grouping.md, step 2).
  holds?: string[];
  // Why it cannot be done now (Choice.disabled): a row that neither does nor opens anything says why.
  shut?: string;
  // A journey set out on from the map, not drawn in the rest (DoableJourneys: JourneyFold's, the runner's alone till
  // MT-18).
  map?: true;
  // How long a journey the scene's offer left out takes (DoableJourneys), as its row says.
  minutes?: number;
  // Where a row led with across the country opens the map (DoableJourneys.mapped): it does view:map:<place>, and the
  // journey there is set out on from the map, by its own row.
  chart?: string;
}
type Offered = Pick<Glance, 'acts' | 'lenses' | 'offer' | 'likenesses' | 'sensed' | 'following' | 'lead'>
  & Partial<Pick<Glance, 'compass'>>;
interface Read { tree: Map<string, Choice>; parents?: Map<string, string>; acts: Map<string, Promoted>; glance: Offered;
  // The scene's choices by the command each does: a row offered by its command finds there its words under its holder.
  commands?: Map<string, Choice>;
  // The pack's words for what is done with a thing carried, by command ("Light" under the torch), and a talk's for
  // taking leave ("Take your leave"): a row's short there.
  packed?: Map<string, string>;
  lens?: Lens; led?: boolean; opening?: boolean;
  command?: string; legal?: Set<string> }
interface Kept { rows: Row[]; at: Omit<Read, 'lens' | 'led' | 'command'>; lensOf: Map<string, Lens> }

export class Doable {
  private static readonly kept = new WeakMap<object, Kept>();
  // The offer's rows, the four first: from the glance and the screen it was drawn for.
  static of(glance: Offered, screen: Screen): Row[] { return this.read(glance, screen).rows; }
  // Any choice of the scene as a row, offered or not (an act the glance leads with that the offer leaves out, an act a
  // lens holds within an opener).
  // One the four lead with across the country is the map's row for it (DoableJourneys: chart).
  static one(glance: Offered, screen: Screen, id: string, command?: string): Row {
    const charted = this.read(glance, screen).rows.find(r => r.chart && r.id === DoableJourneys.id(id));
    return charted ?? this.rowOf(glance, screen, id, { command });
  }
  private static rowOf(glance: Offered, screen: Screen, id: string, as: { command?: string; label?: string }): Row {
    const { at, lensOf } = this.read(glance, screen), lens = lensOf.get(id);
    return this.row(id, at.tree.get(id)?.label ?? as.label ?? id,
      { ...at, ...lens ? { lens } : {}, command: as.command });
  }
  // A row the page's menu holds no choice for (a talk it draws by a likeness, a lens's act inside an opener not
  // opened), as a choice to be drawn and taken: made of the row made here (made: worded, doing what is offered), never
  // of the page's own; one refused is none, and is not drawn (AT-07 I3, step 4).
  static choice(glance: Offered, screen: Screen, id: string, at: { command?: string; label: string; shut?: string }):
    Choice | undefined {
    const row = this.valid(glance, screen, id, at);
    const shut = row?.shut ?? at.shut;
    return row?.does || shut ? { id: row!.id, label: row!.called ?? row!.label, tone: 'thing',
      ...row!.does ? { command: row!.does } : {}, ...shut ? { disabled: shut } : {} } : undefined;
  }
  private static valid(glance: Offered, screen: Screen, id: string, at: { command?: string; label: string }):
    Row | undefined {
    try { return this.rowOf(glance, screen, id, at); } catch { return undefined; }
  }
  // What a row bears, as every client draws it: the fold of its leaves (Fold.of, an opener by its rows), the aim's
  // gold aside (only the four carry it). The terminal colours its rest by this, as the page does (AT-07 step 4).
  static borne(glance: Offered, screen: Screen, id: string): Aspect[] {
    const leaves = Fold.of(glance, this.read(glance, screen).at.tree.get(id), id, false);
    return [...new Set(leaves.flatMap(l => l.witnesses.flatMap(w => w.aspects)))];
  }
  // Every row, an opener's within it after it.
  static flat(rows: readonly Row[]): Row[] { return rows.flatMap(r => [r, ...this.flat(r.opens ?? [])]); }
  private static read(glance: Offered, screen: Screen): Kept {
    const kept = this.kept.get(glance);
    if (kept) { return kept; }
    const built = SceneModel.build(screen), scene = Attending.place(built), tree = new Map<string, Choice>();
    const parents = new Map<string, string>();
    this.index(tree, [...scene.subjects.flatMap(s => s.choices), ...scene.near, ...scene.far, ...scene.you], parents);
    const lensOf = new Map<string, Lens>(Object.entries(glance.lenses ?? {}).flatMap(([lens, l]) =>
      [...l.promoted.map(p => p.choice), ...l.rest.map(r => r.choice)].map(id => [id, lens as Lens] as const)));
    const acts = new Map(glance.acts.map(a => [a.choice, a]));
    this.whose(screen, glance, parents);
    const commands = new Map([...tree.values()].flatMap(c => c.command ? [[c.command, c] as const] : []).reverse());
    const at = { tree, parents, acts, glance, legal: this.legal(glance, tree), commands,
      packed: this.packed(screen, built) };
    const led = new Set((glance.offer?.primary ?? []).map(o => o.choice));
    // Not a talk with someone who has nothing to be said to them but goodbye, in the rest: they are there, not someone
    // to talk to (Attending.place, the owner, 9 November), where the offer had still offered it and the runner drawn
    // it ("Talk to Dannel Hobb" at the taproom, and the page had not: the parity measure's page engine only, MT-18).
    const mute = new Set(scene.subjects.filter(x => x.kind === 'person' && !x.choices.length).map(x => `talk_to(${x.id})`));
    const listed = [...glance.offer?.primary ?? [], ...(glance.offer?.rest ?? [])
      .filter(o => !mute.has(o.command ?? o.choice) && !this.another(o.command ?? o.choice, screen, commands)
        && !this.folded(o.command ?? o.choice, commands))];
    // And what a lens holds within an opener that the offer leaves out (a person's questions under their talk, the
    // people lens's): the engine offers them, so every client does, within their holder (MT-18: the page's menu and
    // serve had offered them, the runner not).
    const had = new Set(listed.flatMap(o => [o.choice, ...o.command ? [o.command] : []]));
    const held = Object.entries(glance.lenses ?? {}).flatMap(([lens, l]) => Object.values(l.leaves ?? {}).flat()
      .filter(a => !had.has(a.choice) && !(a.command && had.has(a.command)) && parents.has(a.choice))
      .map(a => ({ ...a, lens: lens as Lens })));
    const offered = this.holders([...listed.map(o => this.row(o.choice, o.label, { ...at, lens: lensOf.get(o.choice),
      led: led.has(o.choice), command: o.command })), ...[...new Map(held.map(a => [a.choice, a])).values()]
      .map(a => this.row(a.choice, a.label, { ...at, lens: a.lens, led: false, command: a.command })),
      ...this.ledFor(glance, at, had)], at);
    const out = glance.compass?.out, journeys = DoableJourneys.more(this.flat(offered), screen, out)
      .map(j => ({ ...this.row(j.command, j.label, { ...at, command: j.command }), minutes: j.minutes }));
    const rows = DoableJourneys.mapped([...offered, ...journeys], screen, out);
    const read = { rows, at, lensOf };
    this.kept.set(glance, read);
    return read;
  }
  // What a talk is led for that is no row of its own (an act done with them: Ianto's boat, poled down the cut), a row
  // within their talk, so that turned to them it is among what is had of them: the aim's step had been gold on "Talk to
  // Ianto" and then, turned to him, nowhere among what was said to him (CL-33, the golden route's fuel boat).
  private static ledFor(glance: Offered, at: Kept['at'] & { commands: Map<string, Choice> }, had: Set<string>): Row[] {
    const talks = glance.acts.flatMap(a => /#talk$/.test(a.choice)
      ? (a.inside ?? []).map(i => ({ talk: a.choice, cmd: i.command })) : []);
    return talks.filter(x => !had.has(x.cmd) && at.commands.has(x.cmd)).map(x => {
      const c = at.commands.get(x.cmd)!;
      return { ...this.row(c.id, c.label, { ...at, led: false, command: x.cmd }), within: x.talk };
    });
  }
  // Each row a person's acts are within, offered (mt18-grouping.md, steps 1 and 2): their talk drawn from the scene
  // where the turn's offer left it out, holding the ids of what is within it; an act whose holder the scene has not
  // stands on its own (Ianto's boat at the staithe had been folded under a talk no client drew).
  private static holders(rows: Row[], at: Read): Row[] {
    const ids = new Set(this.flat(rows).map(r => r.id));
    const wanted = [...new Set(rows.flatMap(r => r.within && !ids.has(r.within) ? [r.within] : []))];
    // A holder made here is the talk itself, never led for a question within it (that question is its own row).
    const plain = { ...at, acts: new Map<string, Promoted>(), led: false };
    const made = wanted.flatMap(id => at.tree.has(id) ? [this.row(id, at.tree.get(id)!.label, plain)] : []);
    const all = [...rows, ...made], drawn = new Set(all.map(r => r.id));
    return all.map(r => {
      const holds = all.filter(k => k.within === r.id).map(k => k.id);
      const kept = r.within && !drawn.has(r.within) ? this.loose(r) : r;
      return holds.length ? { ...kept, holds } : kept;
    });
  }
  private static loose(r: Row): Row {
    const out = { ...r };
    delete out.within;
    return out;
  }
  // A telling of the lands beyond the scene has folded into its one question (NewsFold: the next not yet heard), which
  // the offer still lists by itself: the scene's one is the engine's row, not each (int-mat5's CI: the parity measure
  // at Porthalen's taproom, the lands under Kynes's Talk now folded too).
  private static folded(command: string, commands: Map<string, Choice>): boolean {
    return /_beyond_told_/.test(command) && !commands.has(command);
  }
  // The same act for another of the company, where the scene offers it for the one it is (gather, take, buy "for
  // Carlin" beside "for Wenna"): the scene and the page offer the one, what is had then given in the pack, and the
  // offer had offered both, so that the runner drew each twice (the parity measure's page engine only, MT-18).
  private static another(command: string, screen: Screen, commands: Map<string, Choice>): boolean {
    const m = /^(\w+\(.*),([^,()]+)\)$/.exec(command), members = new Set(screen.party.flatMap(p => p.ref ?? []));
    if (!m || commands.has(command) || !members.has(m[2]!)) { return false; }
    return [...members].some(id => id !== m[2] && commands.has(`${m[1]},${id})`));
  }
  // What is done with each thing carried, in the pack's words under it, by command (ChoiceList.pack); and taking
  // leave of someone, in their talk's (Attending.talk).
  private static packed(screen: Screen, scene: ReturnType<typeof SceneModel.build>): Map<string, string> {
    const leave = scene.subjects.flatMap(x => Attending.talk(scene, x.id)?.leave ?? []).filter(c => c.command);
    return new Map([...this.leaves(ChoiceList.pack(screen).flatMap(s => s.choices)), ...leave]
      .map(c => [c.command!, c.label]));
  }
  private static leaves(cs: Choice[]): Choice[] {
    return cs.flatMap(c => [...c.command ? [c] : [], ...this.leaves(c.children ?? [])]);
  }
  // The commands a row may do: a choice's of the scene, or one the glance offers by its command (a light, a wait, a
  // journey), or a book's (view:).
  private static legal(glance: Offered, tree: Map<string, Choice>): Set<string> {
    return new Set([...[...tree.values()].flatMap(c => c.command ?? []), ...glance.acts.flatMap(a => a.command ?? []),
      ...[...glance.offer?.primary ?? [], ...glance.offer?.rest ?? []].flatMap(o => o.command ?? []),
      ...Object.values(glance.lenses ?? {}).flatMap(l => [...l.promoted, ...l.rest]).flatMap(a => a.command ?? [])]);
  }
  // The one way a row is made (AT-07 I3): it has words; what it does is a command the engine offers; and a row that
  // neither does nor opens anything says why it cannot be done. Anything else is refused here, never drawn blank or
  // inert (the owner's playtest, 19 November, AT-04: a row with no words that went back to the landing).
  static made(r: Row, legal: ReadonlySet<string>): Row {
    // Words a player can read, and so what it is called among the four (Worded; the owner's P0 of 20 November).
    if (![r.label, ...r.called !== undefined ? [r.called] : []].every(w => /[\p{L}\p{N}]/u.test(w))) {
      throw new Error(`Doable: ${r.id} (${r.does ?? 'opens'}) has no words, at Doable.made`);
    }
    if (r.does && !legal.has(r.does) && !/^(travel|view):/.test(r.does)) {
      throw new Error(`Doable: ${r.id} does ${r.does}, which nothing here offers`);
    }
    if (!r.does && !r.opens?.length && !r.shut) {
      throw new Error(`Doable: ${r.id} does nothing, opens nothing, and says nothing of why`);
    }
    return r;
  }
  // Whose each act done with one of the people here is, held within their talk (<person>#talk): their own acts as the
  // screen holds them under them, and a word asked of them (ask(informant, topic)) where the screen holds it apart
  // (MT-18: the runner had worked this out for itself, RunnerTalks.whose; the page draws it in its talk).
  private static whose(screen: Screen, glance: Offered, parents: Map<string, string>): void {
    const here = screen.people.filter(p => p.kind === 'person' && !p.state);
    for (const p of here) {
      for (const a of this.acts(p.acts)) {
        if (a.command && !parents.has(a.command) && a.does !== 'talk_to') { parents.set(a.command, `${p.id}#talk`); }
      }
    }
    const ids = new Set(here.map(p => p.id));
    for (const o of [...glance.offer?.primary ?? [], ...glance.offer?.rest ?? []]) {
      const id = o.command ?? o.choice, asked = /^ask\(([^,]+),/.exec(id)?.[1];
      if (asked && ids.has(asked) && !parents.has(id)) { parents.set(id, `${asked}#talk`); }
    }
  }
  private static acts(acts: Act[]): Act[] { return acts.flatMap(a => [a, ...this.acts(a.children ?? [])]); }
  private static index(tree: Map<string, Choice>, cs: Choice[], parents: Map<string, string>, parent?: string): void {
    for (const c of cs) {
      tree.set(c.id, c);
      if (parent) { parents.set(c.id, parent); }
      this.index(tree, c.children ?? [], parents, c.id);
    }
  }
  private static row(id: string, label: string, at: Read): Row {
    const c = at.tree.get(id), act = at.acts.get(id);
    const witnesses = [Attest.witness(at.glance, id), ...c ? Attest.within(at.glance, c) : []]
      .filter((w): w is Witness => !!w);
    // Not a look at a way barred, which opens onto its tries and is never done by the first of them, whatever inside
    // it bears what it is led for (CL-34; AT-07: the try now bears the look's 'worth a look').
    const led = act?.exit && !act.for ? undefined : act?.inside?.filter(i => !i.borne)[0]?.command ?? act?.for;
    // What it is led for, only where the four lead with it (a fifth led, kept in the rest, is the talk it is: MT-15).
    // A talk led for a question or an act of theirs is called by what it does (TB-01: it does that act), in the world's
    // whole words (LedWords), a stranger's by both, the talk first (CL-45): the act's words from within the talk, else
    // the scene's (MT-18: the runner had said them, the engine nothing).
    const within = led && at.led !== false && c && (act?.unmet || c.command?.startsWith('talk_to('))
      ? (Attending.all(c.children ?? []).find(k => k.command === led) ?? [...at.tree.values()]
        .find(k => k.command === led))?.label : undefined;
    const asked = within && (act?.unmet ? within : act?.words?.[led!] ?? within);
    const full = c?.alone || label, under = c ?? at.commands?.get(act?.command ?? at.command ?? id);
    const offered = act?.command ?? at.command, journey = offered?.startsWith('travel:') ? offered : undefined;
    const does = journey ?? (c ? c.command ?? act?.command : offered ?? id);
    const short = [under?.label, does && at.packed?.get(does)].find(w => w && w !== full && full.length > w.length);
    const base = { id, label: full, ...short ? { short } : {},
      witnesses, ...at.lens ? { lens: at.lens } : {},
      ...at.led ? { led: true as const } : {}, ...led && at.led !== false ? { for: led } : {},
      ...asked ? { called: act?.unmet ? this.called(c?.alone || (c?.label ?? label), asked) : asked } : {},
      ...c?.disabled ? { shut: c.disabled } : {}, ...at.parents?.get(id) && !at.opening
        ? { within: at.parents.get(id)! } : {} }, legal = at.legal ?? new Set<string>();
    const kids = c?.children ?? [];
    // A row with a command does it, even where acts hang under it (a way with a door to listen at is gone by).
    // One offered by its command, outside the scene's tree (a light, a set-down, a wait), does that command.
    // A way over into the next stretch of country is set out on as a journey there, as the engine offers it (travel:,
    // HexBoundary) and the page's map does: walked as a way, a cold play's journey had not been offered (cold play 4).
    if (c?.command || !kids.length) { return this.made({ ...base, ...does ? { does } : {} }, legal); }
    // An opener opens: what the engine leads it for first, then the rest in the scene's order.
    const first = new Set([act?.for, ...(act?.inside ?? []).map(i => i.command)].filter((x): x is string => !!x));
    const ordered = [...kids.filter(k => first.has(k.command ?? '')), ...kids.filter(k => !first.has(k.command ?? ''))];
    const opens = ordered.map(k => this.row(k.id, k.label, { ...at, led: false, command: undefined, opening: true }));
    // One with a single thing to do under it is that thing, called by its own words: there is nothing to choose in
    // opening it ("the sea-gate's pawl", gold at the gate-well, is collecting it: cold play 5, CL-33).
    const only = this.flat(opens).filter(r => !r.opens);
    const one = only.length === 1 ? only[0] : undefined;
    if (one?.does && !c?.focus) { return this.made({ ...base, label: one.label, does: one.does, only: true }, legal); }
    return this.made({ ...base, opens, ...c?.focus ? { says: c.focus } : {} }, legal);
  }
  // A talk led for a question to someone not yet met is talking to them, the question after it: "Ask the factor about
  // the king-barrow", led on the landing before anyone had said who the factor was, had asked a stranger by a title
  // (cold play 4, CL-45; cold play 5, CL-36: Gek). "Talk to the factor — ask about the king-barrow". Called by a
  // first name, never by an article: "the sellsword on the green" asked "Ask the sellsword what…" had been "— ask
  // sellsword what work she is after" (MT-15).
  // Whom the question names, by as much of the talk's name as it says ("Ask the sellsword what…" under "Talk to the
  // sellsword on the green"), never a bare article: said once, not twice (CL-45; foreground-browser at a1's camp).
  static called(talk: string, question: string): string {
    // A stranger met as "a drover's boy" is asked of as "the drover's boy".
    const words = /^Talk to (.+)$/.exec(talk)?.[1]?.split(' ') ?? [];
    const names = words.map((_, i) => words.slice(0, words.length - i).join(' '));
    const by = [...names, ...names.map(n => n.replace(/^an? /i, 'the '))]
      .find(w => !/^(the|a|an)$/i.test(w) && question.startsWith(`Ask ${w} `));
    return `${talk} — ${by ? `ask ${question.slice(`Ask ${by} `.length)}`
      : `${question.charAt(0).toLowerCase()}${question.slice(1)}`}`;
  }
  // What taking a row does at once, where it does anything: its command; an opener none (it opens).
  static does(rows: readonly Row[], id: string): string | undefined {
    for (const r of rows) {
      if (r.id === id) { return r.does; }
      const inner = r.opens && this.does(r.opens, id);
      if (inner) { return inner; }
    }
    return undefined;
  }
}
