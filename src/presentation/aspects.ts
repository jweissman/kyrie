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
    // A marvel of the place (a standing stone that hums, a spring that sings): the uncanny, violet.
    wonder: 'wonder',
    // What is worth going to see: a way not taken, further in, the place's own doings, an aim heard of and not
    // followed. Not whoever is the life of the place: being someone here is no opportunity, and a person is drawn by
    // their likeness, neutral, unless there is something to be had of them (the owner, 14 November: CN-07).
    unvisited: 'exploration', deeper: 'exploration', onward: 'exploration', own: 'exploration', held: 'exploration',
  };
  // whys: best first (see Promotion). A fight or a trap the company can see is a danger whatever it is led for, and so
  // is a way with something heard in there (Marks: a band that can be drawn out): the company has perceived it, so the
  // way says so in red (M22's sites audit: the way into a band was told only in the room's prose, unmarked); and so
  // is a way whose mouth shows that something lies in wait in there, to a company that can see it (Marks: lurks).
  // visited: the place it leads to has been gone to; going further in or onward there is a way, but not a discovery,
  // which an exploration promises (PB-24: "To the great hall", four turns running, brought nothing new).
  static of(whys: Why[], marks: Mark[], visited = false): Aspect[] {
    const seen = [...whys.filter(w => !visited || !['deeper', 'onward'].includes(w)).flatMap(w => this.by[w] ?? []),
      ...marks.some(m => ['fight', 'trap', 'heard', 'lurks'].includes(m.kind)) ? ['danger' as const] : []];
    return seen.filter((a, i) => seen.indexOf(a) === i);
  }
}
