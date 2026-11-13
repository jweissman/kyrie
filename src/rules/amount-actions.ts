import type * as ohm from 'ohm-js';

export type Context = Record<string, number>;
export type MeanNode = ohm.Node & { mean(context: Context): number; args: { context: Context } };
export type DiceNode = ohm.Node & { dice(): Die[] };
// One kind of die an expression throws: so many of so many sides (3d8 is three of eight).
export interface Die { count: number; sides: number }

// What each form of a Deem expression means to Amounts (ohm calls each with the node as `this`): its mean, and the
// dice it throws.
export class AmountActions {
  static of(node: ohm.Node, context: Context): number { return (node as MeanNode).mean(context); }
  static plus(this: MeanNode, a: ohm.Node, _: ohm.Node, b: ohm.Node): number {
    return AmountActions.of(a, this.args.context) + AmountActions.of(b, this.args.context);
  }
  static minus(this: MeanNode, a: ohm.Node, _: ohm.Node, b: ohm.Node): number {
    return AmountActions.of(a, this.args.context) - AmountActions.of(b, this.args.context);
  }
  static times(this: MeanNode, a: ohm.Node, _: ohm.Node, b: ohm.Node): number {
    return AmountActions.of(a, this.args.context) * AmountActions.of(b, this.args.context);
  }
  static divide(this: MeanNode, a: ohm.Node, _: ohm.Node, b: ohm.Node): number {
    return AmountActions.of(a, this.args.context) / AmountActions.of(b, this.args.context);
  }
  static paren(this: MeanNode, _o: ohm.Node, e: ohm.Node, _c: ohm.Node): number {
    return AmountActions.of(e, this.args.context);
  }
  static pos(this: MeanNode, _p: ohm.Node, e: ohm.Node): number { return AmountActions.of(e, this.args.context); }
  static neg(this: MeanNode, _m: ohm.Node, e: ohm.Node): number { return -AmountActions.of(e, this.args.context); }
  static multi(this: MeanNode, count: ohm.Node, _d: ohm.Node, sides: ohm.Node): number {
    return Number(count.sourceString) * (Number(sides.sourceString) + 1) / 2;
  }
  static single(this: MeanNode, _d: ohm.Node, sides: ohm.Node): number { return (Number(sides.sourceString) + 1) / 2; }
  static number(this: MeanNode, _n: ohm.Node): number { return parseFloat(this.sourceString); }
  // A creature's own quantity (#level, #hitDice), as the context gives it.
  static ident(this: MeanNode, _i: ohm.Node, _r: ohm.Node): number {
    const value = this.args.context[this.sourceString.replace(/^#/, '')];
    if (value === undefined) { throw new Error(`No value for ${this.sourceString}`); }
    return value;
  }
  // What passes straight through (an expression in its one form) has its child's mean; a power, a function, a
  // choice, a test or a word has none.
  static through(this: MeanNode, ...children: ohm.Node[]): number {
    if (children.length === 1) { return AmountActions.of(children[0]!, this.args.context); }
    throw new Error(`No mean for ${AmountActions.called[this.ctorName] ?? this.ctorName}`);
  }
  static word(this: MeanNode): number { throw new Error(`No mean for '${this.sourceString}'`); }
  static readonly called: Record<string, string> = { ExpExp_power: 'a power', FunctionCall: 'a function',
    TernaryExp: 'a choice', LogExp_and: 'a test', LogExp_or: 'a test', LogExp_not: 'a test', CompExp_lt: 'a test',
    CompExp_gt: 'a test', CompExp_eq: 'a test', CompExp_neq: 'a test', CompExp_lte: 'a test', CompExp_gte: 'a test' };
  // The dice each form throws.
  static thrownMulti(this: DiceNode, count: ohm.Node, _d: ohm.Node, sides: ohm.Node): Die[] {
    return [{ count: Number(count.sourceString), sides: Number(sides.sourceString) }];
  }
  static thrownSingle(this: DiceNode, _d: ohm.Node, sides: ohm.Node): Die[] {
    return [{ count: 1, sides: Number(sides.sourceString) }];
  }
  static thrown(this: DiceNode, ...children: ohm.Node[]): Die[] {
    return children.flatMap(c => (c as DiceNode).dice());
  }
  static none(): Die[] { return []; }
}
