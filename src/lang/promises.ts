import type * as ohm from 'ohm-js';
import type { Change, Module, Predicate, WorldRule } from './module';

type Node = ohm.Node;
// close: kept only as the story or chapter closes (`kept at the close when …`), and broken there if it is not.
export interface PromiseSpec {
  id: string; words: string; to: string; kept: { when: Predicate; text?: string; close?: boolean };
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
// What is said of its keeping or breaking is said to the one it was made to: told where the company is with them, or
// held as news until it is, or among the closing lines. A promise kept by something lasting (a secret held, a man left
// alone) is kept only at the close, if its condition holds then: the Grand Tour's Perrin had 'goes on being so, as he
// asked' told the minute the Door opened, wherever the company was, and kept for good minutes before the hill came
// down on him (its friction 5, GTR-05).
export class Promises {
  static readonly actions = { Promise: Promises.parse, PromiseHead: Promises.head, PromiseKept: Promises.kept,
    PromiseWhen: Promises.when, PromiseBroken: Promises.broken, PromiseTail: Promises.tail,
    PromiseEffects: Promises.effects };
  // Promise = "Promise" PromiseHead PromiseKept PromiseBroken
  static parse(_p: Node, head: Node, kept: Node, broken: Node) {
    return { field: 'promise', value: { ...Promises.ast(head) as object, kept: Promises.ast(kept),
      broken: Promises.ast(broken) } };
  }
  // PromiseHead = ident string "to" ident
  static head(id: Node, words: Node, _to: Node, to: Node) {
    return { id: id.sourceString, words: Promises.ast(words) as string, to: to.sourceString };
  }
  // PromiseKept = "kept" PromiseClose? PromiseWhen string?, where PromiseClose = "at" "the" "close"
  static kept(_k: Node, close: Node, when: Node, text: Node) {
    const said = text.children.map(t => Promises.ast(t) as string)[0];
    return { when: Promises.ast(when) as Predicate, ...said ? { text: said } : {},
      ...close.children.length ? { close: true } : {} };
  }
  // PromiseWhen = "when" Predicate
  static when(_when: Node, when: Node) { return Promises.ast(when); }
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
  // Kept and broken as rules that only say so, then a pair of rules for each line: one held near the one it was made
  // to, told when the company is with them, and one among the closing lines, read once the rules of the moment have
  // run, wherever its module's endings are written (upkeep). promiseTold latches the line told once.
  static lower(module: Module, p: PromiseSpec) {
    module.entities.push({ id: p.id, type: 'promise', name: p.words });
    for (const name of [Promises.told, Promises.concluded]) {
      if (!module.relations.some(r => r.name === name)) {
        module.relations.push({ name, types: name === Promises.told ? ['entity'] : [], exclusive: false });
      }
    }
    const [made, kept, broken] = ['promiseMade', 'promiseKept', 'promiseBroken'].map(n => Promises.call(n, p.id));
    const stands = Promises.all(made!, { kind: 'not', value: kept! }, { kind: 'not', value: broken! });
    const closed: Predicate = { kind: 'call', name: Promises.concluded, args: [] };
    const breaking: Change[] = [{ kind: 'assert', call: broken! }, ...p.broken.effects];
    const close = p.kept.close ? { upkeep: true } : {};
    (module.rules ??= []).push(
      { id: `${p.id}_kept`, when: p.kept.close ? Promises.all(stands, closed, p.kept.when) : Promises.all(stands,
        p.kept.when), effects: [{ kind: 'assert', call: kept! }], ...close },
      { id: `${p.id}_broken`, when: Promises.all(stands, p.broken.when), effects: breaking },
      ...p.kept.close ? [{ id: `${p.id}_unkept`, when: Promises.all(stands, closed, { kind: 'not', value: p.kept.when }),
        effects: breaking, upkeep: true }] : [],
      ...p.kept.text ? Promises.lines(p, 'kept', p.kept.text) : [], ...Promises.lines(p, 'broken', p.broken.text));
    (module.objectives ??= []).push({ id: `${p.id}_aim`, when: stands, text: `Keep your promise to {${p.to}}: ${p.words}.` });
  }
  private static readonly told = 'promiseTold';
  private static readonly concluded = 'concluded';
  private static lines(p: PromiseSpec, how: 'kept' | 'broken', say: string): WorldRule[] {
    const told = Promises.call(Promises.told, p.id), latched: Change[] = [{ kind: 'assert', call: told }];
    const untold = Promises.all(Promises.call(how === 'kept' ? 'promiseKept' : 'promiseBroken', p.id),
      { kind: 'not', value: told });
    return [{ id: `${p.id}_${how}_told`, when: untold, say, place: p.to, anchor: 'near', held: true, effects: latched },
      { id: `${p.id}_${how}_closing`, when: Promises.all(untold, Promises.call(Promises.concluded)), say,
        effects: latched, upkeep: true }];
  }
  private static all(...parts: Predicate[]): Predicate {
    return parts.reduceRight((right, left) => ({ kind: 'and', left, right }));
  }
  private static call(name: string, ...args: string[]): Extract<Predicate, { kind: 'call' }> {
    return { kind: 'call', name, args };
  }
}
