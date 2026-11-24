import type { Call, Change, Operator, Predicate } from '../lang/module';

// The ways of one choice (OR-242): acts each of which, done, rules the other out, as the author writes a decision in
// Kyr. Each asserts what the other's requirement says must not hold (letting Ifan's boat through asserts letThrough,
// which keeping the gate shut requires not, and the other way about). Led together or not at all: after Ifan was
// spoken to, the four had led the boat for "wind the gate up" alone, and "keep it shut" was under the boat's look (the
// first blind cold play of the page, P142-144). Not acts that only use up the same thing (taking a thing, eating it):
// those are a thing's uses, not a decision.
export class Alternatives {
  // For each act offered, the others of its choice, by command.
  static of(rows: readonly { choice: { id: string }; action: Pick<Operator, 'requires' | 'success'> }[]):
    Map<string, string[]> {
    const asserts = new Map(rows.map(r => [r.choice.id, new Set(this.asserted(r.action.success ?? []))]));
    const forbids = new Map(rows.map(r => [r.choice.id, new Set(this.forbidden(r.action.requires))]));
    const by = new Map<string, string[]>();
    for (const [id, keys] of forbids) { for (const k of keys) { by.set(k, [...by.get(k) ?? [], id]); } }
    const out = new Map<string, string[]>();
    for (const [a, keys] of asserts) {
      const others = [...new Set([...keys].flatMap(k => by.get(k) ?? []))]
        .filter(b => b !== a && [...asserts.get(b) ?? []].some(k => forbids.get(a)?.has(k)));
      if (others.length) { out.set(a, others); }
    }
    return out;
  }
  private static key(c: Call): string { return `${c.name}(${c.args.join(',')})`; }
  private static asserted(changes: readonly Change[]): string[] {
    return changes.flatMap(c => c.kind === 'assert' ? [this.key(c.call)] : []);
  }
  // What its requirement says must not hold, among what all of it asks (its conjuncts).
  private static forbidden(p: Predicate | undefined): string[] {
    if (!p) { return []; }
    if (p.kind === 'and') { return [...this.forbidden(p.left), ...this.forbidden(p.right)]; }
    return p.kind === 'not' && p.value.kind === 'call' ? [this.key(p.value)] : [];
  }
}
