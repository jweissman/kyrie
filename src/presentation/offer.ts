import type { Candidate, Kind } from '../ui/promotion';
import type { Campaign } from '../campaign/campaign';
import { PlayerView } from './player-view';
import { Aspects } from './aspects';
import type { Aspect, Mark, Promoted } from './glance-types';

// The kinds of act a player is offered, few enough to read at a glance (the owner, 14 November: a taxonomy of ten or
// twelve, at most one of each promoted): speaking, fighting, doing something to someone or something, searching,
// going a way, setting out on a journey, lighting, waiting (or resting, or camping), caring for the company (eating,
// tending), studying, and anything else.
export type ActType = 'talk' | 'fight' | 'act' | 'search' | 'go' | 'journey' | 'light' | 'wait' | 'care' | 'study'
  | 'other';
// One choice offered: the page's own id for it, the command it does, its words, its type, what it is to the company
// (its aspects, as Emphasis draws them; gold only where it continues the aim followed), and what it risks.
// for: of an opener (a talk), what it is led for within it (Promoted.for), which a headless player does by it.
export interface Offered {
  choice: string; command?: string; for?: string; label: string; type: ActType; aspects: Aspect[]; marks: Mark[];
  continues?: true; minutes?: number;
}
// What a surface offers: exactly four primary choices where there are four or more to be had (never filler where
// there are fewer), and every other one in the rest, kept for one deliberate step further (all, More, a lens).
export interface Offer { primary: Offered[]; rest: Offered[] }

// One attention hierarchy for every surface and both clients (the owner, 14 November: four promoted everywhere, the
// rest reachable, the terminal and the page agreeing on which four and what they mean). The scene's four are the acts
// the place leads with for their reasons (Promotion.pick: the urgent, the aim, the company's needs, the place's own),
// then, to make four, its leading way and the best of the rest by the scene's order, each of a type not yet shown, so
// that the four are four different things to do. A surface of its own (creation's cards, a talk's questions, a
// fight's hand) ranks its own, and is offered the same way (see Offers.ranked).
export class Offers {
  static readonly four = 4;
  static readonly types: Record<Kind, ActType> = { talk: 'talk', attack: 'fight', act: 'act', search: 'search',
    way: 'go', step: 'go', travel: 'journey', light: 'light', wait: 'wait', rest: 'wait', camp: 'wait', eat: 'care',
    tend: 'care', study: 'study', other: 'other' };
  static scene(acts: Promoted[], ways: string[], cands: Candidate[], campaign?: Campaign): Offer {
    const live = [...cands.filter(c => !c.barred), ...this.besides(cands, campaign)];
    const byChoice = new Map(live.map(c => [c.choice, c]));
    const led = acts.map(a => this.promoted(a, byChoice.get(a.choice)));
    const shown = new Set(led.map(o => o.choice)), types = new Set(led.map(o => o.type));
    // Then the leading way, then the rest in the scene's order: each of a type the four do not yet hold.
    const order = [...ways.flatMap(w => byChoice.get(w) ?? []), ...[...live].sort((a, b) => a.order - b.order)];
    const fill: Offered[] = [];
    // Of a kind not yet shown first; and where the scene has fewer than four kinds, the next of any (four waits in a
    // bare loft are four choices, not one).
    for (const distinct of [true, false]) {
      for (const c of order) {
        if (led.length + fill.length >= this.four) { break; }
        const type = this.types[c.kind];
        if (shown.has(c.choice) || (distinct && types.has(type))) { continue; }
        fill.push(this.candidate(c)); shown.add(c.choice); types.add(type);
      }
    }
    const primary = [...led, ...fill];
    return { primary, rest: live.filter(c => !shown.has(c.choice))
      .sort((a, b) => this.rank(a) - this.rank(b) || a.order - b.order).map(c => this.candidate(c)) };
  }
  // Every other legal choice of the scene, which the page reaches through its likenesses and lenses rather than as an
  // act (talking to whoever is here, setting a thing down, lighting a torch by day): kept in the rest, by the kind of
  // its action, so that nothing the company can do is out of reach (and the terminal, which draws no likeness, can
  // offer talk among the four).
  private static besides(cands: Candidate[], campaign?: Campaign): Candidate[] {
    if (!campaign) { return []; }
    const had = new Set(cands.flatMap(c => [c.choice, c.command, ...Object.values(c.leaves ?? {})]));
    return PlayerView.choices(campaign).filter(r => !had.has(r.choice.id))
      .map((r, i) => ({ choice: r.choice.id, command: r.choice.id, label: r.choice.name,
        kind: this.kind(r.action.schema), whys: [], order: cands.length + i, marks: [] }));
  }
  // The rest in an order by what each is, the scene's own order within: talk and ways and what is done here before
  // the company's own gear (setting a thing down, giving it across, packing it), which a town's rest had led with
  // (TP-06: 60 rows at the a1 camp, the terminal line's "junk drawer").
  static readonly ranks: readonly ActType[] = ['talk', 'go', 'journey', 'search', 'act', 'study', 'fight', 'light',
    'care', 'wait', 'other'];
  private static rank(c: Candidate): number { return this.ranks.indexOf(this.types[c.kind]); }
  private static readonly gear = new Set(['put_item', 'put_in', 'transfer_item', 'equip_item', 'douse_light']);
  private static kind(schema: string | undefined): Kind {
    const s = schema ?? '';
    if (this.gear.has(s)) { return 'other'; }
    return s === 'talk_to' ? 'talk' : s === 'attack' ? 'attack' : s.startsWith('wait') ? 'wait'
      : /^(camp|rest)/.test(s) ? 'rest' : s === 'search' ? 'search' : s === 'eat' ? 'eat' : /light|kindle/.test(s) ? 'light'
        : /^(go|travel|walk|enter|leave|climb|descend)/.test(s) ? 'way' : 'act';
  }
  // The journey set out on, at the head of the four (see Glance.held): what it put out of the four goes to the rest.
  static headed(offer: Offer, bound: Promoted): Offer {
    const head: Offered = { ...this.promoted(bound, undefined), type: 'journey' };
    const all = [head, ...offer.primary.filter(o => o.choice !== bound.choice)];
    return { primary: all.slice(0, this.four),
      rest: [...all.slice(this.four), ...offer.rest.filter(o => o.choice !== bound.choice)] };
  }
  // A surface's own choices, ranked by it best first: the first four, and the rest as they came.
  static ranked<T>(ranked: T[], offered: (t: T) => Offered): Offer {
    return { primary: ranked.slice(0, this.four).map(t => offered(t)),
      rest: ranked.slice(this.four).map(t => offered(t)) };
  }
  private static promoted(a: Promoted, c: Candidate | undefined): Offered {
    return { choice: a.choice, ...a.command ? { command: a.command } : {}, ...a.for ? { for: a.for } : {},
      label: a.label,
      type: c ? this.types[c.kind] : 'other', aspects: a.aspects, marks: a.marks, ...a.continues ? { continues: true } : {},
      ...c?.minutes ? { minutes: c.minutes } : {} };
  }
  // A choice offered for no reason the place leads with: what it is to the company is its reasons' aspects, the aim's
  // gold aside (gold is only the followed aim's next step, which is among the acts).
  private static candidate(c: Candidate): Offered {
    return { choice: c.choice, ...c.command ? { command: c.command } : {}, label: c.label, type: this.types[c.kind],
      aspects: Aspects.of(c.whys, c.marks).filter(a => a !== 'undertaking'), marks: c.marks,
      ...c.minutes ? { minutes: c.minutes } : {} };
  }
}
