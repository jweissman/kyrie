import { Effects, type EffectContext } from '../effects';
import { Fighting } from './fighting';
import type { Fighter } from '../model';

// Figments that take blows meant for their maker (the SRD's Mirror Image, srd-proving-cases.md case 40). A condition
// whose modifiers name `images` (dice, read at its laying by its caster's values, as temporary hit points are) holds
// that many. Each attack roll made at its holder, a blow's or a touch's, first falls at random on the holder or on one
// of them, each as likely; one that falls on an image is struck at it as though it wore nothing (an image's armour is
// its maker's quickness), and a hit puts it out, a miss does nothing. Either way the holder is not struck. When the
// last is gone, the condition ends. Harm without an attack roll (a burst, a save) passes them by.
export class Images {
  // How many a condition laid now holds: its modifiers' images, thrown by the caster's values; none if it names none.
  static laid(dice: string | undefined, context: EffectContext, holder: Fighter): number {
    const values = Effects.context(context.actor ?? holder, context.castingLevel);
    return dice && context.expressions ? Math.max(0, context.expressions.number(dice, values)) : 0;
  }
  // The share of attacks that reach the holder through its images (a forecast's): one in as many as there are, and it.
  static share(target: Fighter): number {
    return 1 / (1 + (Images.held(target)?.images ?? 0));
  }
  // Whether an attack roll at the target fell on one of its images instead (told as an attack at an image, `image`),
  // the image struck as though it wore nothing; a hit on it puts it out.
  static intercepted(actor: Fighter, target: Fighter, context: EffectContext, ranged: boolean): boolean {
    const held = Images.held(target), expressions = context.expressions;
    if (!held?.images || !expressions || expressions.number(`1d${held.images + 1}`) === 1) { return false; }
    const roll = Fighting.touch(Effects.combatant(actor), Effects.combatant(target),
      sides => expressions.number(`1d${sides}`), ranged);
    if (roll.success) { held.images--; }
    context.events.push({ type: 'attack', turn: context.turn, actor: actor.id, target: target.id, die: roll.die,
      need: roll.need, toHit: roll.toHit, armorClass: roll.armorClass, weapon: '', success: roll.success,
      critical: false, image: true });
    if (!held.images) {
      held.remaining = 0;
      Effects.expire(target, s => s === held, context);
    }
    return true;
  }
  private static held(target: Fighter) { return target.statuses.find(s => (s.images ?? 0) > 0); }
}
