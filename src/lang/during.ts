import type * as ohm from 'ohm-js';
import type { Predicate } from './module';

type Node = ohm.Node;
type Shape = { kind: string; left?: Predicate; right?: Predicate; value?: unknown; operator?: string };

// What holds over everything written within it, said once (the machinery census of 24 November, OR-225: Gosse's
// Company's night had written "ghostOn(pentrice) and scene(pentrice) == n" 113 times, "not sceneOver(scene_n)" 71):
//   During ghostOn(pentrice) and scene(pentrice) == 2 {
//     Rule s2_open at wheel when not sceneBegun(scene_two) says "…" { … }
//     During sceneDone() and not sceneOver(scene_two) { Rule s2_close when true { … } }
//   }
// It lowers to the conjunction the author would have written out, its conjuncts first, in order, joined to the right.
// What is written within it may neither say its condition again nor deny it: either is a slip of the scope (a rule of
// scene 4 written inside scene 5's During could never be taken).
export class Durings {
  static readonly actions = { During: Durings.parse, DuringBody: Durings.body };
  static parse(_d: Node, when: Node, body: Node) {
    return { field: 'during', value: { when: Durings.ast(when) as Predicate, fields: Durings.ast(body) } };
  }
  static body(_open: Node, declarations: Node, _close: Node): unknown {
    return declarations.children.map(d => Durings.ast(d));
  }
  // The guard joined to a declaration's own condition, as written out.
  static within(guard: Predicate, own: Predicate | undefined, id: string): Predicate {
    const held = Durings.conjuncts(guard), mine = own ? Durings.conjuncts(own) : [];
    for (const p of mine) { Durings.check(held, p, id); }
    return [...held, ...mine].reduceRight<Predicate | undefined>((right, left) => right ? { kind: 'and', left, right }
      : left, undefined) ?? { kind: 'boolean', value: true } as Predicate;
  }
  private static check(held: Predicate[], p: Predicate, id: string) {
    if (held.some(g => Durings.text(g) === Durings.text(p))) { throw new Error(`${id} says again what its During says`); }
    if (held.some(g => Durings.denies(g, p) || Durings.denies(p, g))) {
      throw new Error(`${id} can never hold: it denies what its During says`);
    }
  }
  private static denies(a: Predicate, b: Predicate): boolean {
    const x = a as Shape, y = b as Shape;
    if (x.kind === 'not' && Durings.text(x.value as Predicate) === Durings.text(b)) { return true; }
    return x.kind === 'compare' && y.kind === 'compare' && x.operator === '==' && y.operator === '=='
      && Durings.text(x.left!) === Durings.text(y.left!) && Durings.literal(x.right) && Durings.literal(y.right)
      && Durings.text(x.right!) !== Durings.text(y.right!);
  }
  private static text(q: Predicate): string { return JSON.stringify(q); }
  private static literal(q?: Predicate): boolean { return (q as Shape | undefined)?.kind === 'number'; }
  private static conjuncts(p: Predicate): Predicate[] {
    const q = p as Shape;
    if (q.kind === 'and') { return [...Durings.conjuncts(q.left!), ...Durings.conjuncts(q.right!)]; }
    return q.kind === 'boolean' && q.value === true ? [] : [p];
  }
  private static ast(node: Node): unknown { return (node as unknown as { ast(): unknown }).ast(); }
}
