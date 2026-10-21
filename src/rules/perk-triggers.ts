import { Effects, type EffectContext } from '../effects';
import type { ArenaAbility } from '../lang/parse';
import type { Fighter } from '../model';
import { Perks } from './perks';
import { Overlays } from '../overlays';

// What a holder's perks do when its ability has been resolved: an offensive spell's extra damage (Orsino's
// onOffensiveCasting), and on each enemy the ability killed, the holder's rewards (onKill: gold, experience, a status
// such as a war horde's blood frenzy).
export class PerkTriggers {
  static after(ability: ArenaAbility, actor: Fighter | undefined, alive: Set<string>, context: EffectContext) {
    if (!actor) { return; }
    const at = { ...actor.environment ? { environment: actor.environment } : {} };
    const enemies = context.fighters.filter(f => f.team !== actor.team);
    if (ability.resist) {
      for (const extra of Perks.triggers(actor.traits, 'onOffensiveCasting', at)) {
        for (const target of enemies.filter(f => alive.has(f.id) && f.hp > 0)) {
          const amount = context.expressions!.number(extra.amount, Effects.context(actor));
          Effects.apply({ kind: 'damage', amount: { kind: 'literal', value: amount }, damageType: extra.damageType,
            target: 'enemy' }, target, amount, context);
        }
      }
    }
    const killed = enemies.filter(f => alive.has(f.id) && f.hp === 0);
    for (const reward of killed.flatMap(() => Perks.triggers(actor.traits, 'onKill', at))) {
      if (reward.status) {
        Effects.apply({ kind: 'apply', status: reward.status, duration: 1, target: 'self' }, actor, 0, context);
      }
      for (const resource of ['gold', 'experience'] as const) {
        const roll = reward[resource] && context.expressions!.number(reward[resource], Effects.context(actor));
        if (!roll) { continue; }
        // Orsino's gold is in gold pieces; Kyr pays a coin for every ten.
        const amount = resource === 'gold'
          ? Math.round(roll * Perks.bonus(actor.traits, 'goldMultiplier', at) / Overlays.coinScale) : roll;
        if (!amount) { continue; }
        Effects.apply({ kind: 'gain', amount: { kind: 'literal', value: amount }, resource, target: 'self' },
          actor, amount, context);
      }
    }
  }
}
