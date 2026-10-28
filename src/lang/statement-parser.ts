import type * as ohm from 'ohm-js';
import { ModuleParser } from './module-parser';
import { KyrText } from './kyr-text';

type Node = ohm.Node;
type Field = { field: string; value: unknown };
// Grammar actions for what any declaration is made of: changes, predicates, values, and the small one-line
// declarations (kinds, entities, initial facts, goals). Ohm calls them through ModuleParser's action table.
export class StatementParser {
  static ActionParameters(_open: Node, parameters: Node, _close: Node) { return ModuleParser.list(parameters); }
  static Requires(_requires: Node, predicate: Node, _dot: Node): Field {
    return { field: 'requires', value: ModuleParser.ast(predicate) };
  }
  static Cost(_cost: Node, value: Node, _dot: Node): Field {
    return { field: 'cost', value: Number(value.sourceString) };
  }
  static Time(_time: Node, value: Node, _dot: Node): Field {
    return { field: 'time', value: Number(value.sourceString) };
  }
  // "Time 2 minutes.": less than a watch; minutes add up, and every ten of them is a watch passed.
  static Minutes(_time: Node, value: Node, _unit: Node, _dot: Node): Field {
    return { field: 'minutes', value: Number(value.sourceString) };
  }
  static Duration(_time: Node, call: Node, _dot: Node): Field { return { field: 'duration', value: ModuleParser.ast(call) }; }
  static Resolve(_resolve: Node, call: Node, _dot: Node): Field { return { field: 'resolve', value: ModuleParser.ast(call) }; }
  static Interruption(_interrupted: Node, _when: Node, predicate: Node, _dot: Node): Field {
    return { field: 'interrupt', value: ModuleParser.ast(predicate) };
  }
  static Watchful(_watchful: Node, _dot: Node): Field { return { field: 'watchful', value: true }; }
  static ChangeStatement(change: Node, _dot: Node) { return ModuleParser.ast(change); }
  static Assert(_assert: Node, call: Node) { return { kind: 'assert', call: ModuleParser.ast(call) }; }
  static Retract(_retract: Node, call: Node) { return { kind: 'retract', call: ModuleParser.ast(call) }; }
  // "Give coat to party.": a thing put in the company's hands, by whoever has it, and "Spend weight_stone from actor.":
  // one of a kind it carries, given up. The engine does both (Consequences.hand), and forgets that it was asked to.
  static Give(_give: Node, item: Node, _to: Node, group: Node) {
    return { kind: 'assert', call: { kind: 'call', name: 'handed', args: [item.sourceString, group.sourceString] } };
  }
  static Spend(_spend: Node, kind: Node, _from: Node, group: Node) {
    return { kind: 'assert', call: { kind: 'call', name: 'usesUp', args: [group.sourceString, kind.sourceString] } };
  }
  static Set(_set: Node, call: Node, _to: Node, value: Node) {
    return { kind: 'set', call: ModuleParser.ast(call), value: ModuleParser.ast(value) };
  }
  static Increase(_increase: Node, call: Node, _by: Node, value: Node) {
    return { kind: 'increase', call: ModuleParser.ast(call), value: ModuleParser.ast(value) };
  }
  static Decrease(_decrease: Node, call: Node, _by: Node, value: Node) {
    return { kind: 'decrease', call: ModuleParser.ast(call), value: ModuleParser.ast(value) };
  }
  static Or(left: Node, _or: Node, right: Node) { return { kind: 'or', left: ModuleParser.ast(left), right: ModuleParser.ast(right) }; }
  static And(left: Node, _and: Node, right: Node) { return { kind: 'and', left: ModuleParser.ast(left), right: ModuleParser.ast(right) }; }
  static Not(_not: Node, value: Node) { return { kind: 'not', value: ModuleParser.ast(value) }; }
  static Group(_open: Node, value: Node, _close: Node) { return ModuleParser.ast(value); }
  static True(_true: Node) { return { kind: 'boolean', value: true }; }
  static False(_false: Node) { return { kind: 'boolean', value: false }; }
  // Left to right: "a - b - c" is (a - b) - c; so too a product's factors (Product), each taken before the sum.
  static Value(first: Node, tails: Node) {
    return tails.children.reduce((left, tail) => ({ kind: 'arith', op: tail.children[0]!.sourceString,
      left, right: ModuleParser.ast(tail.children[1]!) }), ModuleParser.ast(first) as object);
  }
  static Comparison(left: Node, operator: Node, right: Node) {
    return { kind: 'compare', left: ModuleParser.ast(left), right: ModuleParser.ast(right), operator: operator.sourceString };
  }
  static Call(name: Node, _open: Node, args: Node, _close: Node) {
    return { kind: 'call', name: name.sourceString, args: args.asIteration().children.map(ModuleParser.text) };
  }
  static Expression(_open: Node, parts: Node, _close: Node) {
    return { kind: 'deem', expression: parts.sourceString.trim() };
  }
  static Integer(this: Node, _digits: Node) { return { kind: 'number', value: Number(this.sourceString) }; }
  static String(this: Node, _open: Node, _chars: Node, _close: Node) {
    return StatementParser.unquote(this.sourceString);
  }
  // A Kyr string: JSON's escapes, any other character escaped as itself (it\'s), and a brace escaped as a brace that
  // names nothing (\{closed\}), kept apart until it is told (see ObservationText.render). The grammar allowed any
  // escape, and the reading refused all but JSON's (the architecture review's A25).
  static unquote(source: string): string {
    const text = source.slice(1, -1);
    return !text.includes('\\') ? text : text.replace(/\\(u[0-9a-fA-F]{4}|[\s\S])/g, (_, c: string) => c.length > 1
      ? String.fromCharCode(parseInt(c.slice(1), 16)) : StatementParser.escapes[c] ?? c);
  }
  static readonly escapes: Record<string, string> = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f',
    '{': KyrText.brace[0], '}': KyrText.brace[1] };
  static Kind(_kind: Node, name: Node, _dot: Node): Field { return { field: 'kind', value: name.sourceString }; }
  static Parameter(name: Node, _colon: Node, type: Node) {
    return { name: name.sourceString, type: type.sourceString };
  }
  static MemberBinding(_bound: Node, _to: Node, id: Node): string { return id.sourceString; }
  static Initial(_initial: Node, change: Node, _dot: Node): Field { return { field: 'initial', value: ModuleParser.ast(change) }; }
  static Goal(_goal: Node, predicate: Node, _dot: Node): Field { return { field: 'goal', value: ModuleParser.ast(predicate) }; }
  static Budget(_budget: Node, value: Node, _dot: Node): Field { return { field: 'budget', value: ModuleParser.ast(value) }; }
  static Description(_description: Node, value: Node, _dot: Node): Field {
    return { field: 'description', value: ModuleParser.ast(value) };
  }
}
