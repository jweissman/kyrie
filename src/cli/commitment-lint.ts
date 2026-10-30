import type { Change, Module, Operator, Predicate, Value } from '../lang/module';

// What a choice commits the company to that it cannot take back is said before it is chosen (the audit's SLIP-09:
// one-way and irreversible choices had been marked case by case, with no guarantee). A way that goes one way only
// says so of itself, from the ways the world has (ChoiceList.oneWay; a journey stops before one: PT-17). An action
// that puts the company somewhere has to say so in its Grave when nothing leads back out of where it puts it: no way
// out of that place, and nothing done or happening there that takes whoever is there on.
export interface Commitment { action: string; place: string }
export class CommitmentLint {
  // The actions that put the company where nothing leads out of, and say nothing of it first.
  static unmarked(module: Module, connects: readonly string[][], company?: string): Commitment[] {
    const places = new Set(module.entities.filter(e => e.type === 'place').map(e => e.id));
    const ways = new Set(connects.map(c => c[1]!));
    return module.actions.filter(a => !a.grave).flatMap(a => this.puts(a, company)
      .filter(p => places.has(p) && !ways.has(p) && !this.leaves(module, p))
      .map(place => ({ action: a.schema ?? a.id, place })));
  }
  // Where an action puts whoever does it (or the company): a place it names, not one it is given.
  private static puts(a: Operator, company?: string): string[] {
    const given = new Set((a.parameters ?? []).map(p => p.name));
    return a.success.filter(c => c.kind === 'assert' && c.call.name === 'at'
      && (given.has(c.call.args[0]!) || c.call.args[0] === company) && !given.has(c.call.args[1]!))
      .map(c => c.call.args[1]!);
  }
  // Whether anything done or happening at a place puts someone somewhere else.
  private static leaves(module: Module, place: string): boolean {
    return module.actions.some(a => this.mentions(a.requires, place) && this.moves(a.success, place))
      || (module.rules ?? []).some(r => this.mentions(r.when, place) && this.moves(r.effects, place));
  }
  private static moves(changes: Change[], from: string): boolean {
    return changes.some(c => c.kind === 'assert' && c.call.name === 'at' && c.call.args[1] !== from);
  }
  private static mentions(p: Predicate | Value, id: string): boolean {
    switch (p.kind) {
      case 'call': return p.args.includes(id);
      case 'not': return this.mentions(p.value, id);
      case 'and': case 'or': return this.mentions(p.left, id) || this.mentions(p.right, id);
      case 'compare': return this.mentions(p.left, id) || this.mentions(p.right, id);
      case 'arith': return this.mentions(p.left, id) || this.mentions(p.right, id);
      default: return false;
    }
  }
}
