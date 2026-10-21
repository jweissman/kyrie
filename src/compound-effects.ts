import { AbilityUse } from './ability-use';
import { Content } from './content';
import { Targeting } from './targeting';
import type { Effect } from './lang/parse';
import type { EffectContext } from './effects';
import type { Expressions } from './expressions';
import type { Fighter } from './model';

interface Options { expressions: Expressions; context: EffectContext; resisted?: boolean; ability?: string }
type Took = 'full' | 'partial' | false;

// Effects made of other effects (Ability.handleSingleEffect): one drawn at random (randomEffect), the next in turn
// (cycleEffects, kept per caster and ability across castings), or another ability performed at no cost (cast).
export class CompoundEffects {
  static one(effect: Extract<Effect, { kind: 'random' | 'cycle' }>, target: Fighter, options: Options): Took {
    const actor = options.context.actor, n = effect.effects.length;
    let chosen: Effect;
    if (effect.kind === 'random') { chosen = effect.effects[options.expressions.number(`1d${n}`) - 1]!; }
    else {
      const cycles = actor ? actor.cycles ??= {} : {}, key = options.ability ?? 'cycle', i = cycles[key] ?? 0;
      chosen = effect.effects[i % n]!;
      cycles[key] = (i + 1) % n;
    }
    // A nested effect aimed at the user lands on the user (Orsino's randomEffect target correction).
    return AbilityUse.effectOn(chosen, chosen.target === 'self' && actor ? actor : target, options);
  }
  // The named ability, by the same creature, on the same target when it may be, else on the first it may.
  static cast(effect: Extract<Effect, { kind: 'cast' }>, target: Fighter, options: Options): Took {
    const actor = options.context.actor;
    const inner = Content.abilities.find(a => a.id === effect.ability);
    if (!actor || !inner) { return false; }
    const aimed = inner.effects.find(e => Targeting.selected(e.target));
    const candidates = aimed ? Targeting.candidates(aimed.target, actor, options.context.fighters) : [];
    const chosen = !aimed ? actor.id : candidates.some(c => c.id === target.id) ? target.id : candidates[0]?.id;
    if (!chosen) { return false; }
    const result = AbilityUse.perform(inner, chosen, options.expressions, { ...options.context, free: true });
    return result.outcome === 'failure' ? false : result.outcome === 'partial' ? 'partial' : 'full';
  }
}
