import type { Fighter } from './model';
import type { ArenaAbility, Target } from './lang/parse';
import { Effects } from './effects';
import { FighterBody } from './fighter-body';

export class Targeting {
  // A creature whose allegiance has changed (Orsino's charm) sees its own side as the enemy and the other as friends;
  // to everyone else it is still on the side it began on.
  static candidates(target: Target, actor: Fighter, fighters: Fighter[]): Fighter[] {
    const own = Effects.modifiers(actor), turned = !!own.changeAllegiance, sees = !!own.seeInvisible;
    // What the act names and the place (it, here) are no one in a fight: an ability aimed only so is not offered there.
    if (target === 'it' || target === 'here') { return []; }
    return fighters.filter(f => {
      const friend = (f.team === actor.team) !== turned;
      if (target === 'dead ally') { return f.hp === 0 && friend; }
      if (f.hp === 0) { return false; }
      if (target === 'self') { return f.id === actor.id; }
      if (target === 'all') { return true; }
      const enemy = ['enemy', 'enemies', 'random enemy', 'random enemies'].includes(target);
      // The one foe gone for is never one unseen (Orsino's invisible), unless the invisible are seen; what falls on
      // every foe falls on them too.
      if (target === 'enemy' && !friend && !sees && Effects.modifiers(f).invisible) {
        return false;
      }
      return enemy ? !friend && f.id !== actor.id : friend || f.id === actor.id;
    });
  }
  // Whom each of an ability's effects can be aimed at, of the kind it needs when the whole ability needs one (charm on
  // people, turn undead on the dead), by id; none if any reaches no one, when the ability is not offered at all.
  // Reckoned once an ability: it had been reckoned again for every fighter weighed as a target, most of the time a
  // forecast's trials spent (OR-114).
  static reach(effects: ArenaAbility['effects'], actor: Fighter, fighters: Fighter[]):
    Map<ArenaAbility['effects'][number], Set<string>> | undefined {
    const kind = effects.every(effect => effect.targetTrait), reach = new Map<ArenaAbility['effects'][number], Set<string>>();
    for (const effect of effects) {
      const ids = new Set(Targeting.candidates(effect.target, actor, fighters)
        .filter(f => !kind || Targeting.bears(f, effect.targetTrait!)).map(f => f.id));
      if (!ids.size) { return undefined; }
      reach.set(effect, ids);
    }
    return reach;
  }
  // Whether a creature is of the kind an effect wants (the SRD's "one animal", "one humanoid", "undead"): a trait it
  // bears, or its body's kind or type (a wolf is an animal and a beast, though no trait says so: Orsino's Hold Animal
  // had fallen on none, srd-proving-cases.md case 48).
  static bears(f: Fighter, trait: string): boolean {
    const body = FighterBody.of(f);
    if (f.traits?.includes(trait)) { return true; }
    return !!body && (body.kind === trait || body.type === trait);
  }
  static selected(target: Target): boolean { return ['enemy', 'ally', 'dead ally'].includes(target); }
}
