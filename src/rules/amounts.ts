import { Deem } from 'deem';
import type * as ohm from 'ohm-js';
import type { Amount } from '../lang/parse';
import { AmountActions, type Context, type DiceNode, type Die, type MeanNode } from './amount-actions';
export type { Die } from './amount-actions';

// Wherever the catalog wants a number it may be given dice (the SRD adaptation briefing, §1: "3d8+4"), and every such
// number is one Amount, a literal or a Deem expression, read by the same grammar as an effect's harm. What an
// expression comes to on the average is worked out from the expression itself, never by throwing it many times: the
// SRD's listed average hit points are that mean, rounded down (2d12 is 13, 3d8+4 is 17).
export class Amounts {
  // A catalog's number or dice as an Amount: a whole number literally, anything else as Deem, which must parse.
  static of(text: string | number): Amount {
    const said = String(text).trim();
    if (/^\d+$/.test(said)) { return { kind: 'literal', value: Number(said) }; }
    if (Deem.parse(said).failed()) { throw new Error(`Not a number or dice: ${said}`); }
    return { kind: 'deem', expression: said };
  }
  static text(amount: Amount): string { return amount.kind === 'literal' ? String(amount.value) : amount.expression; }
  // Whether a catalog's field holds a number or dice the grammar reads.
  static valid(text: unknown): boolean {
    if (typeof text === 'number') { return Number.isFinite(text); }
    return typeof text === 'string' && !!text.trim() && !Deem.parse(text.trim()).failed();
  }
  // The expectation of an amount, exactly: a die of n sides is (n + 1) / 2, sums and differences add, a product of
  // independent throws multiplies, division is by a constant, and roll, min, max, floor, ceil and round of what is
  // fixed are what they come to (see AmountActions.call). A comparison or another function has no such mean, and is
  // refused rather than guessed at. Deem reads a bare "d6" as a word, so a catalog writes 1d6.
  static mean(amount: Amount | string, context: Context = {}): number {
    const text = typeof amount === 'string' ? amount : Amounts.text(amount);
    const match = Deem.parse(text);
    if (match.failed()) { throw new Error(`Not a number or dice: ${text}`); }
    return (Amounts.semantics()(match) as unknown as MeanNode).mean(context);
  }
  // The listed average, as the SRD prints it: the mean rounded down, and never below one.
  static listed(amount: Amount | string, context: Context = {}): number {
    return Math.max(1, Math.floor(Amounts.mean(amount, context)));
  }
  // The dice an expression throws, in order (2d12+3 throws two twelves): what an effect reading hit dice counts.
  static dice(amount: Amount | string): Die[] {
    const text = typeof amount === 'string' ? amount : Amounts.text(amount);
    const match = Deem.parse(text);
    return match.failed() ? [] : (Amounts.semantics()(match) as unknown as DiceNode).dice();
  }
  private static built?: ohm.Semantics;
  private static semantics(): ohm.Semantics {
    if (Amounts.built) { return Amounts.built; }
    const s = Deem.grammar.createSemantics();
    const m = AmountActions;
    const means = { AddExp_plus: m.plus, AddExp_minus: m.minus, MulExp_times: m.times, MulExp_divide: m.divide,
      PriExp_paren: m.paren, PriExp_pos: m.pos, PriExp_neg: m.neg, dice_multi: m.multi, dice_single: m.single,
      number: m.number, ident: m.ident, _nonterminal: m.through, _terminal: m.word };
    const thrown = { dice_multi: m.thrownMulti, dice_single: m.thrownSingle, _nonterminal: m.thrown, _iter: m.thrown,
      _terminal: m.none };
    s.addOperation<number>('mean(context)', means as unknown as ohm.ActionDict<number>);
    s.addOperation<Die[]>('dice', thrown as unknown as ohm.ActionDict<Die[]>);
    return Amounts.built = s;
  }
}
