import type * as ohm from 'ohm-js';
import type { Change, Module, Predicate } from './module';

type Node = ohm.Node;
export interface PromiseSpec {
  id: string; words: string; to: string; kept: { when: Predicate; text?: string };
  broken: { when: Predicate; text: string; effects: Change[] };
}

// A promise the company makes to someone, as one thing: made by an action or a topic that asserts promiseMade(id);
// kept when its condition first holds, broken when its other one does first, with what breaking it brings; and an aim
// while it stands. What Tessary Owes wrote every promise by hand, a relation, a deadline rule, a kept rule, a broken
// rule and a forsworn consequence, and Dagny's debt and the Road's licences wanted the same (its friction's 5).
//   Promise letter "to bring the Factor's letter to the Comptroller" to comptroller
//     kept when keeps(comptroller, sault_letter) "The Comptroller draws a line through it."
//     broken when feastEve() and hour(clock) >= 18 "A line is drawn through a promise you made."
//       { Assert forsworn(party). }.
export class Promises {
  static readonly actions = { Promise: Promises.parse, PromiseHead: Promises.head, PromiseKept: Promises.kept,
    PromiseBroken: Promises.broken, PromiseTail: Promises.tail, PromiseEffects: Promises.effects };
  // Promise = "Promise" PromiseHead PromiseKept PromiseBroken
  static parse(_p: Node, head: Node, kept: Node, broken: Node) {
    return { field: 'promise', value: { ...Promises.ast(head) as object, kept: Promises.ast(kept),
      broken: Promises.ast(broken) } };
  }
  // PromiseHead = ident string "to" ident
  static head(id: Node, words: Node, _to: Node, to: Node) {
    return { id: id.sourceString, words: Promises.ast(words) as string, to: to.sourceString };
  }
  // PromiseKept = "kept" "when" Predicate string?
  static kept(_k: Node, _when: Node, when: Node, text: Node) {
    const said = text.children.map(t => Promises.ast(t) as string)[0];
    return { when: Promises.ast(when) as Predicate, ...said ? { text: said } : {} };
  }
  // PromiseBroken = "broken" "when" Predicate PromiseTail
  static broken(_b: Node, _when: Node, when: Node, tail: Node) {
    return { when: Promises.ast(when) as Predicate, ...Promises.ast(tail) as object };
  }
  // PromiseTail = string PromiseEffects? "."
  static tail(text: Node, effects: Node, _dot: Node) {
    return { text: Promises.ast(text) as string, effects: effects.children.flatMap(e => Promises.ast(e) as Change[]) };
  }
  // PromiseEffects = "{" ChangeStatement* "}"
  static effects(_open: Node, changes: Node, _close: Node): Change[] {
    return changes.children.map(c => Promises.ast(c) as Change);
  }
  private static ast(node: Node): unknown { return (node as unknown as { ast(): unknown }).ast(); }
  static lower(module: Module, p: PromiseSpec) {
    module.entities.push({ id: p.id, type: 'promise', name: p.words });
    const [made, kept, broken] = ['promiseMade', 'promiseKept', 'promiseBroken'].map(n => Promises.call(n, p.id));
    const stands: Predicate = { kind: 'and', left: made!, right: { kind: 'and',
      left: { kind: 'not', value: kept! }, right: { kind: 'not', value: broken! } } };
    (module.rules ??= []).push(
      { id: `${p.id}_kept`, when: { kind: 'and', left: stands, right: p.kept.when },
        ...p.kept.text ? { say: p.kept.text } : {}, effects: [{ kind: 'assert', call: kept! }] },
      { id: `${p.id}_broken`, when: { kind: 'and', left: stands, right: p.broken.when }, say: p.broken.text,
        effects: [{ kind: 'assert', call: broken! }, ...p.broken.effects] });
    (module.objectives ??= []).push({ id: `${p.id}_aim`, when: stands, text: `Keep your promise to {${p.to}}: ${p.words}.` });
  }
  private static call(name: string, id: string): Extract<Predicate, { kind: 'call' }> {
    return { kind: 'call', name, args: [id] };
  }
}
