import { Effects, type EffectContext } from '../effects';
import { Fighting } from './fighting';
import type { Effect } from '../lang/parse';
import type { Fighter } from '../model';

// A touch spell's attack (the SRD's melee and ranged touch; the migration strategy's attack.meleeTouch and
// attack.rangedTouch, srd-proving-cases.md case 35): before its harm, the caster's d20 against the one touched, whose
// worn armour, hide and armour of force do not count (Fighting.touch). A miss ends the spell there, on that one, as a
// missed blow ends a weapon's; a hit lets what it does fall as written. It is told as the spell's own attack ("uses
// Shocking Grasp on the rat, and misses"), no weapon named, and its odds are the aim's, as a blow's are.
export class Touch {
  static lands(effect: Effect, actor: Fighter | undefined, target: Fighter, context: EffectContext): boolean {
    if (!effect.touch || !actor || !context.expressions) { return true; }
    const expressions = context.expressions;
    const roll = Fighting.touch(Effects.combatant(actor), Effects.combatant(target), () => expressions.number('1d20'),
      effect.touch === 'ranged');
    context.events.push({ type: 'attack', turn: context.turn, actor: actor.id, target: target.id, die: roll.die,
      need: roll.need, toHit: roll.toHit, armorClass: roll.armorClass, weapon: '', touch: effect.touch,
      success: roll.success, critical: false, ...roll.evasion?.evaded ? { evaded: true } : {} });
    return roll.success;
  }
  // The chance one of an ability's touches lands on a target, before the die (the aim's odds); none if it has none.
  static chance(effects: readonly Effect[], actor: Fighter, target: Fighter): number | undefined {
    const touch = effects.find(e => e.touch)?.touch;
    return touch && Fighting.touchChance(Effects.combatant(actor), Effects.combatant(target), touch === 'ranged');
  }
}
