import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../../src/lang/module-parser';
import { ModuleCompiler } from '../../src/lang/module-compiler';
import type { Module } from '../../src/lang/module';

// Is a Kyr declaration's validity monotone under composition? Every install of a world validates the shared rules
// again beside the module it brings (AX-03); validating them once, by reference, is sound only if a declaration valid
// in a module A stays valid in A joined with any B that A's names do not collide with. Over many small modules: A, a
// ruleset; B, a module written against it, drawn from fragments (new kinds, relations, entities, queries, rules and
// actions, some of them named as A's parameters are). For each pair, A's own declarations (its actions, rules,
// queries, observations and facts) are checked among every name of A+B. Found: monotone where a world is joined
// (ModuleCompiler's `joined`), and not where a module is first composed with its rules, because there an action's
// parameter may not be named as an entity is, and B may bring that entity. That one check is the whole of it.
class Fragments {
  private state: number;
  constructor(seed: number) { this.state = seed; }
  next(n: number): number {
    this.state = (Math.imul(this.state, 1103515245) + 12345) >>> 0;
    return (this.state >>> 8) % n;
  }
  pick<T>(xs: readonly T[]): T { return xs[this.next(xs.length)]!; }
  // A: a small ruleset, its parameters named from a few names B may also use.
  static readonly params = ['actor', 'origin', 'destination', 'who', 'where'] as const;
  ruleset(): string {
    const [g, p, q] = [this.pick(Fragments.params), this.pick(['origin', 'where', 'from']), this.pick(['destination', 'to'])];
    const d = q === p ? 'other' : q;
    return `Module a "A" {
  Kind group. Kind place. Relation at(group, place) exclusive. Relation route(place, place). Relation been(group, place).
  Entity home: place "Home". Entity yard: place "Yard". Entity party: group "Party".
  Initially Assert at(party, home). Initially Assert route(home, yard).
  Query near(x: place, y: place) means route(x, y) or route(y, x).
  Rule seen_${this.next(9)} when at(?c, ?p) and not been(?c, ?p) { Assert been(?c, ?p). }
  Action go(${g}: group, ${p}: place, ${d}: place) "Go to {${d}}" {
    Requires at(${g}, ${p}) and near(${p}, ${d}). On success { Assert at(${g}, ${d}). }
  }
  Goal at(party, yard).
}`;
  }
  // B: what a module written against A might declare, by fragment.
  module(): string {
    const parts: string[] = [];
    for (let i = 0, n = 1 + this.next(5); i < n; i++) { parts.push(this.fragment(i)); }
    return `Module b "B" {\n  ${parts.join('\n  ')}\n  Goal at(party, yard).\n}`;
  }
  private fragment(i: number): string {
    const name = this.pick([...Fragments.params, `room${i}`, `band${i}`]);
    switch (this.next(6)) {
      case 0: return `Entity ${name}: ${this.pick(['place', 'group'])} "${name}".`;
      case 1: return `Kind thing${i}. Relation holds${i}(group, thing${i}). Entity ${name}: thing${i} "${name}".`;
      case 2: return `Query far${i}(x: place, y: place) means not near(x, y).`;
      case 3: return `Rule b_${i} when at(?c, ?p) and route(?p, ?q) { Assert been(?c, ?q). }`;
      case 4: return `Relation open${i}(place). Initially Assert open${i}(yard).`;
      default: return `Action rest${i}(actor: group) "Rest" { Requires at(actor, home). On success { Assert been(actor, home). } }`;
    }
  }
  // The two joined as a world joins installations: every list end to end, A first.
  static join(a: Module, b: Module): Module {
    return { ...a, kinds: [...new Set([...a.kinds, ...b.kinds])], entities: [...a.entities, ...b.entities],
      relations: [...a.relations, ...b.relations], measures: [...a.measures, ...b.measures],
      queries: [...a.queries, ...b.queries], actions: [...a.actions, ...b.actions],
      rules: [...a.rules ?? [], ...b.rules ?? []], observations: [...a.observations ?? [], ...b.observations ?? []],
      initial: [...a.initial, ...b.initial] };
  }
  // A's own declarations, checked among every name of A+B: B's names kept, B's own behaviour left out.
  static ownAmong(a: Module, b: Module): Module {
    const all = this.join(a, b);
    return { ...all, queries: [...a.queries, ...b.queries], actions: a.actions, rules: a.rules ?? [],
      observations: a.observations ?? [], initial: a.initial };
  }
  static valid(m: Module, joined: boolean): string | undefined {
    try { new ModuleCompiler([], joined).validate(structuredClone(m)); return undefined; }
    catch (error) { return error instanceof Error ? error.message : String(error); }
  }
  // Whether A+B's names collide (a uniqueness the composition checks, not a declaration's validity).
  static collide(a: Module, b: Module): boolean {
    const all = this.join(a, b), ids = all.entities.map(e => e.id);
    const names = [...all.relations, ...all.measures, ...all.queries].map(s => s.name);
    return new Set(ids).size < ids.length || new Set(names).size < names.length;
  }
  static survey(seed: number, n: number, joined: boolean) {
    const f = new Fragments(seed), broken = new Map<string, number>();
    let checked = 0;
    for (let i = 0; i < n; i++) {
      const a = ModuleParser.parse(f.ruleset()), b = ModuleParser.parse(f.module());
      if (Fragments.valid(a, joined) || Fragments.collide(a, b)) { continue; }
      checked++;
      const why = Fragments.valid(Fragments.ownAmong(a, b), joined);
      if (why) { broken.set(why.replace(/\b(actor|origin|destination|who|where)\b/, '<param>'), (broken.get(why) ?? 0) + 1); }
    }
    return { checked, broken: [...broken.keys()] };
  }
}

describe('Kyr validity under composition', () => {
  it('is monotone where a world is joined: what is valid in A alone stays valid among the names of A+B', () => {
    const { checked, broken } = Fragments.survey(7, 160, true);
    expect(checked).toBeGreaterThan(100);
    expect(broken).toEqual([]);
  });
  it('is not monotone where a module is first composed with its rules: an entity B brings may shadow A\'s parameter', () => {
    const { checked, broken } = Fragments.survey(7, 160, false);
    expect(checked).toBeGreaterThan(100);
    expect(broken).toEqual(['Parameter shadows entity <param>']);
  });
});
