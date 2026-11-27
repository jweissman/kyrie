import { ComputedRelations } from '../lang/computed-relations';
import { WorldReads } from '../lang/world-reads';
import type { Call, Module, Operator, Predicate, Value, World } from '../lang';

// What every act of a schema needs of the world, as it is asked: the parts of its precondition's top conjunction that
// hold of any binding it grounds to, read from the compiled precondition (never declared): each part it asks of the
// actor or of named things alone (closed: able(actor), dark()), and the facts it must find (a relation asked with its
// parameters left open: a buyer at the site, a guard on a way), split by what it asks of the place the actor stands at
// (at(actor, site), and every fact that names the site) and what it asks apart from it.
// Asked in turn: what is closed, then the facts apart from the place, then every fact the place first.
interface Asks { parts: Predicate[] }

// Whether a schema's every need can be met in a world, asked before it is grounded: where one is not, it grounds to
// nothing, and what was read to find so is all its grounding read (see KeptGroundings). A schema that needs the
// company to own a coin, or someone here who buys, had read where the company stands on the way to finding there was
// none, so that every move asked it again: some 140 schemas read at(party, ?p), and of a walk's 6,656 groundings asked
// again after a move, 6,034 gave what they had (OR-1600). Now one whose need apart from the place is unmet reads
// nothing of where the company is, and a move leaves it as it was; one whose need of the place is unmet is asked again
// only what it asks of the new place. Each part holds of any binding that holds, so an unmet one is proof that none
// does: never a guess.
export class SchemaAsks {
  private static readonly read = new WeakMap<Module, WeakMap<Operator, Asks>[]>();
  // Whether an act of this schema may hold for the actor (bound, where given): false only where a need is unmet, and
  // then what was read to find that one unmet is noted in the reading under way, and nothing of the needs met before
  // it: the one unmet settles it alone.
  static met(world: World, schema: Operator, actor?: string): boolean {
    const asks = this.of(world, schema, actor !== undefined);
    const bound: Record<string, string> = actor !== undefined ? { actor } : {};
    for (const part of asks.parts) {
      const asked = WorldReads.apart(() => world.test(part, bound));
      if (!asked.value) { WorldReads.noted(asked); return false; }
    }
    return true;
  }
  // What a grounding gives, read apart from any reading under way (KYRIE_CHECK_GATES: a schema found unmet grounded
  // anyway, to prove none of it holds, reading nothing into what is kept of it).
  static aside<T>(read: () => T): T { return WorldReads.apart(read).value; }
  private static of(world: World, schema: Operator, bound: boolean): Asks {
    const byModule = this.read.get(world.module) ?? [new WeakMap(), new WeakMap()];
    this.read.set(world.module, byModule);
    const kept = byModule[bound ? 1 : 0]!, had = kept.get(schema);
    if (had) { return had; }
    const asks = this.made(world, schema, bound);
    kept.set(schema, asks);
    return asks;
  }
  private static made(world: World, schema: Operator, bound: boolean): Asks {
    const open = new Set((schema.parameters ?? []).map(p => p.name).filter(n => !bound || n !== 'actor'));
    const closed: Predicate[] = [], facts: Call[] = [];
    for (const part of this.conjuncts(schema.requires)) {
      if (part.kind === 'call' && world.relates(part.name) && !ComputedRelations.has(part.name)) {
        facts.push({ ...part, args: part.args.map(a => open.has(a) ? `?$${a}` : a) });
      } else if (this.names(part).every(n => !open.has(n) && !n.startsWith('?'))) { closed.push(part); }
    }
    const sites = new Set(bound ? facts.filter(f => f.name === 'at' && f.args[0] === 'actor').map(f => f.args[1]!)
      : []);
    const here = facts.filter(f => f.args.some(a => sites.has(a)));
    const others = facts.filter(f => !here.includes(f)), apart = this.joined(this.ordered(others));
    const place = here.length ? this.joined(this.ordered([...here, ...others])) : undefined;
    const parts = [this.joined(closed), apart, place].filter((p): p is Predicate => !!p);
    return { parts };
  }
  // The facts in an order that joins each through what is already bound (the actor, a thing named, or a variable an
  // earlier one bound), so that none is asked of a whole relation where a bound name would pick out a few of its facts;
  // and of them only those reached so, through the actor or a thing named: one reached by nothing bound would be asked
  // of its whole relation, for every way the facts before it hold (none at all: a part ends where it needs no more).
  private static ordered(facts: Call[]): Call[] {
    const left = [...facts], out: Call[] = [], bound = new Set<string>();
    let last: readonly string[] = [];
    while (left.length) {
      const next = left.reduce((best, f) => this.score(f, bound, last) > this.score(best, bound, last) ? f : best);
      if (!this.known(next, bound)) { break; }
      left.splice(left.indexOf(next), 1);
      out.push(next);
      for (const a of next.args) { if (a.startsWith('?')) { bound.add(a); } }
      last = next.args;
    }
    return out;
  }
  // How many of a fact's arguments are bound, twice over; and one more where it joins through the fact before it.
  private static score(f: Call, bound: Set<string>, last: readonly string[]): number {
    return 2 * this.known(f, bound) + (f.args.some(a => a.startsWith('?') && last.includes(a)) ? 1 : 0);
  }
  private static known(f: Call, bound: Set<string>): number {
    return f.args.filter(a => !a.startsWith('?') || bound.has(a)).length;
  }
  private static joined(parts: Predicate[]): Predicate | undefined {
    return parts.reduceRight<Predicate | undefined>((right, left) => right ? { kind: 'and', left, right } : left,
      undefined);
  }
  private static conjuncts(p: Predicate): Predicate[] {
    return p.kind === 'and' ? [...this.conjuncts(p.left), ...this.conjuncts(p.right)] : [p];
  }
  // Every name a part asks of: its arguments, and those of what it compares or counts.
  private static names(p: Predicate | Value): string[] {
    switch (p.kind) {
      case 'call': return p.args;
      case 'not': return this.names(p.value);
      case 'and': case 'or': case 'compare': case 'arith': return [...this.names(p.left), ...this.names(p.right)];
      case 'count': return this.names(p.of);
      default: return [];
    }
  }
}
