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
// `life` who and what is about, `changed` what is new since the last visit, `bearing` what an aim bears on. Today the
// reader infers `bearing` from names (Told.ranked); the typed source is the observation's own facets (Observation
// .teaches, .about, .aspect), which the leaf does not yet carry to the page (see the proposal's integration plan).
export type BudgetKind = 'lead' | 'standing' | 'life' | 'changed' | 'bearing';
export interface BudgetLine { text: string; kind: BudgetKind }
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
    const told: Budgeted['told'] = [], held: string[] = [];
    for (const l of split) {
      const n = tally.keep.get(l.i) ?? 0;
      if (n > 0) { told.push({ text: l.sentences.slice(0, n).join(' '), kind: l.kind }); }
      if (n < l.sentences.length) { held.push(l.sentences.slice(n).join(' ')); }
    }
    return { told, held, counted: tally.counted, always };
  }
  // Up to n more of a line's sentences told, as far as the budget allows.
  private static take(tally: Tally, l: Split | undefined, n = 1) {
    if (!l || tally.counted >= tally.budget) { return; }
    const had = tally.keep.get(l.i) ?? 0, more = Math.min(n, l.sentences.length - had, tally.budget - tally.counted);
    if (more > 0) { tally.keep.set(l.i, had + more); tally.counted += more; }
  }
  // Sentences in a text, as the scene budget's spec counts them (test/scene-sentence-budget).
  static count(text: string): number { return Sentences.split(text).length; }
}
