import type { Module, Predicate, WorldRule } from './module';
import type { World } from './world';
import { ModuleWriter } from './module-writer';

interface Over { id: string; when: Predicate; over?: string[] }

// Which of a module's endings is reached when more than one holds. They are tried in the order they are written and
// the first that holds is reached, so the particular is written before the general, as the order means (Low Water's
// last, "Low Water" when departed(party), after sixteen that ask that and more). Two that can hold together where
// neither asks all the other asks are another matter: an accomplice whose hill crushed the Whelm was given the Second
// Whelming's ending, written first, and not First Through, and nothing said so (the Grand Tour's friction 4, GTR-04).
// The author says which wins (`Ending first_through "First Through" over second_whelming when …`); where they have
// not, an ending reached while such another held is told with it (see rivals), and the journeys warn of it.
export class EndingOrder {
  // The latch an ending's rule shuts (its installation's own concluded); nothing for a rule that is no ending.
  static shuts(rule: WorldRule): string | undefined {
    if (!rule.effects.some(c => c.kind === 'assert' && c.call.name === 'reached')) { return undefined; }
    return rule.effects.find(c => c.kind === 'assert' && !c.call.args.length)?.call.name;
  }
  // What an ending asks, conjunct by conjunct as it is written, the latch aside.
  static asks(rule: WorldRule): Set<string> {
    return EndingOrder.conjuncts(rule.when.kind === 'and' ? rule.when.left : rule.when);
  }
  private static conjuncts(p: Predicate): Set<string> {
    return p.kind === 'and' ? new Set([...EndingOrder.conjuncts(p.left), ...EndingOrder.conjuncts(p.right)])
      : new Set([JSON.stringify(p)]);
  }
  static within(some: Set<string>, all: Set<string>): boolean { return [...some].every(a => all.has(a)); }
  // The other endings of its installation that held where one was reached, each of which could have been reached in
  // its stead. One that asks only part of what the reached one asks is the general written after the particular, as
  // the order means; one that asks all of it and more can never be reached, which the lint says (CampaignLint.endings);
  // one the reached ending is said to be over asks that it does not hold, and so does not hold here. Tested in the
  // world just before the ending's own effects, where its condition held.
  static rivals(module: Module, rule: WorldRule, world: World): string[] {
    const shut = EndingOrder.shuts(rule);
    if (!shut) { return []; }
    const asks = EndingOrder.asks(rule);
    return (module.rules ?? []).filter(r => r.id !== rule.id && EndingOrder.shuts(r) === shut
      && !EndingOrder.within(EndingOrder.asks(r), asks) && !EndingOrder.within(asks, EndingOrder.asks(r))
      && world.test(r.when)).map(r => r.id);
  }
  // What a journey says of an ending reached while a rival held: both, and which won by the order they are written in.
  // An ending reached for a binding is told as its rule's id and the binding's (won@party), and is written as its rule.
  static contest(module: Module, won: string, held: string): string {
    const rules = module.rules ?? [], rule = won.split('@')[0];
    const first = rules.findIndex(r => r.id === rule) < rules.findIndex(r => r.id === held);
    return `${won} and ${held} held at once, and ${won} was reached: ${first ? 'it is written first'
      : `${held} is written first, but came to hold only after its turn`} (an Ending's "over" says which wins)`;
  }
  // An ending over others holds each of them back while its own condition holds, wherever it is written: each asks,
  // besides its own condition, that the winner's does not hold (with variables of its own, not the other's). So the
  // lint reads the order as the author has said it, and an ending reached never has for a rival one it is over.
  // Written among the endings of one file, as every adventure keeps its endings together.
  static rank(module: Module, endings: readonly Over[]) {
    const over = new Map(endings.filter(e => e.over?.length).map(e => [e.id, e]));
    for (const winner of over.values()) {
      for (const id of winner.over!) { EndingOrder.hold(module, winner, id, over); }
    }
  }
  private static hold(module: Module, winner: Over, id: string, over: Map<string, Over>) {
    const rule = (module.rules ?? []).find(r => r.id === id && EndingOrder.shuts(r));
    if (!rule || rule.when.kind !== 'and') {
      throw new Error(`Ending ${winner.id} is over ${id}, which is no ending of this file`);
    }
    if (EndingOrder.beats(over, id, winner.id, new Set())) {
      throw new Error(`Ending ${winner.id} is over ${id}, which is over it: where both hold, neither would be reached`);
    }
    const own = ModuleWriter.conditionCalls(winner.when, c => ({ ...c,
      args: c.args.map(a => a.startsWith('?') ? `?${winner.id}_${a.slice(1)}` : a) }));
    rule.when = { ...rule.when, left: { kind: 'and', left: rule.when.left, right: { kind: 'not', value: own } } };
  }
  // Whether one ending is over another (or is itself), directly or by way of endings it is over.
  private static beats(over: Map<string, Over>, from: string, to: string, seen: Set<string>): boolean {
    if (seen.has(from)) { return false; }
    seen.add(from);
    return (over.get(from)?.over ?? []).some(next => next === to || EndingOrder.beats(over, next, to, seen));
  }
}
