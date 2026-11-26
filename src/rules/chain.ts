import { Effects, type EffectContext } from '../effects';
import { Targeting } from '../targeting';
import type { Expressions } from '../expressions';
import type { Effect } from '../lang/parse';
import type { Fighter } from '../model';

// A chain (the SRD's Chain Lightning; Orsino's cascade): a harm aimed at one foe leaps from it to as many others as its
// count says, each struck once, in the fight's order (the SRD lets its caster choose them: the order chooses), never a
// friend. Each leap takes its share (the SRD's half) of what the first was dealt before any save, rounded down, and
// each struck saves on their own. The first is the one it is aimed at; it is a chain, not an area: nobody it does not
// name is caught.
export class Chain {
  // The one each casting's chain begins at, and what it was dealt, by the casting's context.
  private static readonly first = new WeakMap<EffectContext, { at: string; dealt?: number }>();
  static targets(effect: Effect, aimed: Fighter[],
    by: { actor: Fighter; context: EffectContext; expressions: Expressions }): Fighter[] {
    if (!effect.chain || !aimed.length) { return aimed; }
    const { actor, context, expressions } = by;
    const leaps = Math.max(0, expressions.amount(effect.chain.count, Effects.context(actor, context.castingLevel)));
    const others = Targeting.candidates('enemies', actor, context.fighters)
      .filter(f => f.hp > 0 && f.id !== aimed[0]!.id);
    Chain.first.set(context, { at: aimed[0]!.id });
    return [aimed[0]!, ...others.slice(0, leaps)];
  }
  // What one struck takes: the first its own roll, kept for its leaps; a leap its share of that.
  static amount(effect: Effect, rolled: number, target: Fighter, context: EffectContext): number {
    const chain = effect.chain && Chain.first.get(context);
    if (!effect.chain || !chain) { return rolled; }
    if (target.id === chain.at) { chain.dealt = rolled; return rolled; }
    return Math.floor((chain.dealt ?? rolled) * effect.chain.ratio);
  }
}
