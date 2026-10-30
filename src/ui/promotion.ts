import type { Facet, Mark, Promoted, Tier, Why } from '../presentation/glance-types';

// What a choice is, as far as leading with it goes: talking to someone, an act on someone or something, an attack, a
// way (a step across the open country apart), a journey about the town, lighting a light, waiting, studying (preparing
// spells, spending a level), searching, camping, resting, eating, tending, or anything else the company does.
export type Kind = 'talk' | 'act' | 'attack' | 'way' | 'step' | 'travel' | 'light' | 'wait' | 'study' | 'search'
  | 'camp' | 'rest' | 'eat' | 'tend' | 'other';
// One choice the page draws where the company stands, with every reason it might be led with (see Affordances).
export interface Candidate {
  // The page's own id for it (an opener for what is nested under one: a topic under "Talk to Wat").
  choice: string; label: string; command?: string; subject?: string; exit?: string;
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
    answer: [0, 0], danger: [0, 1], warned: [0, 2], dark: [0, 3], retreat: [0, 4],
    bound: [1, 0], kin: [1, 1], about: [1, 2], named: [1, 3], toward: [1, 4], held: [1, 5],
    hungry: [2, 0], hurt: [2, 1], night: [2, 2], exposed: [2, 3],
    life: [3, 0], own: [3, 1], sign: [3, 2], asked: [3, 3], unlooked: [3, 4],
    unvisited: [4, 0],
  };
  static pick(cands: Candidate[], s: Situation): Promoted[] {
    const eligible = cands.filter(c => !c.barred).map(c => ({ c, whys: this.allowed(c, s) }))
      .filter(x => x.whys.length).map(x => ({ ...x, best: this.best(x.whys) }));
    // A risk of the place's own (skittles) is led with only when there is nothing else.
    const choices = new Set(eligible.map(x => x.c.choice));
    const fit = eligible.filter(x => !(x.c.own && x.c.risk && x.best === 'own' && choices.size > 1));
    fit.sort((a, b) => this.rank(a.best) - this.rank(b.best) || Number(a.c.kind === 'attack') - Number(b.c.kind === 'attack')
      || a.c.order - b.c.order);
    const subjects = new Set(fit.map(x => x.c.subject ?? x.c.choice)), picked: Promoted[] = [];
    const taken = { ways: 0, own: 0, by: new Map<string, number>() };
    for (const x of fit) {
      if (picked.length >= this.cap) { break; }
      if (!this.room(x, picked, { taken, s, lone: subjects.size === 1 })) { continue; }
      const subject = x.c.subject ?? x.c.choice;
      taken.by.set(subject, (taken.by.get(subject) ?? 0) + 1);
      if (this.way(x.c)) { taken.ways++; }
      if (x.best === 'own') { taken.own++; }
      picked.push(this.promoted(x.c, x.best, x.whys));
    }
    return picked;
  }
  // Whether there is room for one more of its kind: never twice the same choice; one for each subject (a danger two,
  // and so may a place with nothing else); two ways; one of the place's own; a way not yet taken only while fewer than
  // two are led with.
  private static room(x: { c: Candidate; best: Why }, picked: Promoted[],
    at: { taken: { ways: number; own: number; by: Map<string, number> }; s: Situation; lone: boolean }): boolean {
    const c = x.c, subject = c.subject ?? c.choice;
    if (picked.some(p => p.choice === c.choice)) { return false; }
    const most = (at.s.threat && x.best === 'danger') || at.lone ? 2 : 1;
    if ((at.taken.by.get(subject) ?? 0) >= most) { return false; }
    if (this.way(c) && x.best !== 'retreat' && at.taken.ways >= 2) { return false; }
    if (x.best === 'own' && at.taken.own >= 1) { return false; }
    return x.best !== 'unvisited' || picked.length < 2;
  }
  // The reasons it may be led with for, as what it is allows: never a wait (but for first light, in the dark with
  // nothing to give light), a step across the country, studying; a search only for a sign of the place's or the aim
  // naming it; a camp or a rest only for what the company needs; a way not yet taken only in a settlement or site, and
  // not with a danger or a warning.
  private static allowed(c: Candidate, s: Situation): Why[] {
    if (['step', 'study'].includes(c.kind)) { return []; }
    const whys = c.whys.filter(w => w !== 'unvisited' || (s.settled && !s.threat && !s.warned));
    if (c.kind === 'wait') { return whys.filter(w => w === 'dark'); }
    if (c.kind === 'search') { return whys.filter(w => w === 'sign' || w === 'named'); }
    if (c.kind === 'camp' || c.kind === 'rest') { return whys.filter(w => this.tiers[w][0] === 2); }
    return whys;
  }
  private static best(whys: Why[]): Why { return [...whys].sort((a, b) => this.rank(a) - this.rank(b))[0]!; }
  private static rank(w: Why): number { const [tier, n] = this.tiers[w]; return tier * 10 + n; }
  private static way(c: Candidate): boolean { return ['way', 'travel', 'step'].includes(c.kind); }
  // What it is led with for, and what of it is pressing, aimed, new or only known.
  private static promoted(c: Candidate, why: Why, whys: Why[]): Promoted {
    const tiers = new Set(whys.map(w => this.tiers[w][0]));
    const facets: Facet[] = ['here', ...tiers.has(1) ? ['aimed' as const] : [],
      ...tiers.has(0) || tiers.has(2) ? ['urgent' as const] : [], ...tiers.has(3) || tiers.has(4) ? ['new' as const] : [],
      ...c.known ? ['known' as const] : []];
    const note = c.notes?.[why];
    return { choice: c.choice, ...c.command ? { command: c.command } : {}, ...c.subject ? { subject: c.subject } : {},
      ...c.exit ? { exit: c.exit } : {}, label: c.label, why, facets, tier: this.tiers[why][0],
      ...note ? { note } : {}, marks: c.marks };
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
