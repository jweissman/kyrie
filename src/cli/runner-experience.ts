import type { Offered, Said } from './runner';
import { RunnerWalk, type Walk } from './runner-walk';
import { Sentences } from '../presentation/sentences';

// The recurring experiential complaints as cheap floors, read from a walk's own turns (the owner, 15 November): what
// the offers held (Offered aspects, types, the command each is done by, its marks), what acts changed (the event's
// changes, RunnerPayoff), where the company stood. Never the rendered colour, and no taxonomy of its own.
export interface Experience {
  // Variety: the facets seen; the opportunities, each an act on its targets (its command), movement and waiting
  // aside; of those, led with (in the four at least once) or only ever in the rest; taken; and aims seen through.
  facets: number; opportunities: number; promoted: number; buried: number; pursued: number; resolved: number;
  // Acts that changed the world beyond time and position, of the acts taken; returns to a place known before that
  // found something different there (what it offered, or a change made since), of the returns.
  changing: number; acts: number; returns: number; differing: number;
  // Continuity: the longest run of turns carrying one aim, something leading on it each turn; two places
  // alternated with nothing changed between.
  longest: number; alternations: number;
  // Prose: heavy sentences said unasked, of those said unasked; a sentence said again within a few turns.
  heavy: number; sentences: number; echoes: number;
  // Payoff: comings back where a bond was made or a fact learned, and how many of them found it still holding.
  kept: number; revisited: number;
  // The opportunities themselves, for pairing walks (identity: what one calling sees and another does not).
  keys: string[];
}
export class RunnerExperience {
  static readonly near = 5;
  static of(walk: Walk): Experience {
    const t = walk.turns, all = t.flatMap(x => [...x.offer.primary, ...x.offer.rest]);
    const keys = new Set(all.filter(o => this.opportunity(o)).map(o => o.id));
    const led = new Set(t.flatMap(x => x.offer.primary).filter(o => this.opportunity(o)).map(o => o.id));
    const acts = walk.chosen.filter(o => o.type !== 'fight');
    const { returns, differing } = this.returns(t);
    const kept = t.flatMap(x => x.kept ? [x.kept] : []);
    return { facets: new Set(all.flatMap(o => o.aspects)).size, opportunities: keys.size, promoted: led.size,
      buried: keys.size - led.size, pursued: new Set(walk.chosen.filter(o => keys.has(o.id)).map(o => o.id)).size,
      resolved: this.resolved(t), changing: t.slice(1).filter((x, i) => walk.chosen[i]?.type !== 'fight'
        && !!x.changed?.length).length, acts: acts.length, returns, differing, longest: this.longest(walk),
      alternations: this.alternations(t), heavy: walk.budget.unasked.heavy.length,
      sentences: walk.budget.unasked.sentences, echoes: this.echoes(t), kept: kept.filter(k => k.held === k.of).length,
      revisited: kept.length, keys: [...keys].sort() };
  }
  // An act on something: not a step, a journey, a wait, nor setting a thing down.
  private static opportunity(o: Offered): boolean {
    return !['wait', 'go', 'journey'].includes(o.type) && !/^put_item\(/.test(o.id);
  }
  // Aims held on one turn and gone on the next: seen through (or ended by the world).
  private static resolved(t: Said[]): number {
    return new Set(t.flatMap((x, i) => i ? (t[i - 1]!.aims ?? []).filter(a => !(x.aims ?? []).some(b => b.id === a.id))
      .map(a => a.id) : [])).size;
  }
  private static returns(t: Said[]): { returns: number; differing: number } {
    const last = new Map<string, string>(); let returns = 0, differing = 0, changed = false;
    for (const x of t) {
      if (x.changed?.length) { changed = true; }
      if (x.moment !== 'arrive' || !x.at) { continue; }
      const offer = [...x.offer.primary, ...x.offer.rest].map(o => o.id).sort().join('|');
      if (last.has(x.at)) { returns++; if (changed || last.get(x.at) !== offer) { differing++; } }
      last.set(x.at, offer); changed = false;
    }
    return { returns, differing };
  }
  private static longest(walk: Walk): number {
    const lost = new Set(RunnerWalk.lostIndices(walk));
    let best = 0, run = 0, aim: string | undefined;
    walk.turns.forEach((x, i) => {
      const now = x.aims?.find(a => a.followed)?.id;
      run = now && !lost.has(i) ? (now === aim ? run + 1 : 1) : 0;
      aim = now; best = Math.max(best, run);
    });
    return best;
  }
  // A, B, A, B among the places arrived at, with nothing changed on the way.
  private static alternations(t: Said[]): number {
    const at = t.filter(x => x.moment === 'arrive' && x.at);
    return at.filter((x, i) => i >= 3 && x.at === at[i - 2]!.at && at[i - 1]!.at === at[i - 3]!.at
      && x.at !== at[i - 1]!.at && !t.slice(t.indexOf(at[i - 3]!) + 1, t.indexOf(x) + 1).some(y => y.changed?.length))
      .length;
  }
  // A sentence of narration said again within a few turns of its first saying.
  private static echoes(t: Said[]): number {
    const said = new Map<string, number>(); let n = 0;
    t.forEach((x, i) => {
      for (const s of new Set(x.scene.prose.flatMap(l => Sentences.split(l)))) {
        if (said.has(s) && i - said.get(s)! <= this.near) { n++; }
        said.set(s, i);
      }
    });
    return n;
  }
}
