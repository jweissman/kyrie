import type { Module, Predicate, Query, Value } from './module';

interface Modes { negated: string[]; binds: string[]; named: string[] }

// What a predicate does with its arguments when it is solved (see World.solve): which it reads under a negation (or a
// comparison, or `distinct`), which it is sure to bind if it holds, and which it names at all. A negation asked of
// what is not yet bound would answer for nothing at all ("no thing is marked") rather than for each thing, so a
// conjunction asks its negations once what they read is bound, and a query whose body cannot bind one of its
// parameters ranges it over the entities of its type (Mission 15's independent audit, F2). Read once for a module
// and a predicate; a query's parameters are its asker's arguments.
export class QueryModes {
  private static readonly read = new WeakMap<Module, WeakMap<object, Modes>>();
  static negated(module: Module, p: Predicate): readonly string[] { return this.of(module, p).negated; }
  static binds(module: Module, p: Predicate): readonly string[] { return this.of(module, p).binds; }
  static named(module: Module, p: Predicate): readonly string[] { return this.of(module, p).named; }
  // Whether it reads anything under a negation at all: read without making anything, for a predicate made for one
  // asking (most are plain facts joined).
  private static readonly negating = new WeakMap<object, boolean>();
  static negates(module: Module, p: Predicate): boolean {
    let negates = this.negating.get(p);
    if (negates === undefined) { negates = this.reads(module, p); this.negating.set(p, negates); }
    return negates;
  }
  private static reads(module: Module, p: Predicate): boolean {
    switch (p.kind) {
      case 'not': case 'compare': return true;
      case 'and': case 'or': return this.reads(module, p.left) || this.reads(module, p.right);
      case 'call': {
        if (p.name === 'distinct') { return true; }
        const query = this.query(module, p.name);
        return !!query && this.of(module, query.body).negated.length > 0;
      }
      default: return false;
    }
  }
  // Whether it names a variable (?x) anywhere outside a comparison: a closed predicate is tested directly, not solved.
  private static readonly open = new WeakMap<object, boolean>();
  static variables(p: Predicate): boolean {
    const cached = this.open.get(p);
    if (cached !== undefined) { return cached; }
    const result = p.kind === 'call' ? p.args.some(a => a.startsWith('?')) : p.kind === 'not' ? this.variables(p.value)
      : p.kind === 'and' || p.kind === 'or' ? this.variables(p.left) || this.variables(p.right) : false;
    this.open.set(p, result);
    return result;
  }
  // The parameters of a query its body is not sure to bind.
  static unbound(module: Module, query: Query): string[] {
    const bound = new Set(this.binds(module, query.body));
    return query.parameters.map(p => p.name).filter(name => !bound.has(name));
  }
  private static of(module: Module, p: Predicate) {
    let kept = this.read.get(module);
    if (!kept) { kept = new WeakMap(); this.read.set(module, kept); }
    let modes = kept.get(p);
    if (!modes) { modes = this.modes(module, p, new Set()); kept.set(p, modes); }
    return modes;
  }
  // A module's queries by name, and what each one's body does, read once (a query that asks itself, however deeply,
  // is read as binding and negating nothing more of its own).
  private static readonly queries = new WeakMap<readonly Query[], Map<string, Query>>();
  private static query(module: Module, name: string): Query | undefined {
    let byName = this.queries.get(module.queries);
    if (!byName || byName.size !== module.queries.length) {
      byName = new Map(module.queries.map(q => [q.name, q])); this.queries.set(module.queries, byName);
    }
    return byName.get(name);
  }
  private static body(module: Module, query: Query, asking: Set<string>): Modes {
    const kept = this.read.get(module)?.get(query.body);
    if (kept) { return kept; }
    asking.add(query.name);
    const modes = this.modes(module, query.body, asking);
    asking.delete(query.name);
    // Kept only when no other query was being read around it, which it might otherwise depend on.
    if (!asking.size) { this.read.get(module)?.set(query.body, modes); }
    return modes;
  }
  private static modes(module: Module, p: Predicate, asking: Set<string>): Modes {
    switch (p.kind) {
      case 'not': {
        const inner = this.part(module, p.value, asking);
        return { negated: inner.named, binds: [], named: inner.named };
      }
      case 'compare': {
        const named = [...this.values(p.left), ...this.values(p.right)];
        return { negated: named, binds: [], named };
      }
      case 'and': case 'or': {
        const left = this.part(module, p.left, asking), right = this.part(module, p.right, asking);
        const binds = p.kind === 'and' ? [...left.binds, ...right.binds] : left.binds.filter(x => right.binds.includes(x));
        return { negated: [...left.negated, ...right.negated], binds, named: [...left.named, ...right.named] };
      }
      case 'call': return this.call(module, p, asking);
      default: return { negated: [], binds: [], named: [] };
    }
  }
  // A part of a predicate: read as kept, unless a query is being read around it (which it might then depend on).
  // A predicate made for one asking (`at(a, ?p) and at(b, ?p)`) is so read from what is kept of its parts.
  private static part(module: Module, p: Predicate, asking: Set<string>): Modes {
    return asking.size ? this.modes(module, p, asking) : this.of(module, p);
  }
  private static call(module: Module, p: Extract<Predicate, { kind: 'call' }>, asking: Set<string>): Modes {
    if (p.name === 'distinct') { return { negated: [...p.args], binds: [], named: [...p.args] }; }
    const query = this.query(module, p.name);
    if (!query) { return { negated: [], binds: [...p.args], named: [...p.args] }; }
    if (asking.has(query.name)) { return { negated: [], binds: [], named: [...p.args] }; }
    const body = this.body(module, query, asking);
    return { negated: this.asked(query, p.args, body.negated), binds: this.asked(query, p.args, body.binds),
      named: [...p.args] };
  }
  // What a query's body does with a parameter, it does with the asker's argument in its place.
  private static asked(query: Query, args: string[], names: string[]): string[] {
    return [...new Set(names.flatMap(name => {
      const i = query.parameters.findIndex(q => q.name === name);
      return i >= 0 ? [args[i]!] : [];
    }))];
  }
  private static values(v: Value): string[] {
    return v.kind === 'call' ? [...v.args] : v.kind === 'arith' ? [...this.values(v.left), ...this.values(v.right)] : [];
  }
}
