import type { Call, Predicate, Query, Value } from './module';
import type { World } from './world';

type Binding = Record<string, string>;
// The bindings that might satisfy a predicate: every one that does, and perhaps others. Facts are joined as
// World.solve joins them, and a query is asked through its body; but a negation, a comparison or a computed test is
// applied only once all its variables are bound, and is otherwise passed over, where World.solve would take a
// negation over what is not yet bound to mean that nothing at all is so. So a query can narrow what demand grounding
// proposes (see Operators.bindings) without being trusted to answer it: every binding is tested in full afterwards.
// (Mission 15's profile: an attack's opponents were every able group in the country, each then tested in turn.)
export class Candidates {
  static *of(world: World, p: Predicate, b: Binding): Generator<Binding> {
    switch (p.kind) {
      case 'and': for (const left of this.of(world, p.left, b)) { yield* this.of(world, p.right, left); } return;
      case 'or': yield* this.of(world, p.left, b); yield* this.of(world, p.right, b); return;
      case 'call': yield* this.call(world, p, b); return;
      default: if (!this.open(p, b) && !world.test(p, this.flat(b))) { return; } yield b;
    }
  }
  private static *call(world: World, p: Call, b: Binding): Generator<Binding> {
    const query = world.module.queries.find(q => q.name === p.name);
    if (query) { yield* this.ask(world, query, p.args.map(a => this.value(a, b)), b); return; }
    // Two parties are distinct when they are not the same one: a test of what is bound, proposing nothing.
    if (p.name === 'distinct') { if (this.open(p, b) || world.test(p, this.flat(b))) { yield b; } return; }
    yield* world.solve(p, b);
  }
  // A query's body, asked with the asker's arguments, and what its parameters came to given back to the asker.
  private static *ask(world: World, query: Query, args: string[], b: Binding): Generator<Binding> {
    const inner: Binding = {}, back: [string, string][] = [];
    query.parameters.forEach((parameter, i) => {
      const arg = args[i]!, local = `?${query.name}.${parameter.name}`;
      if (!arg.startsWith('?')) { inner[parameter.name] = arg; return; }
      inner[parameter.name] = local; back.push([arg, local]);
    });
    for (const found of this.of(world, query.body, inner)) {
      let next = b;
      for (const [outer, local] of back) {
        const value = found[local];
        if (value !== undefined && !value.startsWith('?')) { next = { ...next, [outer]: value }; }
      }
      yield next;
    }
  }
  // What each name stands for: within a query's body, a parameter the asker left open stands for the body's own
  // variable for it, which may since have been bound.
  private static value(a: string, b: Binding): string { const v = b[a] ?? a; return v.startsWith('?') ? b[v] ?? v : v; }
  private static flat(b: Binding): Binding {
    return Object.fromEntries(Object.keys(b).map(k => [k, this.value(k, b)]));
  }
  // Whether anything in it is not yet bound.
  private static open(p: Predicate | Value, b: Binding): boolean {
    switch (p.kind) {
      case 'call': return p.args.some(a => this.value(a, b).startsWith('?'));
      case 'not': return this.open(p.value, b);
      case 'and': case 'or': case 'compare': case 'arith': return this.open(p.left, b) || this.open(p.right, b);
      default: return false;
    }
  }
}
