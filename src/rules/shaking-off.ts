import { Effects, type EffectContext } from '../effects';
import type { Expressions } from '../expressions';
import type { Effect } from '../lang/parse';
import type { Fighter } from '../model';

// A hold shaken off (the SRD's Hold Person: "each round on its turn, the subject may attempt a new saving throw to end
// the effect"): a condition laid by a save marked `again` keeps the save and its difficulty, and its holder, on each
// turn it loses to it, saves again; a success ends it, and the turn is spent on the effort.
export class ShakingOff {
  static mark(effect: Effect, target: Fighter, actor: Fighter | undefined,
    context: { expressions: Expressions; castingLevel?: number }) {
    if (effect.kind !== 'apply' || !effect.save?.again || !effect.save.kind) { return; }
    const held = target.statuses.findLast(s => s.id === effect.status);
    if (!held) { return; }
    held.again = { kind: effect.save.kind,
      difficulty: context.expressions.amount(effect.save.difficulty,
        actor ? Effects.context(actor, context.castingLevel) : {}) };
  }
  static tick(holder: Fighter, context: EffectContext) {
    for (const s of holder.statuses.filter(s => s.again && holder.hp > 0)) {
      if (Effects.save(holder, s.again!.kind, s.again!.difficulty, context)) { s.remaining = 0; }
    }
    Effects.expire(holder, s => !!s.again && s.remaining <= 0, context);
  }
}
