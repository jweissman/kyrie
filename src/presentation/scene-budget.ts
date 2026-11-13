import { Sentences } from './sentences';

// What a scene tells at a glance, held to a budget (Mission 21: "a three-sentence initial narration budget, including
// sensory detail, without enforcing repetitive writing formulas"; the M20 retrospective's measurement: a town's heart
// told 442–663 words in 21–28 sentences before its four acts). A cap, not a template: it chooses which of the place's
// own sentences are told first and holds the rest for a deliberate look; it writes nothing.
//
// What is always told, whatever the budget: what has changed since the company was last here, and what bears on an
// aim it holds (a clue the place tells must never be the one held back). Then, up to the budget: the place's own first
// sentence (what it is), one sentence of its life now (who or what is about), and the place's next sentences in its
// own order. Each line is kept whole or held whole within its paragraph's order; nothing is cut mid-sentence.
//
// The kinds are the narrator's (Narrator.leaf): `standing` is the place's own telling (its first paragraph `lead`),
// `life` who and what is about, `changed` what is new since the last visit, `bearing` a clue: typed by what the
// observation is (SceneBudget.bears, from Observation.aspect and .teaches), never guessed from its words.
export type BudgetKind = 'lead' | 'standing' | 'life' | 'changed' | 'bearing';
// group: the paragraph a line is told in (several observations of one place run on as one paragraph); lines of one
// group are told, and held, joined again as the paragraph they came from.
export interface BudgetLine { text: string; kind: BudgetKind; group?: number }
export interface Budgeted {
  // Told now, as paragraphs in the order the place tells them.
  told: { text: string; kind: BudgetKind }[];
  // Held for a deliberate look, whole paragraphs or the rest of one, in order.
  held: string[];
  // Sentences counted against the budget, and those told regardless of it.
  counted: number; always: number;
}
interface Split extends BudgetLine { i: number; sentences: string[] }
interface Tally { keep: Map<number, number>; counted: number; budget: number }
export class SceneBudget {
  // The default budget (the owner, 12 November: a test that fails when scenes average more than three sentences).
  static readonly sentences = 3;
  static compose(lines: BudgetLine[], budget = SceneBudget.sentences): Budgeted {
    const split: Split[] = lines.map((l, i) => ({ ...l, i, sentences: Sentences.split(l.text) }));
    // Line index to how many of its sentences are told, from its start.
    const tally: Tally = { keep: new Map<number, number>(), counted: 0, budget };
    let always = 0;
    for (const l of split.filter(x => x.kind === 'changed' || x.kind === 'bearing')) {
      tally.keep.set(l.i, l.sentences.length); always += l.sentences.length;
    }
    const lead = split.find(l => l.kind === 'lead') ?? split.find(l => l.kind === 'standing');
    SceneBudget.take(tally, lead);
    SceneBudget.take(tally, split.find(l => l.kind === 'life'));
    // Then the place's own words in its order: the rest of the lead, then each further paragraph's first sentence.
    SceneBudget.take(tally, lead, budget);
    for (const l of split.filter(x => x.kind === 'standing' && x !== lead)) { SceneBudget.take(tally, l); }
    const told: (Budgeted['told'][number] & { group?: number })[] = [], held: { text: string; group?: number }[] = [];
    for (const l of split) {
      const n = tally.keep.get(l.i) ?? 0, group = l.group === undefined ? {} : { group: l.group };
      if (n > 0) { SceneBudget.join(told, { text: l.sentences.slice(0, n).join(' '), kind: l.kind, ...group }); }
      if (n < l.sentences.length) { SceneBudget.join(held, { text: l.sentences.slice(n).join(' '), ...group }); }
    }
    return { told: told.map(({ text, kind }) => ({ text, kind })), held: held.map(h => h.text), counted: tally.counted,
      always };
  }
  // A line joined to the one before it where both are of one paragraph, else a paragraph of its own.
  private static join<T extends { text: string; group?: number }>(list: T[], item: T) {
    const prior = list.at(-1);
    if (prior && item.group !== undefined && prior.group === item.group) { prior.text = `${prior.text} ${item.text}`; }
    else { list.push(item); }
  }
  // Up to n more of a line's sentences told, as far as the budget allows.
  private static take(tally: Tally, l: Split | undefined, n = 1) {
    if (!l || tally.counted >= tally.budget) { return; }
    const had = tally.keep.get(l.i) ?? 0, more = Math.min(n, l.sentences.length - had, tally.budget - tally.counted);
    if (more > 0) { tally.keep.set(l.i, had + more); tally.counted += more; }
  }
  // The narrator's telling, typed by what each observation is (never by its words), one observation at a time though
  // several run on as a paragraph: one that is a sign, a revelation, a reading or hearsay, or that teaches something
  // and is not the place's own standing look (a fixture, a feature, its weather or ambience: a town's history, which
  // a deliberate look keeps), bears on what the company may come to know and is told whole; what was seen on coming
  // here and is gone already is told as what changed; who and what is about is the place's life. arrival: the
  // sentences what came of coming here has told already, which the place's own telling gives way to (never below its
  // first sentence).
  static readonly bearing: ReadonlySet<string> = new Set(['sign', 'revelation', 'reading', 'hearsay']);
  static readonly standing: ReadonlySet<string> = new Set(['fixture', 'feature', 'weather', 'ambience']);
  static bears(f: { teaches?: string; aspect?: string }): boolean {
    return SceneBudget.bearing.has(f.aspect ?? '') || (!!f.teaches && !SceneBudget.standing.has(f.aspect ?? ''));
  }
  static typed(paragraphs: { parts: { text: string; teaches?: string; aspect?: string }[] }[], presence: string[],
    gone: string[], arrival = 0): Budgeted {
    const lines: BudgetLine[] = [...paragraphs.flatMap((p, group) => p.parts.map((part, j): BudgetLine => ({
      text: part.text, group, kind: SceneBudget.bears(part) ? 'bearing' : group === 0 && j === 0 ? 'lead' : 'standing' }))),
    ...gone.map((text): BudgetLine => ({ text, kind: 'changed' })), ...presence.map((text): BudgetLine => ({ text, kind: 'life' }))];
    // What is told regardless (a clue, what changed, what came of coming here) counts against the three; the place's
    // own first sentence is told whatever (the bell gone from its frame, four sentences, had made the landing seven).
    const always = lines.filter(l => l.kind === 'bearing' || l.kind === 'changed')
      .reduce((n, l) => n + SceneBudget.count(l.text), 0);
    const lead = lines.some(l => l.kind === 'lead') ? 1 : 0;
    return SceneBudget.compose(lines, Math.max(lead, SceneBudget.sentences - arrival - always));
  }
  // Sentences in a text, as the scene budget's spec counts them (test/scene-sentence-budget).
  static count(text: string): number { return Sentences.split(text).length; }
}
