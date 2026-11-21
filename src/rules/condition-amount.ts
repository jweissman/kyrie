import type { Amount } from '../lang/parse';
import type { ConditionInstance } from '../creature';
import type { Modifiers } from './modifiers';
import type { Expressions } from '../expressions';

// A condition laid with an amount its caster throws (srd-proving-cases.md case 58: the SRD's Ray of Enfeeblement,
// 1d6 and a point each two casting levels, to five, off Strength): the apply effect's `amount`, thrown by the caster's
// values as it is laid, as temporary hit points and images are, and kept with the condition held; the condition's
// `perAmount` modifiers counted that many times beside its own. A condition held with no amount adds none of them.
export class ConditionAmount {
  // How much it is laid with: the effect's amount thrown, never below nothing; none where it names none.
  static laid(amount: Amount | undefined, expressions: Expressions | undefined, values: Record<string, number>):
    number | undefined {
    if (!amount || !expressions) { return undefined; }
    return Math.max(0, amount.kind === 'literal' ? amount.value : expressions.number(amount.expression, values));
  }
  // What a laying of one that accrues (stacking: accrue) finds held already, to add its own amount to: none of another
  // kind, or not held.
  static prior(stacking: string | undefined, held: readonly ConditionInstance[], id: string):
    ConditionInstance | undefined {
    return stacking === 'accrue' ? held.find(s => s.id === id) : undefined;
  }
  // What it is held with: the amount laid, and what it found held if it accrues; nothing where both are none.
  static held(laid: number | undefined, prior: ConditionInstance | undefined): { amount?: number } {
    const amount = (laid ?? 0) + (prior?.amount ?? 0);
    return amount ? { amount } : {};
  }
  // What one held adds for its amount: each number of its perAmount (scores, saves, the numeric modifiers) that many
  // times; the canon allows no other kind there (ModifierSet.uncounted).
  static added(per: Modifiers | undefined, held: ConditionInstance): Modifiers {
    if (!per || !held.amount) { return {}; }
    const n = held.amount, out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(per)) {
      out[key] = typeof value === 'number' ? value * n
        : Object.fromEntries(Object.entries(value as Record<string, number>).map(([k, v]) => [k, v * n]));
    }
    return out as Modifiers;
  }
}
