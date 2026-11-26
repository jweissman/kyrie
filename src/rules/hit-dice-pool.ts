import { Effects } from '../effects';
import { Positions } from './positions';
import type { ArenaAbility, Effect } from '../lang/parse';
import type { Fighter } from '../model';

// A pool of Hit Dice (the SRD's Sleep: "affects 4 Hit Dice of creatures"): of those an effect would fall on, the ones
// of fewest Hit Dice first, in the fight's order among equals, as many as the pool holds. It stops at the first it
// cannot hold (the Hit Dice left over are wasted), so none of more than the pool is ever touched. Whoever is proof
// against the effect's save (the undead against sleep) takes nothing from the pool and still saves, immune, as before.
// A Kyr creature's Hit Dice are its level.
export class HitDicePool {
  static held(effect: Pick<Effect, 'hitDice' | 'save'>, fighters: readonly Fighter[]): Fighter[] {
    if (effect.hitDice === undefined) { return [...fighters]; }
    const proof = new Set(fighters.filter(f => HitDicePool.proof(effect, f)).map(f => f.id)), held = new Set(proof);
    let left = effect.hitDice;
    for (const f of fighters.filter(f => !proof.has(f.id)).sort((a, b) => a.level - b.level)) {
      if (f.level > left) { break; }
      left -= f.level;
      held.add(f.id);
    }
    return fighters.filter(f => held.has(f.id));
  }
  // Where an ability with a pool may be aimed: only where it would hold someone, never at those all of more.
  static aims(ability: ArenaAbility, actor: Fighter, targets: Fighter[], fighters: readonly Fighter[]): Fighter[] {
    const pool = ability.effects.find(e => e.hitDice !== undefined), area = Positions.area(ability);
    if (!pool) { return targets; }
    return targets.filter(t => HitDicePool.held(pool, area ? Positions.caught(actor, t.id, area, fighters) : [t])
      .length);
  }
  private static proof(effect: Pick<Effect, 'save'>, f: Fighter): boolean {
    return !!effect.save?.kind && Effects.immune(f, effect.save.kind);
  }
}
