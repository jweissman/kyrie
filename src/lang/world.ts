import type { Call, Change, Module, NumberValue, Predicate, Signature, Value, WorldState } from './module';

// Name lookups for a module's signatures. Modules are assembled before execution; a changed signature list
// (by identity or length) rebuilds the index.
interface Signatures {
  relations: Map<string, Signature>; measures: Set<string>; queries: Map<string, Module['queries'][number]>;
  source: [Signature[], Signature[], Module['queries']]; lengths: [number, number, number] }
type Measure = { call: Call; value: number };

// An immutable view of world state. Facts are indexed by key and by relation name; `apply` forks the indexes
// instead of re-cloning and re-keying the whole state. Calls held by a world are never mutated.
export class World {
  private facts: Map<string, Call>;
  private byName: Map<string, Map<string, Call>>;
  private quantities: Map<string, Measure>;
  private owned = new Set<string>();
  // A globally unique stamp per write to each relation or measure name, so views derived from some names can tell
  // whether those names changed between two worlds.
  private stamps = new Map<string, number>();
  private static writes = 0;
  private memoKey?: string;
  private memoSnapshot?: WorldState;
  // Read-only views by relation name (and first argument), and of measures by name, built on first use.
  private lists = new Map<string, Call[]>();
  private firsts = new Map<string, Map<string, Call[]>>();
  private amounts = new Map<string, Measure[]>();
  private static readonly open = new WeakMap<object, boolean>();
  private static readonly signatures = new WeakMap<Module, Signatures>();
  constructor(readonly module: Module, state: WorldState = { relations: [], measures: [] }) {
    this.facts = new Map(); this.byName = new Map(); this.quantities = new Map();
    for (const call of state.relations) { this.add(World.key(call), World.copy(call)); }
    for (const m of state.measures) {
      this.quantities.set(World.key(m.call), { call: World.copy(m.call), value: m.value });
    }
  }
  private static fork(from: World): World {
    const next = Object.create(World.prototype) as World;
    (next as { module: Module }).module = from.module;
    next.facts = new Map(from.facts); next.quantities = new Map(from.quantities);
    next.byName = new Map(from.byName); next.owned = new Set(); next.stamps = new Map(from.stamps);
    next.lists = new Map(); next.firsts = new Map(); next.amounts = new Map();
    return next;
  }
  private static copy(call: Call): Call { return { ...call, args: [...call.args] }; }
  // Every fact and measure, as the world holds them: for reading only (`snapshot` is a copy to keep or change).
  get view(): Readonly<WorldState> {
    this.memoSnapshot ??= { relations: [...this.facts.values()], measures: [...this.quantities.values()] };
    return this.memoSnapshot;
  }
  get snapshot(): WorldState {
    this.memoSnapshot ??= { relations: [...this.facts.values()], measures: [...this.quantities.values()] };
    return { relations: this.memoSnapshot.relations.map(World.copy),
      measures: this.memoSnapshot.measures.map(m => ({ call: World.copy(m.call), value: m.value })) };
  }
  // The facts of one relation (with this first argument, if given), as the world holds them: for reading only. Far
  // cheaper than `snapshot`, which copies every fact.
  related(name: string, first?: string): readonly Call[] {
    let list = this.lists.get(name);
    if (!list) { list = [...this.byName.get(name)?.values() ?? []]; this.lists.set(name, list); }
    if (first === undefined) { return list; }
    let index = this.firsts.get(name);
    if (!index) {
      index = new Map();
      for (const call of list) {
        const at = index.get(call.args[0]!);
        if (at) { at.push(call); } else { index.set(call.args[0]!, [call]); }
      }
      this.firsts.set(name, index);
    }
    return index.get(first) ?? [];
  }
  // The other party of a fact that relates this one to one other (`at(party, ?)`): the first, if there are several.
  one(name: string, first: string): string | undefined { return this.related(name, first)[0]?.args[1]; }
  // Every value of one measure, as the world holds them: for reading only.
  measured(name: string): readonly Measure[] {
    let list = this.amounts.get(name);
    if (!list) { list = [...this.quantities.values()].filter(m => m.call.name === name); this.amounts.set(name, list); }
    return list;
  }
  // Whether the module declares this relation.
  relates(name: string): boolean { return World.index(this.module).relations.has(name); }
  // Whether the fact with this key (see `key`) currently holds.
  holds(key: string): boolean { return this.facts.has(key); }
  static key(call: Call): string { return JSON.stringify([call.name, ...call.args]); }
  static format(call: Call): string { return `${call.name}(${call.args.join(', ')})`; }
  private static index(module: Module): Signatures {
    const cached = World.signatures.get(module);
    if (cached && cached.source[0] === module.relations && cached.source[1] === module.measures
      && cached.source[2] === module.queries && cached.lengths[0] === module.relations.length
      && cached.lengths[1] === module.measures.length && cached.lengths[2] === module.queries.length) { return cached; }
    const built: Signatures = { relations: new Map(module.relations.map(r => [r.name, r])),
      measures: new Set(module.measures.map(m => m.name)), queries: new Map(module.queries.map(q => [q.name, q])),
      source: [module.relations, module.measures, module.queries],
      lengths: [module.relations.length, module.measures.length, module.queries.length] };
    World.signatures.set(module, built);
    return built;
  }
  private bind(call: Call, bindings: Record<string, string>): Call {
    return { ...call, args: call.args.map(arg => bindings[arg] ?? arg) };
  }
  number(value: Value, bindings: Record<string, string> = {}): number {
    if (value.kind === 'number') { return value.value; }
    if (value.kind === 'deem') { throw new Error('Deem module values must be instantiated before execution'); }
    if (!World.index(this.module).measures.has(value.name)) { throw new Error(`Unknown measure ${value.name}`); }
    return this.quantities.get(World.key(this.bind(value, bindings)))?.value ?? 0;
  }
  // A predicate may contain existential variables (?name). Closed predicates keep the direct evaluator.
  test(predicate: Predicate, bindings: Record<string, string> = {}): boolean {
    if (!World.variables(predicate)) { return this.closed(predicate, bindings); }
    return !this.solve(predicate, bindings).next().done;
  }
  static variables(p: Predicate): boolean {
    const cached = World.open.get(p);
    if (cached !== undefined) { return cached; }
    const result = p.kind === 'call' ? p.args.some(a => a.startsWith('?')) : p.kind === 'not' ? World.variables(p.value)
      : p.kind === 'and' || p.kind === 'or' ? World.variables(p.left) || World.variables(p.right) : false;
    World.open.set(p, result);
    return result;
  }
  // Depth-first search over bindings; negation succeeds when no binding exists (variables stay existential).
  *solve(p: Predicate, b: Record<string, string>): Generator<Record<string, string>> {
    switch (p.kind) {
      case 'not': if (this.solve(p.value, b).next().done) { yield b; } return;
      case 'and': for (const left of this.solve(p.left, b)) { yield* this.solve(p.right, left); } return;
      case 'or': yield* this.solve(p.left, b); yield* this.solve(p.right, b); return;
      case 'call': break;
      default: if (this.closed(p, b)) { yield b; } return;
    }
    const args = p.args.map(a => b[a] ?? a);
    const signatures = World.index(this.module);
    if (signatures.queries.has(p.name) || !args.some(a => a.startsWith('?'))) {
      if (args.some(a => a.startsWith('?'))) { throw new Error(`Query ${p.name} needs bound arguments`); }
      if (this.closed({ ...p, args }, {})) { yield b; }
      return;
    }
    if (!signatures.relations.has(p.name)) { throw new Error(`Unknown predicate ${p.name}`); }
    if (p.name === 'distinct') { throw new Error('distinct compares two bound parties'); }
    for (const fact of [...(this.byName.get(p.name)?.values() ?? [])]) {
      const next = { ...b };
      if (fact.args.every((value, i) => {
        const arg = args[i]!;
        if (!arg.startsWith('?')) { return arg === value; }
        if (next[arg] !== undefined) { return next[arg] === value; }
        next[arg] = value; return true;
      })) { yield next; }
    }
  }
  private closed(predicate: Predicate, bindings: Record<string, string> = {}): boolean {
    switch (predicate.kind) {
      case 'boolean': return predicate.value;
      case 'not': return !this.closed(predicate.value, bindings);
      case 'and': return this.closed(predicate.left, bindings) && this.closed(predicate.right, bindings);
      case 'or': return this.closed(predicate.left, bindings) || this.closed(predicate.right, bindings);
      case 'call': {
        const call = this.bind(predicate, bindings);
        const signatures = World.index(this.module);
        const query = signatures.queries.get(call.name);
        if (query) {
          const argumentsByName: Record<string, string> = {};
          query.parameters.forEach((parameter, index) => { argumentsByName[parameter.name] = call.args[index]!; });
          return this.test(query.body, argumentsByName);
        }
        if (!signatures.relations.has(call.name)) { throw new Error(`Unknown predicate ${call.name}`); }
        // Two parties are distinct when they are not the same one: computed, not stored for every pair.
        if (call.name === 'distinct') { return call.args[0] !== call.args[1]; }
        return this.facts.has(World.key(call));
      }
      case 'compare': {
        const left = this.number(predicate.left, bindings), right = this.number(predicate.right, bindings);
        switch (predicate.operator) {
          case '>': return left > right;
          case '<': return left < right;
          case '>=': return left >= right;
          case '<=': return left <= right;
          case '==': return left === right;
          case '!=': return left !== right;
        }
      }
    }
  }
  apply(changes: Change[]): World {
    const next = World.fork(this);
    for (const change of changes) { next.change(change); }
    return next;
  }
  // Whether `apply(changes)` would succeed, without building the next world.
  admits(changes: Change[]): boolean {
    const signatures = World.index(this.module), pending = new Map<string, number>();
    for (const change of changes) {
      if (change.kind === 'assert' || change.kind === 'retract') {
        if (!signatures.relations.has(change.call.name)) { return false; }
        continue;
      }
      if (!signatures.measures.has(change.call.name)) { return false; }
      try {
        const amount = change.value.kind === 'call' ? this.pending(pending, change.value) : World.literal(change.value);
        const previous = this.pending(pending, change.call), key = World.key(change.call);
        const value = change.kind === 'set' ? amount : change.kind === 'increase' ? previous + amount : previous - amount;
        if (!Number.isSafeInteger(value) || value < 0) { return false; }
        pending.set(key, value);
      } catch { return false; }
    }
    return true;
  }
  private pending(pending: Map<string, number>, call: Call): number {
    if (!World.index(this.module).measures.has(call.name)) { throw new Error(`Unknown measure ${call.name}`); }
    const key = World.key(call);
    return pending.has(key) ? pending.get(key)! : this.quantities.get(key)?.value ?? 0;
  }
  private add(key: string, call: Call) {
    this.facts.set(key, call);
    let named = this.byName.get(call.name);
    if (!named) { named = new Map(); this.byName.set(call.name, named); this.owned.add(call.name); }
    named.set(key, call);
  }
  // Copy-on-write: a forked world shares per-name maps with its parent until it first writes that name.
  private named(name: string): Map<string, Call> {
    if (this.owned.has(name)) { return this.byName.get(name)!; }
    const own = new Map(this.byName.get(name) ?? []);
    this.byName.set(name, own); this.owned.add(name);
    return own;
  }
  stamp(name: string): number { return this.stamps.get(name) ?? 0; }
  private change(change: Change) {
    this.memoKey = undefined; this.memoSnapshot = undefined;
    this.lists.delete(change.call.name); this.firsts.delete(change.call.name); this.amounts.delete(change.call.name);
    this.stamps.set(change.call.name, ++World.writes);
    const key = World.key(change.call);
    if (change.kind === 'assert' || change.kind === 'retract') {
      const relation = World.index(this.module).relations.get(change.call.name);
      if (!relation) { throw new Error(`Cannot write query or unknown relation ${change.call.name}`); }
      const named = this.named(change.call.name);
      if (this.facts.delete(key)) { named.delete(key); }
      if (change.kind === 'assert' && relation.exclusive) {
        for (const [k, call] of [...named]) {
          if (call.args.slice(0, -1).every((arg, i) => arg === change.call.args[i])) {
          named.delete(k); this.facts.delete(k);
        }
        }
      }
      if (change.kind === 'assert') { const call = World.copy(change.call); this.facts.set(key, call); named.set(key, call); }
      return;
    }
    const amount = change.value.kind === 'call' ? this.number(change.value) : World.literal(change.value);
    const previous = this.number(change.call);
    const value = change.kind === 'set' ? amount : change.kind === 'increase' ? previous + amount : previous - amount;
    if (!Number.isSafeInteger(value) || value < 0) { throw new Error(`Invalid quantity for ${World.format(change.call)}`); }
    this.quantities.delete(key);
    if (value !== 0) { this.quantities.set(key, { call: World.copy(change.call), value }); }
  }
  static literal(value: NumberValue): number {
    if (value.kind !== 'number') { throw new Error('Unresolved Deem expression'); }
    return value.value;
  }
  key(): string {
    this.memoKey ??= JSON.stringify({ relations: [...this.facts.keys()].sort(),
      measures: [...this.quantities].map(([key, entry]) => [key, entry.value]).sort() });
    return this.memoKey;
  }
  describe(): string[] {
    return [...[...this.facts.values()].map(World.format),
      ...[...this.quantities.values()].map(entry => `${World.format(entry.call)} = ${entry.value}`)].sort();
  }
}
