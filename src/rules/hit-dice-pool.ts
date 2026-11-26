import { Effects } from '../effects';
import { Positions } from './positions';
import type { ArenaAbility, Effect } from '../lang/parse';
import type { Fighter } from '../model';

// A pool of Hit Dice (the SRD's Sleep: "affects 4 Hit Dice of creatures"): of those an effect would fall on, the ones
// of fewest Hit Dice first, in the fight's order among equals, as many as the pool holds. It stops at the first it
// cannot hold (the Hit Dice left over are wasted), so none of more than the pool is ever touched. Whoever is proof
// against the effect's save (the undead against sleep) takes nothing from the pool and still saves, immune, as before.
// Fixed bodies use their stat block's Hit Dice; other creatures use their level.
export class HitDicePool {
  static held(effect: Pick<Effect, 'hitDice' | 'save'>, fighters: readonly Fighter[]): Fighter[] {
    if (effect.hitDice === undefined) { return [...fighters]; }
    const proof = new Set(fighters.filter(f => HitDicePool.proof(effect, f)).map(f => f.id)), held = new Set(proof);
    let left = effect.hitDice;
    const candidates = fighters.filter(f => !proof.has(f.id)).map(f => ({ f, dice: Effects.hitDice(f) }))
      .sort((a, b) => a.dice - b.dice);
    for (const { f, dice } of candidates) {
      if (dice > left) { break; }
      left -= dice;
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
