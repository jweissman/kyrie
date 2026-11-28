import type { Call, Change, Module, Operator, Predicate, Value } from './module';
import { ModuleWriter } from './module-writer';
import { Reads } from './reads';
import { ModulePositions } from './module-positions';
import type { World } from './world';

// A guarded change (`If lit(lamp), Assert seen(actor, door).`: Change.when) has its guard read as the act begins,
// before any of its consequence's changes are made, since they are one moment (OR-1333). Read top to bottom, a guard
// would seem to see what the changes written above it make; so a guard may not read what a change above it writes,
// and then the two readings agree. What it reads of what is written below it, or by itself, it reads as it was: "If
// at(reeve, gatehouse), Assert at(reeve, green)." moves the reeve only where she was. A change above writes what a
// guard reads where it is of the same relation or measure and of the same things: a fact of a relation by every
// argument but its last (an exclusive one's assert displaces the rest), a measure by all of them; a parameter or a
// variable may be anything.
export class Guards {
  // As the act is read, said at the act: each guard's own calls, against the changes above it.
  static read(id: string, consequence: readonly Change[], parameters: ReadonlySet<string>) {
    consequence.forEach((c, i) => {
      const above = consequence.slice(0, i), calls = c.when ? Guards.calls(c.when) : [];
      const read = calls.filter(call => above.some(w => Guards.writes(w, call, parameters)));
      if (read.length) { throw new Error(Guards.refusal(id, c.when!, read.map(r => r.name))); }
    });
  }
  // As the module is checked: what a guard reads through a query, by name, said at the query's call where the module
  // was read whole (ModulePositions).
  static asked(module: Module, action: Operator, positions: ModulePositions | undefined) {
    const queries = new Set(module.queries.map(q => q.name));
    for (const consequence of [action.success, action.failure]) {
      consequence.forEach((c, i) => {
        const written = new Set(consequence.slice(0, i).map(w => w.call.name));
        for (const call of (c.when ? Guards.calls(c.when) : []).filter(x => queries.has(x.name))) {
          const read = Reads.names(module, [call]).filter(n => written.has(n));
          if (read.length) {
            throw new Error(ModulePositions.message(positions?.call(call), Guards.refusal(`Action ${action.id}`, c.when!, read)));
          }
        }
      });
    }
  }
  // The act with its guards read in this world, the world as its consequence begins: each guarded change kept, its
  // guard gone, where its guard holds, and dropped where it does not. An act that takes effect later (a journey, as it
  // arrives; an activity, as it ends) makes what was due as it began, whatever the watches between bring. The act
  // itself where nothing in it is guarded.
  static settled(world: World, action: Operator): Operator {
    if (!action.success.some(c => c.when) && !action.failure.some(c => c.when)) { return action; }
    return { ...action, success: world.due(action.success), failure: world.due(action.failure) };
  }
  private static refusal(id: string, when: Predicate, read: string[]): string {
    return `${id}: its guard "If ${ModuleWriter.predicate(when)}" reads ${[...new Set(read)].join(', ')}, which a change `
      + 'above it writes; a guard is read as the act begins, before any of its changes are made: write it above them';
  }
  private static writes(change: Change, call: Call, parameters: ReadonlySet<string>): boolean {
    if (change.call.name !== call.name || change.call.args.length !== call.args.length) { return false; }
    const fact = change.kind === 'assert' || change.kind === 'retract';
    const n = fact ? Math.max(call.args.length - 1, 0) : call.args.length;
    return call.args.slice(0, n).every((a, k) => a === change.call.args[k] || Guards.loose(a, parameters)
      || Guards.loose(change.call.args[k]!, parameters));
  }
  // A parameter or a variable, which may be anything.
  private static loose(a: string, parameters: ReadonlySet<string>): boolean { return a.startsWith('?') || parameters.has(a); }
  private static calls(p: Predicate | Value): Call[] {
    switch (p.kind) {
      case 'call': return [p];
      case 'not': return Guards.calls(p.value);
      case 'and': case 'or': case 'compare': case 'arith': return [...Guards.calls(p.left), ...Guards.calls(p.right)];
      case 'count': return Guards.calls(p.of);
      default: return [];
    }
  }
}
