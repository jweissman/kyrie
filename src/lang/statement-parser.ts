import type * as ohm from 'ohm-js';
import { ModuleParser } from './module-parser';

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
  static Duration(_time: Node, call: Node, _dot: Node): Field { return { field: 'duration', value: ModuleParser.ast(call) }; }
  static Resolve(_resolve: Node, call: Node, _dot: Node): Field { return { field: 'resolve', value: ModuleParser.ast(call) }; }
  static Interruption(_interrupted: Node, _when: Node, predicate: Node, _dot: Node): Field {
    return { field: 'interrupt', value: ModuleParser.ast(predicate) };
  }
  static Watchful(_watchful: Node, _dot: Node): Field { return { field: 'watchful', value: true }; }
  static ChangeStatement(change: Node, _dot: Node) { return ModuleParser.ast(change); }
  static Assert(_assert: Node, call: Node) { return { kind: 'assert', call: ModuleParser.ast(call) }; }
  static Retract(_retract: Node, call: Node) { return { kind: 'retract', call: ModuleParser.ast(call) }; }
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
  static String(this: Node, _open: Node, _chars: Node, _close: Node) { return JSON.parse(this.sourceString) as string; }
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
