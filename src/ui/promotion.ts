import type { Facet, Mark, Promoted, Tier, Why } from '../presentation/glance-types';
import { Aspects } from '../presentation/aspects';

// What a choice is, as far as leading with it goes: talking to someone, an act on someone or something, an attack, a
// way (a step across the open country apart), a journey about the town, lighting a light, waiting, studying (preparing
// spells, spending a level), searching, camping, resting, eating, tending, or anything else the company does.
export type Kind = 'talk' | 'act' | 'attack' | 'way' | 'step' | 'travel' | 'light' | 'wait' | 'study' | 'search'
  | 'camp' | 'rest' | 'eat' | 'tend' | 'other';
// One choice the page draws where the company stands, with every reason it might be led with (see Affordances).
export interface Candidate {
  // The page's own id for it (an opener for what is nested under one: a topic under "Talk to Wat").
  choice: string; label: string; command?: string; for?: string; subject?: string; exit?: string;
  kind: Kind; whys: Why[];
  // The reason's words, by reason ("your brother", "the way you came").
  notes?: Partial<Record<Why, string>>;
  // Where it is drawn among the rest (the authored order: people in the module's order, ways in the headings').
  order: number; marks: Mark[];
  minutes?: number; risk?: boolean; own?: boolean;
  // Done before, nothing new about it; a way to somewhere been; a way the lines told now name.
  known?: boolean; visited?: boolean; pointed?: boolean;
  // Not to be led with at all: disabled, on a companion, on the dead.
  barred?: boolean;
}
// Where the company stands: a danger here, someone warning it off, in the dark with no light, in a settlement or a
// site (where a way not yet taken is worth leading with), in the open country (where the ways are the compass).
export interface Situation { threat: boolean; warned: boolean; dark: boolean; settled: boolean; open: boolean }

// Chooses the few choices a place leads with (OWN-18, OWN-19; the cold review's affordance facets): urgent first (an
// answer owed, a danger, a warning, the dark), then what the aim names, then what the company needs, then what the
// place itself offers that is new, and a way not yet taken. At most three, never padded; at most one for each subject
// (a danger may take two and the way back), two ways, and one of the place's own acts. Pure and deterministic.
export class Promotion {
  static readonly cap = 3;
  // Each reason's tier and its place in it.
  static readonly tiers: Record<Why, [Tier, number]> = {
    helpless: [0, -1], answer: [0, 0], danger: [0, 1], warned: [0, 2], dark: [0, 3], retreat: [0, 4], opened: [0, 5],
    bound: [1, 0], kin: [1, 1], about: [1, 2], named: [1, 3], toward: [1, 4], held: [1, 5], deeper: [1, 6],
    hungry: [2, 0], hurt: [2, 1], night: [2, 2], exposed: [2, 3],
    companion: [3, -3], spoils: [3, -2], means: [3, -1], life: [3, 0], own: [3, 1], sign: [3, 2], asked: [3, 3],
    unlooked: [3, 4],
    onward: [3, 5], entry: [3, -4],
    unvisited: [4, 0], way: [4, 1],
  };
  static pick(cands: Candidate[], s: Situation): Promoted[] {
    const eligible = cands.filter(c => !c.barred).map(c => ({ c, whys: this.allowed(c, s) }))
      .filter(x => x.whys.length).map(x => ({ ...x, best: this.best(x.whys) }));
    // A risk of the place's own (skittles) is led with only when there is nothing else.
    const choices = new Set(eligible.map(x => x.c.choice));
    const fit = eligible.filter(x => !(x.c.own && x.c.risk && x.best === 'own' && choices.size > 1));
    fit.sort((a, b) => this.ranked(a) - this.ranked(b) || Number(a.c.kind === 'attack') - Number(b.c.kind === 'attack')
      || a.c.order - b.c.order);
    const subjects = new Set(fit.map(x => x.c.subject ?? x.c.choice)), picked: Promoted[] = [];
    // Someone to talk to is drawn on their own plate, edged (see the reader's MenuModel.leads), not among the three:
    // two at most, and they take none of the three places (after the notice at Millholm the three job-givers had
    // taken them all, and only the map was led: M19-24).
    const taken = { ways: 0, own: 0, plates: 0, by: new Map<string, number>() };
    for (const x of fit) {
      if (picked.length - taken.plates >= this.cap) { break; }
      if (x.c.kind === 'talk' && taken.plates >= 2) { continue; }
      if (!this.room(x, picked, { taken, s, lone: subjects.size === 1 })) { continue; }
      if (x.c.kind === 'talk') { taken.plates++; }
      const subject = x.c.subject ?? x.c.choice;
      taken.by.set(subject, (taken.by.get(subject) ?? 0) + 1);
      if (this.way(x.c)) { taken.ways++; }
      if (x.best === 'own') { taken.own++; }
      picked.push(this.promoted(x.c, x.best, x.whys));
    }
    return this.continued(picked.length ? picked : this.bare(cands));
  }
  // Where nothing is led with, the ways on, two at most, by the order the quiet row keeps (the way the aim goes, a way
  // the lines name, one not yet taken, then the rest): a gallery with nothing more to do in it had shown nothing at
  // all, and the way up was only under Go… (round 7, both players).
  private static bare(cands: Candidate[]): Promoted[] {
    return cands.filter(c => !c.barred && (c.kind === 'way' || c.kind === 'travel'))
      .sort((a, b) => this.placed(a) - this.placed(b) || a.order - b.order).slice(0, 2)
      .map(c => this.promoted(c, 'way', ['way']));
  }
  // Of what is led with, the one that carries the followed aim on, where any does: the first of the aim's, as ranked
  // (the owner's play of 11 November: exactly one prominent choice is the truthful continuation of the aim followed,
  // where a next step is known; none is invented where none is).
  // What the aim names comes before a way toward it, the journey set out on, kin, and what merely stands where the aim
  // is (the shrine's tower had been marked, and the priest the aim says to ask had not: the owner, 11 November).
  static readonly continuing: Why[] = ['named', 'toward', 'bound', 'kin', 'about'];
  private static continuance(a: Promoted): number {
    const i = this.continuing.indexOf(a.why);
    return i < 0 ? this.continuing.length : i;
  }
  static continued(acts: Promoted[]): Promoted[] {
    const next = acts.filter(a => a.aspects.includes('undertaking'))
      .sort((a, b) => this.continuance(a) - this.continuance(b))[0];
    return acts.map(a => a === next ? { ...a, continues: true as const }
      : a.continues ? Object.fromEntries(Object.entries(a).filter(([k]) => k !== 'continues')) as Promoted : a);
  }
  // Whether there is room for one more of its kind: never twice the same choice; one for each subject (a danger two,
  // and so may a place with nothing else); two ways; one of the place's own; a way not yet taken only while fewer than
  // two are led with.
  private static room(x: { c: Candidate; best: Why }, picked: Promoted[],
    at: { taken: { ways: number; own: number; plates: number; by: Map<string, number> }; s: Situation; lone: boolean }):
    boolean {
    const c = x.c, subject = c.subject ?? c.choice;
    if (picked.some(p => p.choice === c.choice)) { return false; }
    // One for each way: not going into Gaudumport and looking closer at its door, open now, both (OWN-57's play).
    if (c.exit && picked.some(p => p.exit === c.exit)) { return false; }
    const most = (at.s.threat && x.best === 'danger') || at.lone ? 2 : 1;
    if ((at.taken.by.get(subject) ?? 0) >= most) { return false; }
    if (this.way(c) && !['retreat', 'opened'].includes(x.best) && at.taken.ways >= 2) { return false; }
    if (x.best === 'own' && at.taken.own >= 1) { return false; }
    return x.best !== 'unvisited' || picked.length - at.taken.plates < 2;
  }
  // The reasons it may be led with for, as what it is allows: never a wait (but for first light, in the dark with
  // nothing to give light), or studying; a step across the country only toward the aim shown (REV-08: from the edge of
  // the known into the wild country it lies in); a search only for a sign of the place's or the aim naming it; a camp
  // or a rest only for what the company needs; a way not yet taken only in a settlement or site, and not with a danger
  // or a warning.
  private static allowed(c: Candidate, s: Situation): Why[] {
    if (c.kind === 'study') { return []; }
    // A question asked once more ("Ask Bask again about …") tells only what was told: never led with, whatever aim it
    // is about (a player following the page had asked a merchant the same rumour a hundred and sixty times).
    if (c.command && /_again(\(|$)/.test(c.command)) { return []; }
    if (c.kind === 'step') { return c.whys.filter(w => w === 'toward'); }
    // Something done already is not led with again because another aim names whom it is done with: the page had led a
    // follower to lodge and to work for its keep at the same inn, turn and turn about, for days (the follower's 160).
    // A town not yet been to, entered from its own country, is new though the company is not in a settlement.
    const whys = c.whys.filter(w => (w !== 'unvisited' || (s.settled || c.whys.includes('entry')) && !s.threat && !s.warned)
      && !(c.known && w === 'held'));
    if (c.kind === 'wait') { return whys.filter(w => w === 'dark'); }
    if (c.kind === 'search') { return whys.filter(w => w === 'sign' || w === 'named'); }
    if (c.kind === 'camp' || c.kind === 'rest') { return whys.filter(w => this.tiers[w][0] === 2); }
    return whys;
  }
  // Where it is drawn among the rest: by its best reason, but an attack the company's own reckoning calls deadly after
  // the way back from it (a lone warrior led to attack the hobs' raiding party, "beyond you", fell: Mission 20).
  private static ranked(x: { c: Candidate; best: Why }): number {
    return this.rank(x.best) + (x.c.kind === 'attack' && x.c.marks.some(m => m.danger === 'deadly') ? 5 : 0);
  }
  private static best(whys: Why[]): Why { return [...whys].sort((a, b) => this.rank(a) - this.rank(b))[0]!; }
  private static rank(w: Why): number { const [tier, n] = this.tiers[w]; return tier * 10 + n; }
  private static way(c: Candidate): boolean { return ['way', 'travel', 'step'].includes(c.kind); }
  // What it is led with for, and what of it is pressing, aimed, new or only known.
  private static promoted(c: Candidate, why: Why, whys: Why[]): Promoted {
    const tiers = new Set(whys.map(w => this.tiers[w][0]));
    // Further into a site is not the aim's (see Glance.inward).
    const aimed = whys.some(w => w !== 'deeper' && this.tiers[w][0] === 1);
    const facets: Facet[] = ['here', ...aimed ? ['aimed' as const] : [],
      ...tiers.has(0) || tiers.has(2) ? ['urgent' as const] : [], ...tiers.has(3) || tiers.has(4) ? ['new' as const] : [],
      ...c.known ? ['known' as const] : []];
    const note = c.notes?.[why];
    return { choice: c.choice, ...c.command ? { command: c.command } : {}, ...c.for ? { for: c.for } : {},
      ...c.subject ? { subject: c.subject } : {},
      ...c.exit ? { exit: c.exit } : {}, label: c.label, why, facets, tier: this.tiers[why][0],
      aspects: Aspects.of([why, ...whys.filter(w => w !== why)], c.marks), ...note ? { note } : {}, marks: c.marks,
      ...whys.includes('entry') ? { enters: true as const, afar: true as const } : {} };
  }
  // The quiet row of ways under the acts, none of them led with already: those the aims name, those the lines told now
  // name, those not yet taken (nearest first), then the rest; three at most. In the open country, the compass.
  static ways(cands: Candidate[], picked: Promoted[], s: Situation): string[] {
    const led = new Set(picked.map(p => p.choice));
    const ways = cands.filter(c => !c.barred && !led.has(c.choice) && (s.open ? c.kind === 'step'
      : c.kind === 'way' || c.kind === 'travel'));
    if (s.open && ways.length) { return ways.sort((a, b) => a.order - b.order).map(c => c.choice); }
    return ways.sort((a, b) => this.placed(a) - this.placed(b)
      || (this.placed(a) === 2 ? (a.minutes ?? 0) - (b.minutes ?? 0) : 0) || a.order - b.order)
      .slice(0, this.cap).map(c => c.choice);
  }
  private static placed(c: Candidate): number {
    return c.whys.some(w => this.tiers[w][0] === 1) ? 0 : c.pointed ? 1 : !c.visited ? 2 : 3;
  }
}
