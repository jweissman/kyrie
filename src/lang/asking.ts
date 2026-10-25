import type { Predicate, Query } from './module';
import type { World } from './world';
import { QueryModes } from './query-modes';
import { EntityIndex } from './entity-index';

type Binding = Record<string, string>;
// How the world answers a conjunction, and a query asked of what is not yet known (see World.solve): so that the
// answer to an open question is the same as asking it of each thing in turn (Mission 15's independent audit, F2).
export class Asking {
  // The parts of a conjunction, in order; but where one reads under a negation what another would bind (`not
  // marked(?t) and candidate(?t)`), it is asked once that is bound, not of nothing at all (see QueryModes).
  static *conjunction(world: World, p: Extract<Predicate, { kind: 'and' | 'or' }>, b: Binding): Generator<Binding> {
    // Only a name read under a negation in one part and named in another can make the order matter, and only if it is
    // not bound yet as the conjunction is asked (a precondition's are, by its action's binding).
    const parts = this.conjuncts(p), risky = this.risky(world, parts);
    if (!risky.some(a => this.free(a, b) !== undefined)) { yield* this.ordered(world, parts, b, 0); return; }
    yield* this.parts(world, parts, b);
  }
  private static *ordered(world: World, parts: readonly Predicate[], b: Binding, at: number): Generator<Binding> {
    if (at === parts.length) { yield b; return; }
    for (const found of world.solve(parts[at]!, b)) { yield* this.ordered(world, parts, found, at + 1); }
  }
  private static readonly risks = new WeakMap<readonly Predicate[], string[]>();
  private static risky(world: World, parts: readonly Predicate[]): string[] {
    let risky = this.risks.get(parts);
    if (!risky) {
      const m = world.module;
      risky = [...new Set(parts.flatMap((part, i) => QueryModes.negated(m, part).filter(a =>
        parts.some((q, j) => j !== i && QueryModes.named(m, q).includes(a)))))];
      this.risks.set(parts, risky);
    }
    return risky;
  }
  // From `at` on: the next part in order if it is ready, without copying; another, put first, if that one is not.
  private static *parts(world: World, parts: readonly Predicate[], b: Binding, at = 0): Generator<Binding> {
    if (at === parts.length) { yield b; return; }
    const i = this.ready(world, parts, b, at);
    const rest = i === at ? parts : [...parts.slice(0, at), parts[i]!, ...parts.slice(at, i), ...parts.slice(i + 1)];
    for (const found of world.solve(rest[at]!, b)) { yield* this.parts(world, rest, found, at + 1); }
  }
  // The first part from `at` that reads under a negation nothing another part would bind; the first, if none does
  // not.
  private static ready(world: World, parts: readonly Predicate[], b: Binding, at: number): number {
    const span = { parts, at };
    for (let i = at; i < parts.length; i++) { if (!this.blocked(world, b, span, i)) { return i; } }
    return at;
  }
  // Whether a part reads under a negation something another part still to be asked would bind.
  private static blocked(world: World, b: Binding, span: { parts: readonly Predicate[]; at: number }, i: number):
    boolean {
    const { parts, at } = span;
    for (const a of QueryModes.negated(world.module, parts[i]!)) {
      const v = this.free(a, b);
      if (v === undefined) { continue; }
      for (let j = at; j < parts.length; j++) {
        if (j !== i && QueryModes.named(world.module, parts[j]!).some(x => this.free(x, b) === v)) { return true; }
      }
    }
    return false;
  }
  // The variable a name stands for, if it is not yet bound (within a query's body, a parameter stands for the body's
  // own variable for it).
  private static free(a: string, b: Binding): string | undefined {
    const v = b[a] ?? a;
    return v.startsWith('?') && b[v] === undefined ? v : undefined;
  }
  private static readonly flattened = new WeakMap<Predicate, Predicate[]>();
  private static conjuncts(p: Predicate): Predicate[] {
    let parts = this.flattened.get(p);
    if (!parts) {
      parts = p.kind === 'and' ? [...this.conjuncts(p.left), ...this.conjuncts(p.right)] : [p];
      this.flattened.set(p, parts);
    }
    return parts;
  }
  // A query asked of someone not yet known ("held(p) means looks(?w, p)"): each binding of its body that satisfies it,
  // with the asker's variables bound to what the query's parameters came to be. One variable asked of twice is one
  // variable (`diagonal(?t, ?t)`); a parameter the body is not sure to bind ranges over the entities of its type.
  static *ask(world: World, query: Query, args: string[], b: Binding): Generator<Binding> {
    const inner: Binding = {}, back: [string, string][] = [], locals = new Map<string, string>();
    query.parameters.forEach((parameter, i) => {
      const arg = args[i]!;
      if (!arg.startsWith('?')) { inner[parameter.name] = arg; return; }
      let local = locals.get(arg);
      if (!local) { local = `?${query.name}.${parameter.name}`; locals.set(arg, local); back.push([arg, local]); }
      inner[parameter.name] = local;
    });
    const ranged = QueryModes.unbound(world.module, query).filter(name => inner[name]!.startsWith('?'));
    for (const start of this.ranges(world, query, ranged, inner)) {
      for (const found of world.solve(query.body, start)) {
        let next = b;
        for (const [outer, local] of back) {
          const value = found[local];
          if (value !== undefined && !value.startsWith('?')) { next = { ...next, [outer]: value }; }
        }
        yield next;
      }
    }
  }
  private static *ranges(world: World, query: Query, names: string[], inner: Binding): Generator<Binding> {
    const [name, ...rest] = names;
    if (name === undefined) { yield inner; return; }
    const local = inner[name]!, type = query.parameters.find(q => q.name === name)!.type;
    if (inner[local] !== undefined) { yield* this.ranges(world, query, rest, inner); return; }
    const entities = world.module.entities;
    for (const e of type === 'entity' ? entities : EntityIndex.of(entities).typed(type)) {
      yield* this.ranges(world, query, rest, { ...inner, [local]: e.id });
    }
  }
}
