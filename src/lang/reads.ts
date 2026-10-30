import type { Change, Module, Predicate, Query, Value } from './module';

type Part = Predicate | Value | Change;

// The relations and measures that predicates, values and changes read or write, through every query they ask: what a
// reading of the world made from them can turn on. Two worlds of one line whose stamps agree on all of these give the
// same reading (see World.version).
export class Reads {
  static names(module: Module, parts: readonly (Part | undefined)[]): string[] {
    const queries = new Map(module.queries.map(q => [q.name, q])), names = new Set<string>();
    for (const part of parts) { if (part) { this.visit(part, queries, names); } }
    return [...names].sort();
  }
  private static visit(part: Part, queries: Map<string, Query>, names: Set<string>) {
    switch (part.kind) {
      case 'call': {
        if (names.has(part.name)) { return; }
        names.add(part.name);
        // A thing's own die (dice(?room)) is drawn from the watch's die and the watch (see World.die).
        if (part.name === 'dice') { names.add('watch'); }
        // Whether something is within an area is where it is (see ComputedRelations): a rule asking it is asked again
        // when the company moves (the Lull's friction F3, LUL-03: never, before).
        if (part.name === 'within') { names.add('at'); }
        const query = queries.get(part.name);
        if (query) { this.visit(query.body, queries, names); }
        return;
      }
      case 'not': this.visit(part.value, queries, names); return;
      case 'and': case 'or': case 'compare': case 'arith':
        this.visit(part.left, queries, names); this.visit(part.right, queries, names); return;
      case 'assert': case 'retract': this.visit(part.call, queries, names); return;
      case 'set': case 'increase': case 'decrease':
        this.visit(part.call, queries, names); this.visit(part.value, queries, names); return;
      default: return;
    }
  }
}
