import { AbilityUse } from './ability-use';
import { Effects, type EffectContext } from './effects';
import { Targeting } from './targeting';
import type { ArenaAbility, Effect } from './lang/parse';
import type { Fighter } from './model';

// Orsino's reactions (AbilityHandler.performReactions): a creature's statuses may answer what a creature on the other
// side does: its use of a named ability (onEnemyMelee, onEnemyCharge), an effect of a kind (onEnemyAttack), or the
// casting of a spell (onEnemyCasting, onEnemyOffensiveCasting). The answer comes before the deed lands; an attacker it
// fells does nothing more. A reaction does not set off further reactions.
export class Reactions {
  // The keys a deed provokes, as Orsino names them: onEnemy + the ability's name, and onEnemy + the effect's type.
  static keys(ability: string | undefined, effect: Effect): string[] {
    const named = ability ? [`onEnemy${ability.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`] : [];
    const type = { attack: 'Attack', damage: 'Damage', heal: 'Heal', drain: 'Drain', summon: 'Summon', kill: 'Kill',
      cast: 'Cast', revive: 'Resurrect', remove: 'RemoveStatus', apply: effect.save ? 'Debuff' : 'Buff' }[effect.kind as string];
    return [...named, ...type ? [`onEnemy${type}`] : []];
  }
  static provoke(actor: Fighter, keys: string[], context: EffectContext) {
    if (context.hooking) { return; }
    for (const reactor of Targeting.candidates('enemies', actor, context.fighters)) {
      for (const key of keys) {
        const effects = Reactions.of(reactor, key);
        if (!effects.length || reactor.hp === 0 || actor.hp === 0) { continue; }
        context.events.push({ type: 'react', turn: context.turn, actor: reactor.id, target: actor.id, detail: key });
        const inner: EffectContext = { ...context, actor: reactor, hooking: true, drawn: undefined };
        for (const effect of effects) {
          const target = effect.target === 'self' ? reactor : actor;
          if (target.hp === 0 || reactor.hp === 0) { break; }
          if (!AbilityUse.effectOn(effect, target, { expressions: context.expressions!, context: inner })) { break; }
        }
      }
    }
  }
  // After a spell: the caster's own onOffensiveCasting, then what the other side answers to casting.
  static cast(ability: ArenaAbility, actor: Fighter | undefined, context: EffectContext) {
    if (!actor || !ability.spell) { return; }
    const offensive = ability.effects.some(e => ['enemy', 'enemies', 'random enemy', 'random enemies'].includes(e.target));
    if (offensive) {
      AbilityUse.hooks(actor, 'onOffensiveCasting', actor, context);
      Reactions.provoke(actor, ['onEnemyOffensiveCasting'], context);
    }
    Reactions.provoke(actor, ['onEnemyCasting'], context);
  }
  static of(fighter: Fighter, key: string): Effect[] {
    return [...new Set(fighter.statuses.map(s => s.id))]
      .flatMap(id => Effects.status(id).hooks?.reactions?.[key] ?? []);
  }
}
