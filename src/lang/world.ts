import type { Call, Change, Module, NumberValue, Predicate, Value, WorldState } from './module';

export class World {
  private state: WorldState;
  private facts: Set<string>;
  private quantities: Map<string, number>;
  private index?: Map<string, Call[]>;
  private static readonly open = new WeakMap<object, boolean>();
  constructor(readonly module: Module, state: WorldState = { relations: [], measures: [] }) {
    this.state = structuredClone(state);
    this.facts = new Set(this.state.relations.map(World.key));
    this.quantities = new Map(this.state.measures.map(m => [World.key(m.call), m.value]));
  }
  get snapshot(): WorldState { return structuredClone(this.state); }
  static key(call: Call): string { return JSON.stringify([call.name, ...call.args]); }
  static format(call: Call): string { return `${call.name}(${call.args.join(', ')})`; }
  private bind(call: Call, bindings: Record<string, string>): Call {
    return { ...call, args: call.args.map(arg => bindings[arg] ?? arg) };
  }
  number(value: Value, bindings: Record<string, string> = {}): number {
    if (value.kind === 'number') { return value.value; }
    if (value.kind === 'deem') { throw new Error('Deem module values must be instantiated before execution'); }
    if (!this.module.measures.some(m => m.name === value.name)) { throw new Error(`Unknown measure ${value.name}`); }
    const key = World.key(this.bind(value, bindings));
    return this.quantities.get(key) ?? 0;
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
  private facts$(name: string): Call[] {
    if (!this.index) {
      this.index = new Map();
      for (const call of this.state.relations) {
        if (!this.index.has(call.name)) { this.index.set(call.name, []); }
        this.index.get(call.name)!.push(call);
      }
    }
    return this.index.get(name) ?? [];
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
    const query = this.module.queries.find(q => q.name === p.name);
    if (query || !args.some(a => a.startsWith('?'))) {
      if (args.some(a => a.startsWith('?'))) { throw new Error(`Query ${p.name} needs bound arguments`); }
      if (this.closed({ ...p, args }, {})) { yield b; }
      return;
    }
    if (!this.module.relations.some(r => r.name === p.name)) { throw new Error(`Unknown predicate ${p.name}`); }
    for (const fact of this.facts$(p.name)) {
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
        const query = this.module.queries.find(q => q.name === call.name);
        if (query) {
          const argumentsByName: Record<string, string> = {};
          query.parameters.forEach((parameter, index) => { argumentsByName[parameter.name] = call.args[index]!; });
          return this.test(query.body, argumentsByName);
        }
        if (!this.module.relations.some(r => r.name === call.name)) { throw new Error(`Unknown predicate ${call.name}`); }
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
    const next = new World(this.module, this.state);
    for (const change of changes) { next.change(change); }
    return next;
  }
  private change(change: Change) {
    this.index = undefined;
    const key = World.key(change.call);
    if (change.kind === 'assert' || change.kind === 'retract') {
      const relation = this.module.relations.find(r => r.name === change.call.name);
      if (!relation) { throw new Error(`Cannot write query or unknown relation ${change.call.name}`); }
      this.state.relations = this.state.relations.filter(call => {
        if (World.key(call) === key) { this.facts.delete(key); return false; }
        const sameSubject = call.name === change.call.name
          && call.args.slice(0, -1).every((arg, i) => arg === change.call.args[i]);
        const removed = change.kind === 'assert' && relation.exclusive && sameSubject;
        if (removed) { this.facts.delete(World.key(call)); }
        return !removed;
      });
      if (change.kind === 'assert') { this.state.relations.push(structuredClone(change.call)); this.facts.add(key); }
      return;
    }
    const amount = change.value.kind === 'call' ? this.number(change.value) : World.literal(change.value);
    const previous = this.number(change.call);
    const value = change.kind === 'set' ? amount : change.kind === 'increase' ? previous + amount : previous - amount;
    if (!Number.isSafeInteger(value) || value < 0) { throw new Error(`Invalid quantity for ${World.format(change.call)}`); }
    this.state.measures = this.state.measures.filter(entry => World.key(entry.call) !== key);
    if (value === 0) { this.quantities.delete(key); } else { this.quantities.set(key, value); }
    if (value !== 0) { this.state.measures.push({ call: structuredClone(change.call), value }); }
  }
  static literal(value: NumberValue): number {
    if (value.kind !== 'number') { throw new Error('Unresolved Deem expression'); }
    return value.value;
  }
  key(): string {
    return JSON.stringify({ relations: this.state.relations.map(World.key).sort(),
      measures: this.state.measures.map(entry => [World.key(entry.call), entry.value]).sort() });
  }
  describe(): string[] {
    return [...this.state.relations.map(World.format),
      ...this.state.measures.map(entry => `${World.format(entry.call)} = ${entry.value}`)].sort();
  }
}
