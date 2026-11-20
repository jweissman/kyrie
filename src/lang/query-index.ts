import type { Module, Query } from './module';

// A module's queries by name, built once for its list of them (and again if the list grows): asked for each atom of
// each candidate an action's grounding proposes, a search of every query had been a third of a grounding's cost
// (OR-91's profile, 19 November).
export class QueryIndex {
  private static readonly kept = new WeakMap<Module['queries'], { length: number; by: Map<string, Query> }>();
  static of(module: Module, name: string): Query | undefined {
    const queries = module.queries;
    let kept = this.kept.get(queries);
    if (kept?.length !== queries.length) {
      // The first of a name, as a search of them finds it.
      kept = { length: queries.length, by: new Map(queries.toReversed().map(q => [q.name, q])) };
      this.kept.set(queries, kept);
    }
    return kept.by.get(name);
  }
}
