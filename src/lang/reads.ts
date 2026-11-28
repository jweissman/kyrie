import type { Change, Module, Predicate, Query, Value } from './module';
import { Stamps } from './stamps';
import { ComputedRelations } from './computed-relations';

type Part = Predicate | Value | Change;

// The relations and measures that predicates, values and changes read or write, through every query they ask: what a
// reading of the world made from them can turn on. Two worlds of one line whose stamps agree on all of these give the
// same reading (see World.version).
export class Reads {
  // A module's queries by name, made once a module (every rule's reads had made the map again: OR-145).
  private static readonly byName = new WeakMap<Module, Map<string, Query>>();
  static names(module: Module, parts: readonly (Part | undefined)[]): string[] {
    let queries = this.byName.get(module);
    if (!queries) { queries = new Map(module.queries.map(q => [q.name, q])); this.byName.set(module, queries); }
    const names = new Set<string>();
    for (const part of parts) { if (part) { this.visit(part, queries, names); } }
    return [...names].sort();
  }
  // What a part reads, as a rule held idle on it waits for it (OR-1438): a stored relation or measure asked of one
  // thing given, not a ?variable (state(bell, rung), at(party, ?p), patience(boar)), by its name and that thing
  // (Stamps.key), so that the part is asked again when that thing's facts are written, not whenever any of the
  // relation's are; anything else (a query, a computed relation, a die, a thing asked as a variable) by its name.
  static keyed(module: Module, part: Part): string[] {
    const queries = this.queries(module), keys = new Set<string>();
    this.keys(part, queries, keys);
    return [...keys].sort();
  }
  private static queries(module: Module): Map<string, Query> {
    let queries = this.byName.get(module);
    if (!queries) { queries = new Map(module.queries.map(q => [q.name, q])); this.byName.set(module, queries); }
    return queries;
  }
  private static readonly drawn = new Set(['dice', 'fortune', 'within']);
  private static keys(part: Part, queries: Map<string, Query>, keys: Set<string>) {
    const first = part.kind === 'call' ? part.args[0] : undefined;
    if (part.kind === 'call' && first !== undefined && !first.startsWith('?') && !queries.has(part.name)
      && !ComputedRelations.has(part.name) && !this.drawn.has(part.name)) {
      keys.add(Stamps.key(part.name, first)); return;
    }
    switch (part.kind) {
      case 'not': this.keys(part.value, queries, keys); return;
      case 'and': case 'or': case 'compare': case 'arith':
        this.keys(part.left, queries, keys); this.keys(part.right, queries, keys); return;
      case 'count': this.keys(part.of, queries, keys); return;
      default: {
        const names = new Set<string>();
        this.visit(part, queries, names);
        for (const n of names) { keys.add(n); }
      }
    }
  }
  private static visit(part: Part, queries: Map<string, Query>, names: Set<string>) {
    switch (part.kind) {
      case 'call': {
        if (names.has(part.name)) { return; }
        names.add(part.name);
        // A thing's own die (dice(?room)) is drawn from the watch's die and the watch (see World.die).
        if (part.name === 'dice') { names.add('watch'); }
        // A thing's fortune at a place is drawn from the day's die and the day (see World.fortune).
        if (part.name === 'fortune') { names.add('dayDice'); names.add('day'); }
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
      case 'count': this.visit(part.of, queries, names); return;
      // A change reads what its guard does (Change.when), as well as writing what it names.
      case 'assert': case 'retract':
        this.visit(part.call, queries, names); if (part.when) { this.visit(part.when, queries, names); } return;
      case 'set': case 'increase': case 'decrease':
        this.visit(part.call, queries, names); this.visit(part.value, queries, names);
        if (part.when) { this.visit(part.when, queries, names); }
        return;
      default: return;
    }
  }
}
