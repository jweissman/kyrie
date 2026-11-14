import type { Effect } from '../lang/parse';
import type { Fighter } from '../model';

// A harm with a count aimed at one chosen foe is a volley (Magic Missile: rules/magic-missile.md): so many separate
// blows, each thrown, dealt, resisted and told on its own, every one at the chosen foe; one still to come when it falls
// passes to the next foe standing, in the order the fight lists them, so a replay allocates alike. A harm without a
// count, or aimed at many, is one application as before.
export class Volley {
  static of(effect: Effect): boolean {
    return effect.kind === 'damage' && effect.target === 'enemy' && !!effect.count;
  }
  // Who each blow of the volley falls on, as they are about to be dealt: the chosen foe, or the next standing.
  static next(chosen: Fighter, fighters: Fighter[]): Fighter | undefined {
    if (chosen.hp > 0) { return chosen; }
    return fighters.find(f => f.team === chosen.team && f.hp > 0);
  }
}
