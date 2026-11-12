import type { Aspect, Mark, Why } from './glance-types';

// What an opportunity is to the company that sees it (amendment 6 and its addendum: meaning apart from perception and
// from presentation). Its aspects come from the reasons it is worth doing and the marks it bears, and those from what
// the company knows, notices and reckons (see Affordances): a danger it has not perceived, or a sign it has not the
// eye for, gives nothing. The page decides how an aspect is drawn (web/reader/atlas.ts); nothing here is a colour.
// Several may hold at once; the first is the one it is chiefly for.
export class Aspects {
  // By reason. A need (food, light, mending, a bed) and the way back have no aspect: they are urgent, not opportune.
  static readonly by: Partial<Record<Why, Aspect>> = {
    // The aim the player follows: what it names, a way toward it, the journey set out on it, its own people.
    advance: 'undertaking', named: 'undertaking', toward: 'undertaking', about: 'undertaking', bound: 'undertaking', kin: 'undertaking',
    danger: 'danger', warned: 'danger',
    spoils: 'payoff', means: 'payoff', companion: 'companionship',
    sign: 'knowledge', unlooked: 'knowledge', asked: 'knowledge',
    // What is worth going to see: a way not taken, further in, the place's own doings, an aim heard of and not
    // followed, whoever is the life of the place.
    unvisited: 'exploration', deeper: 'exploration', onward: 'exploration', own: 'exploration', held: 'exploration',
    life: 'exploration',
  };
  // whys: best first (see Promotion). A fight or a trap the company can see is a danger whatever it is led for.
  static of(whys: Why[], marks: Mark[]): Aspect[] {
    const seen = [...whys.flatMap(w => this.by[w] ?? []),
      ...marks.some(m => m.kind === 'fight' || m.kind === 'trap') ? ['danger' as const] : []];
    return seen.filter((a, i) => seen.indexOf(a) === i);
  }
}
