import type { Fighter } from './model';
import type { Target } from './lang/parse';

export class Targeting {
  static candidates(target: Target, actor: Fighter, fighters: Fighter[]): Fighter[] {
    return fighters.filter(f => {
      if (target === 'dead ally') { return f.hp === 0 && f.team === actor.team; }
      if (f.hp === 0) { return false; }
      if (target === 'self') { return f.id === actor.id; }
      if (target === 'all') { return true; }
      const enemy = ['enemy', 'enemies', 'random enemy'].includes(target);
      return enemy ? f.team !== actor.team : f.team === actor.team;
    });
  }
  static selected(target: Target): boolean { return ['enemy', 'ally', 'dead ally'].includes(target); }
}
