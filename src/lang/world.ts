import type { Call, Change, Module, NumberValue, Predicate, Signature, Value, WorldState } from './module';

// Name lookups for a module's signatures. Modules are assembled before execution; a changed signature list
// (by identity or length) rebuilds the index.
interface Signatures {
  relations: Map<string, Signature>; measures: Set<string>; queries: Map<string, Module['queries'][number]>;
  source: [Signature[], Signature[], Module['queries']]; lengths: [number, number, number] }
type Measure = { call: Call; value: number };

// An immutable view of world state. Facts and measures are kept by name, each name's by key, and `apply` forks a
// world by sharing every name's map with it until it first writes that name: a change costs what it changes and the
// number of names, not the number of facts (Mission 15's profile: a country of 130,000 facts copied whole for every
// change). Calls held by a world are never mutated.
export class World {
  private byName: Map<string, Map<string, Call>>;
  private measuresByName: Map<string, Map<string, Measure>>;
  private owned = new Set<string>();
  private ownedMeasures = new Set<string>();
  private count = 0;
  private measureCount = 0;
  // A globally unique stamp per write to each relation or measure name, so views derived from some names can tell
  // whether those names changed between two worlds.
  private stamps = new Map<string, number>();
  private static writes = 0;
  // Which line of worlds this one is of: a world built from state starts one, and the worlds forked from it are of
  // it; only between worlds of one line do stamps say what changed.
  private lineage: object = {};
  // The world's content as two order-free sums of each fact's and measure's hash, kept as they are written, so that
  // telling two worlds apart (a planner's visited states) never sorts every fact (see key).
  private sums: [number, number] = [0, 0];
  private memoSnapshot?: WorldState;
  // Read-only views by relation name (and first argument), and of measures by name, built on first use.
  private lists = new Map<string, Call[]>();
  private firsts = new Map<string, Map<string, Call[]>>();
  private amounts = new Map<string, Measure[]>();
  private static readonly open = new WeakMap<object, boolean>();
  private static readonly signatures = new WeakMap<Module, Signatures>();
  constructor(readonly module: Module, state: WorldState = { relations: [], measures: [] }) {
    this.byName = new Map(); this.measuresByName = new Map();
    for (const call of state.relations) { this.add(World.key(call), World.copy(call)); }
    for (const m of state.measures) { this.put(World.key(m.call), { call: World.copy(m.call), value: m.value }); }
  }
  private static fork(from: World): World {
    const next = Object.create(World.prototype) as World;
    (next as { module: Module }).module = from.module;
    next.byName = new Map(from.byName); next.measuresByName = new Map(from.measuresByName);
    next.owned = new Set(); next.ownedMeasures = new Set();
    next.count = from.count; next.measureCount = from.measureCount;
    next.stamps = new Map(from.stamps);
    next.sums = [...from.sums];
    next.lineage = from.lineage;
    next.lists = new Map(); next.firsts = new Map(); next.amounts = new Map();
    return next;
  }
  private static copy(call: Call): Call { return { ...call, args: [...call.args] }; }
  // Every fact and measure, as the world holds them: for reading only (`snapshot` is a copy to keep or change).
  get view(): Readonly<WorldState> {
    this.memoSnapshot ??= { relations: this.allFacts(), measures: this.allMeasures() };
    return this.memoSnapshot;
  }
  get snapshot(): WorldState {
    this.memoSnapshot ??= { relations: this.allFacts(), measures: this.allMeasures() };
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
    if (!list) { list = [...this.measuresByName.get(name)?.values() ?? []]; this.amounts.set(name, list); }
    return list;
  }
  // Whether the module declares this relation.
  relates(name: string): boolean { return World.index(this.module).relations.has(name); }
  // Whether the fact with this key (see `key`) currently holds.
  holds(key: string): boolean { return this.byName.get(World.nameOf(key))?.has(key) ?? false; }
  // A key's relation or measure name: a key is the JSON of [name, ...args], and no name holds a quote.
  private static nameOf(key: string): string { return key.slice(2, key.indexOf('"', 2)); }
  private allFacts(): Call[] { return [...this.byName.values()].flatMap(m => [...m.values()]); }
  private allMeasures(): Measure[] { return [...this.measuresByName.values()].flatMap(m => [...m.values()]); }
  private measure(call: Call): Measure | undefined { return this.measuresByName.get(call.name)?.get(World.key(call)); }
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
    if (value.kind === 'arith') {
      const left = this.number(value.left, bindings), right = this.number(value.right, bindings);
      return value.op === '+' ? left + right : value.op === '-' ? left - right : left * right;
    }
    if (!World.index(this.module).measures.has(value.name)) { throw new Error(`Unknown measure ${value.name}`); }
    const call = this.bind(value, bindings);
    if (call.name === 'dice' && call.args[0] !== 'clock') { return this.die(call.args[0]!); }
    return this.measure(call)?.value ?? 0;
  }
  // Each thing's own die for the watch, 1 to 100 (dice(?room)): drawn from the watch's die and the thing's name, so
  // that two rooms, or two people, left to chance in the same watch do not come out alike, and the same watch comes
  // out the same way again.
  private die(of: string): number {
    let hash = 2166136261;
    const key = `${this.reading('dice')}:${this.reading('watch')}:${of}`;
    for (let i = 0; i < key.length; i++) { hash = Math.imul(hash ^ key.charCodeAt(i), 16777619); }
    return ((hash >>> 0) % 100) + 1;
  }
  private reading(name: string): number {
    return this.measure({ kind: 'call', name, args: ['clock'] })?.value ?? 0;
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
    const signatures = World.index(this.module), query = signatures.queries.get(p.name);
    if (query && args.some(a => a.startsWith('?'))) { yield* this.ask(query, args, b); return; }
    if (query || !args.some(a => a.startsWith('?'))) {
      if (this.closed({ ...p, args }, {})) { yield b; }
      return;
    }
    if (!signatures.relations.has(p.name)) { throw new Error(`Unknown predicate ${p.name}`); }
    if (p.name === 'distinct') { throw new Error('distinct compares two bound parties'); }
    // By the first argument's index when it is known; a binding is copied only for a fact that matches.
    const facts = args[0]!.startsWith('?') ? this.related(p.name) : this.related(p.name, args[0]!);
    for (const fact of facts) {
      const next = World.match(fact, args, b);
      if (next) { yield next; }
    }
  }
  // A query asked of someone not yet known ("held(p) means looks(?w, p)"): each binding of its body that satisfies it,
  // with the asker's variables bound to what the query's parameters came to be.
  private *ask(query: Module['queries'][number], args: string[], b: Record<string, string>):
    Generator<Record<string, string>> {
    const inner: Record<string, string> = {}, back: [string, string][] = [];
    query.parameters.forEach((parameter, i) => {
      const arg = args[i]!, local = `?${query.name}.${parameter.name}`;
      if (!arg.startsWith('?')) { inner[parameter.name] = arg; return; }
      inner[parameter.name] = local;
      back.push([arg, local]);
    });
    for (const found of this.solve(query.body, inner)) {
      let next = b;
      for (const [outer, local] of back) {
        const value = found[local];
        if (value !== undefined && !value.startsWith('?')) { next = { ...next, [outer]: value }; }
      }
      yield next;
    }
  }
  private static match(fact: Call, args: string[], b: Record<string, string>): Record<string, string> | undefined {
    let next: Record<string, string> | undefined;
    for (let i = 0; i < fact.args.length; i++) {
      const arg = args[i]!, value = fact.args[i]!;
      if (!arg.startsWith('?')) { if (arg !== value) { return undefined; } continue; }
      const have = (next ?? b)[arg];
      if (have !== undefined) { if (have !== value) { return undefined; } continue; }
      next ??= { ...b }; next[arg] = value;
    }
    return next ?? b;
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
        return this.byName.get(call.name)?.has(World.key(call)) ?? false;
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
        const amount = change.value.kind === 'call' ? this.pending(pending, change.value)
          : change.value.kind === 'arith' ? this.number(change.value) : World.literal(change.value);
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
    return pending.has(key) ? pending.get(key)! : this.measure(call)?.value ?? 0;
  }
  private add(key: string, call: Call) {
    let named = this.byName.get(call.name);
    if (!named) { named = new Map(); this.byName.set(call.name, named); this.owned.add(call.name); }
    if (!named.has(key)) { this.sum(key, 1); this.count++; }
    named.set(key, call);
  }
  private put(key: string, m: Measure) {
    let named = this.measuresByName.get(m.call.name);
    if (!named) { named = new Map(); this.measuresByName.set(m.call.name, named); this.ownedMeasures.add(m.call.name); }
    if (!named.has(key)) { this.measureCount++; }
    named.set(key, m); this.sum(`${key}=${m.value}`, 1);
  }
  // Copy-on-write: a forked world shares per-name maps with its parent until it first writes that name.
  private named(name: string): Map<string, Call> {
    if (this.owned.has(name)) { return this.byName.get(name)!; }
    const own = new Map(this.byName.get(name) ?? []);
    this.byName.set(name, own); this.owned.add(name);
    return own;
  }
  private namedMeasures(name: string): Map<string, Measure> {
    if (this.ownedMeasures.has(name)) { return this.measuresByName.get(name)!; }
    const own = new Map(this.measuresByName.get(name) ?? []);
    this.measuresByName.set(name, own); this.ownedMeasures.add(name);
    return own;
  }
  stamp(name: string): number { return this.stamps.get(name) ?? 0; }
  private change(change: Change) {
    this.memoSnapshot = undefined;
    this.lists.delete(change.call.name); this.firsts.delete(change.call.name); this.amounts.delete(change.call.name);
    this.stamps.set(change.call.name, ++World.writes);
    const key = World.key(change.call);
    if (change.kind === 'assert' || change.kind === 'retract') {
      const relation = World.index(this.module).relations.get(change.call.name);
      if (!relation) { throw new Error(`Cannot write query or unknown relation ${change.call.name}`); }
      const named = this.named(change.call.name);
      if (named.delete(key)) { this.sum(key, -1); this.count--; }
      if (change.kind === 'assert' && relation.exclusive) {
        for (const [k, call] of [...named]) {
          if (call.args.slice(0, -1).every((arg, i) => arg === change.call.args[i])) {
          named.delete(k); this.sum(k, -1); this.count--;
        }
        }
      }
      if (change.kind === 'assert') {
        const call = World.copy(change.call); named.set(key, call); this.sum(key, 1); this.count++;
      }
      return;
    }
    const amount = change.value.kind === 'call' || change.value.kind === 'arith' ? this.number(change.value)
      : World.literal(change.value);
    const previous = this.number(change.call);
    const value = change.kind === 'set' ? amount : change.kind === 'increase' ? previous + amount : previous - amount;
    // A count never goes below nothing; a quantity set outright may (selm weighs less than nothing).
    if (!Number.isSafeInteger(value) || (value < 0 && change.kind !== 'set')) {
      throw new Error(`Invalid quantity for ${World.format(change.call)}`);
    }
    const named = this.namedMeasures(change.call.name), held = named.get(key);
    if (held) { named.delete(key); this.sum(`${key}=${held.value}`, -1); this.measureCount--; }
    if (value !== 0) {
      named.set(key, { call: World.copy(change.call), value }); this.sum(`${key}=${value}`, 1); this.measureCount++;
    }
  }
  static literal(value: NumberValue): number {
    if (value.kind !== 'number') { throw new Error('Unresolved Deem expression'); }
    return value.value;
  }
  // The world's content, as a short key: the same for worlds with the same facts and measures, different (but for a
  // chance of about one in 2^64) for any others. Read at once from the sums kept as facts are written.
  key(): string {
    return `${this.count}.${this.measureCount}.${(this.sums[0] >>> 0).toString(36)}.${(this.sums[1] >>> 0)
      .toString(36)}`;
  }
  // Whether another world holds exactly the same facts and measures: a full comparison, not a key's.
  sameAs(other: World): boolean {
    if (this.count !== other.count || this.measureCount !== other.measureCount) { return false; }
    for (const [name, facts] of this.byName) {
      const theirs = other.byName.get(name);
      if (theirs === facts) { continue; }
      for (const key of facts.keys()) { if (!theirs?.has(key)) { return false; } }
    }
    for (const [name, measures] of this.measuresByName) {
      const theirs = other.measuresByName.get(name);
      if (theirs === measures) { continue; }
      for (const [key, m] of measures) { if (theirs?.get(key)?.value !== m.value) { return false; } }
    }
    return true;
  }
  // A fact or measure's two hashes (FNV-1a from two offsets), added to the sums as it is written or taken away.
  private sum(text: string, sign: 1 | -1) {
    let a = 0x811c9dc5, b = 0x9747b28c;
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      a = Math.imul(a ^ c, 0x01000193); b = Math.imul(b ^ c, 0x5bd1e995);
    }
    this.sums[0] = (this.sums[0] + sign * a) | 0; this.sums[1] = (this.sums[1] + sign * b) | 0;
  }
  // Every fact and measure as a line, sorted; or only those of some names.
  describe(names?: Set<string>): string[] {
    const facts = names ? [...names].flatMap(n => [...this.byName.get(n)?.values() ?? []]) : this.allFacts();
    const measures = names ? [...names].flatMap(n => [...this.measuresByName.get(n)?.values() ?? []])
      : this.allMeasures();
    return [...facts.map(World.format), ...measures.map(entry => `${World.format(entry.call)} = ${entry.value}`)].sort();
  }
  // What changed from an earlier world to this one, as the changes that make the one the other: facts taken away, then
  // facts written, then measures set; only the names whose maps the two do not share are looked at.
  changesSince(prior: World): Change[] {
    const retracted: Change[] = [], asserted: Change[] = [], set: Change[] = [];
    for (const name of new Set([...prior.byName.keys(), ...this.byName.keys()])) {
      const was = prior.byName.get(name), is = this.byName.get(name);
      if (was === is) { continue; }
      for (const [key, call] of was ?? []) { if (!is?.has(key)) { retracted.push({ kind: 'retract', call }); } }
      for (const [key, call] of is ?? []) { if (!was?.has(key)) { asserted.push({ kind: 'assert', call }); } }
    }
    for (const [name, is] of this.measuresByName) {
      const was = prior.measuresByName.get(name);
      if (was === is) { continue; }
      for (const [key, m] of is) {
        if (was?.get(key)?.value !== m.value) { set.push({ kind: 'set', call: m.call, value: { kind: 'number', value: m.value } }); }
      }
    }
    return [...retracted, ...asserted, ...set];
  }
  // What changed from an earlier world to this one, as "- fact" and "+ fact" lines: of the same line, only what was
  // written since is compared; of another, everything.
  changes(from: World): string[] {
    const names = from.lineage === this.lineage ? new Set([...this.stamps.keys(), ...from.stamps.keys()]
      .filter(n => this.stamp(n) !== from.stamp(n))) : undefined;
    const previous = from.describe(names), next = this.describe(names);
    const was = new Set(previous), is = new Set(next);
    return [...previous.filter(s => !is.has(s)).map(s => `- ${s}`), ...next.filter(s => !was.has(s)).map(s => `+ ${s}`)];
  }
}
