import type { Predicate } from './module';

// Predicates made for one asking (whether a thing is near the company, what stands on a way), kept by what they say:
// the same question asked again is then the same predicate, and what is read of it once (QueryModes, the solver's
// conjunctions) serves again, where a predicate made afresh for every asking was read afresh every time (Mission 15:
// hundreds of thousands in forty commands). The latest made are kept.
export class KeptPredicates {
  private static readonly kept = new Map<string, Predicate>();
  private static readonly most = 8192;
  static of(key: string, make: () => Predicate): Predicate {
    let p = this.kept.get(key);
    if (!p) {
      p = make(); this.kept.set(key, p);
      if (this.kept.size > this.most) { this.kept.delete(this.kept.keys().next().value!); }
    }
    return p;
  }
}
