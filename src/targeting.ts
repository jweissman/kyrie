import type { Fighter } from './model';
import type { Target } from './lang/parse';
import { Effects } from './effects';

export class Targeting {
  // A creature whose allegiance has changed (Orsino's charm) sees its own side as the enemy and the other as friends;
  // to everyone else it is still on the side it began on.
  static candidates(target: Target, actor: Fighter, fighters: Fighter[]): Fighter[] {
    const turned = !!Effects.modifiers(actor).changeAllegiance;
    return fighters.filter(f => {
      const friend = (f.team === actor.team) !== turned;
      if (target === 'dead ally') { return f.hp === 0 && friend; }
      if (f.hp === 0) { return false; }
      if (target === 'self') { return f.id === actor.id; }
      if (target === 'all') { return true; }
      const enemy = ['enemy', 'enemies', 'random enemy'].includes(target);
      return enemy ? !friend && f.id !== actor.id : friend || f.id === actor.id;
    });
  }
  static selected(target: Target): boolean { return ['enemy', 'ally', 'dead ally'].includes(target); }
}
