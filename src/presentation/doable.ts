import type { Choice } from '../ui/choice-list';
import type { Screen } from '../ui/screen-types';
import { Attending } from '../ui/attention';
import { SceneModel } from '../ui/scene';
import { Attest, type Witness } from './attest';
import type { Glance, Lens, Promoted } from './glance-types';

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
  // Why it cannot be done now (Choice.disabled): a row that neither does nor opens anything says why.
  shut?: string;
}
type Offered = Pick<Glance, 'acts' | 'lenses' | 'offer' | 'likenesses' | 'sensed' | 'following' | 'lead'>;
interface Read { tree: Map<string, Choice>; acts: Map<string, Promoted>; glance: Offered; lens?: Lens; led?: boolean;
  command?: string; legal?: Set<string> }
interface Kept { rows: Row[]; at: Omit<Read, 'lens' | 'led' | 'command'>; lensOf: Map<string, Lens> }

export class Doable {
  private static readonly kept = new WeakMap<object, Kept>();
  // The offer's rows, the four first: from the glance and the screen it was drawn for.
  static of(glance: Offered, screen: Screen): Row[] { return this.read(glance, screen).rows; }
  // Any choice of the scene as a row, offered or not (an act the glance leads with that the offer leaves out, an act a
  // lens holds within an opener).
  static one(glance: Offered, screen: Screen, id: string, command?: string): Row {
    return this.rowOf(glance, screen, id, { command });
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
  // Every row, an opener's within it after it.
  static flat(rows: readonly Row[]): Row[] { return rows.flatMap(r => [r, ...this.flat(r.opens ?? [])]); }
  private static read(glance: Offered, screen: Screen): Kept {
    const kept = this.kept.get(glance);
    if (kept) { return kept; }
    const scene = Attending.place(SceneModel.build(screen)), tree = new Map<string, Choice>();
    this.index(tree, [...scene.subjects.flatMap(s => s.choices), ...scene.near, ...scene.far, ...scene.you]);
    const lensOf = new Map<string, Lens>(Object.entries(glance.lenses ?? {}).flatMap(([lens, l]) =>
      [...l.promoted.map(p => p.choice), ...l.rest.map(r => r.choice)].map(id => [id, lens as Lens] as const)));
    const acts = new Map(glance.acts.map(a => [a.choice, a]));
    const at = { tree, acts, glance, legal: this.legal(glance, tree) };
    const led = new Set((glance.offer?.primary ?? []).map(o => o.choice));
    const rows = [...glance.offer?.primary ?? [], ...glance.offer?.rest ?? []].map(o => this.row(o.choice, o.label,
      { ...at, lens: lensOf.get(o.choice), led: led.has(o.choice), command: o.command }));
    const read = { rows, at, lensOf };
    this.kept.set(glance, read);
    return read;
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
    if (!r.label.trim()) { throw new Error(`Doable: ${r.id} has no words`); }
    if (r.does && !legal.has(r.does) && !/^(travel|view):/.test(r.does)) {
      throw new Error(`Doable: ${r.id} does ${r.does}, which nothing here offers`);
    }
    if (!r.does && !r.opens?.length && !r.shut) {
      throw new Error(`Doable: ${r.id} does nothing, opens nothing, and says nothing of why`);
    }
    return r;
  }
  private static index(tree: Map<string, Choice>, cs: Choice[]): void {
    for (const c of cs) { tree.set(c.id, c); this.index(tree, c.children ?? []); }
  }
  private static row(id: string, label: string, at: Read): Row {
    const c = at.tree.get(id), act = at.acts.get(id);
    const witnesses = [Attest.witness(at.glance, id), ...c ? Attest.within(at.glance, c) : []]
      .filter((w): w is Witness => !!w);
    // Not a look at a way barred, which opens onto its tries and is never done by the first of them, whatever inside
    // it bears what it is led for (CL-34; AT-07: the try now bears the look's 'worth a look').
    const led = act?.exit && !act.for ? undefined : act?.inside?.filter(i => !i.borne)[0]?.command ?? act?.for;
    const asked = act?.unmet && led && c
      ? Attending.all(c.children ?? []).find(k => k.command === led)?.label : undefined;
    const base = { id, label: c?.alone ?? label, witnesses, ...at.lens ? { lens: at.lens } : {},
      ...at.led ? { led: true as const } : {}, ...led ? { for: led } : {},
      ...asked ? { called: this.called(c?.alone ?? c?.label ?? label, asked) } : {},
      ...c?.disabled ? { shut: c.disabled } : {} }, legal = at.legal ?? new Set<string>();
    const kids = c?.children ?? [];
    // A row with a command does it, even where acts hang under it (a way with a door to listen at is gone by).
    // One offered by its command, outside the scene's tree (a light, a set-down, a wait), does that command.
    // A way over into the next stretch of country is set out on as a journey there, as the engine offers it (travel:,
    // HexBoundary) and the page's map does: walked as a way, a cold play's journey had not been offered (cold play 4).
    const offered = act?.command ?? at.command, journey = offered?.startsWith('travel:') ? offered : undefined;
    const does = journey ?? (c ? c.command ?? act?.command : offered ?? id);
    if (c?.command || !kids.length) { return this.made({ ...base, ...does ? { does } : {} }, legal); }
    // An opener opens: what the engine leads it for first, then the rest in the scene's order.
    const first = new Set([act?.for, ...(act?.inside ?? []).map(i => i.command)].filter((x): x is string => !!x));
    const ordered = [...kids.filter(k => first.has(k.command ?? '')), ...kids.filter(k => !first.has(k.command ?? ''))];
    const opens = ordered.map(k => this.row(k.id, k.label, { ...at, led: false, command: undefined }));
    // One with a single thing to do under it is that thing, called by its own words: there is nothing to choose in
    // opening it ("the sea-gate's pawl", gold at the gate-well, is collecting it: cold play 5, CL-33).
    const only = this.flat(opens).filter(r => !r.opens);
    const one = only.length === 1 ? only[0] : undefined;
    if (one?.does && !c?.focus) { return this.made({ ...base, label: one.label, does: one.does, only: true }, legal); }
    return this.made({ ...base, opens, ...c?.focus ? { says: c.focus } : {} }, legal);
  }
  // A talk led for a question to someone not yet met is talking to them, the question after it: "Ask the factor about
  // the king-barrow", led on the landing before anyone had said who the factor was, had asked a stranger by a title
  // (cold play 4, CL-45; cold play 5, CL-36: Gek). "Talk to the factor — ask about the king-barrow".
  static called(talk: string, question: string): string {
    const whom = /^Talk to (.+)$/.exec(talk)?.[1], by = [whom, whom?.split(' ')[0]].find(w => w
      && question.startsWith(`Ask ${w} `));
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
