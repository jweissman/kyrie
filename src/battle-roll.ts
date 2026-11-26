import { Content } from './content';
import { Effects } from './effects';
import type { Battle } from './battle';
import type { Fighter } from './model';
import { Parley } from './parley';

type ArenaAbility = Battle['repertoire'][number];

// Who and what a fight is fought with, found sound before it begins (Battle's own, kept apart from its loop).
export class BattleRoll {
  // The ability lists found sound, by their length then (see validate).
  private static readonly sound = new WeakMap<ArenaAbility[], number>();
  static validate(fighters: Fighter[], abilities: ArenaAbility[]) {
    const ids = new Set(fighters.map(f => f.id));
    if (ids.size !== fighters.length || !ids.size) { throw new Error('Combatants need unique IDs'); }
    const abilityIds = abilities.map(a => a.id), known = new Set(abilityIds);
    if (known.size !== abilityIds.length) { throw new Error('Abilities need unique IDs'); }
    for (const f of fighters) {
      if (![f.hp, f.maxHp, f.speed, f.strength, f.mana, f.maxMana].every(n => Number.isSafeInteger(n) && n >= 0)
        || f.maxHp < 1 || f.hp > f.maxHp || f.mana > f.maxMana || !['fighters', 'goblins'].includes(f.team)
        || f.abilities.some(id => !known.has(id))) { throw new Error(`Invalid combatant ${f.id}`); }
      f.statuses.forEach(s => Effects.status(s.id));
    }
    // The catalog's abilities, never changed, are found sound once, not again for every fight (a forecast's trials
    // are a dozen fights: OR-114); a fight's own (what the company carries to use up) are looked at every time.
    if (BattleRoll.sound.get(abilities) === abilities.length) { return; }
    for (const ability of abilities) {
      if (!ability.effects.length && ability.id !== 'wait' && ability.id !== Parley.id) {
        throw new Error(`Empty ability ${ability.id}`);
      }
      for (const n of [ability.cost ?? 0, ability.cooldown ?? 0]) {
        if (!Number.isSafeInteger(n) || n < 0) { throw new Error('Invalid ability cost/cooldown'); }
      }
      ability.effects.forEach(effect => Effects.validate(effect, abilityIds));
    }
    if (abilities === Parley.worded(Content.abilities)) { BattleRoll.sound.set(abilities, abilities.length); }
  }
}
