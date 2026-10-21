import type { Modifiers } from './modifiers';
import { FantasyRules } from '../fantasy-rules';

export interface WeaponProfile {
  id: string; name: string; damage: string; type: string; missile?: boolean; intercept?: boolean; natural?: boolean;
  // Light, medium or heavy: what a perk for a kind of weapon (a knight's heavy hand) reads.
  weight?: string;
}
// What the attack roll reads about one combatant: level, effective scores, equipment and gathered modifiers.
export interface Combatant {
  level: number; strength: number; dexterity: number; armorAc: number; weapon: WeaponProfile; modifiers: Modifiers;
}
export interface AttackRoll {
  die: number; need: number; toHit: number; armorClass: number; success: boolean; critical: boolean;
  evasion?: { die: number; need: number; evaded: boolean };
}

// Orsino's Fighting rules (src/orsino/rules/Fighting.ts), with Orsino's numbers.
export class Fighting {
  static statMod(score: number): number { return FantasyRules.statMod(score); }
  static thac0(level: number): number { return 20 - Math.floor(level / 2); }
  static maxSpellLevel(level: number): number { return Math.ceil(level / 2); }
  // Orsino rolls through Commands.roll, which adds allRolls to the natural die and floors the result at 1.
  static d20(roll: () => number, modifiers: Modifiers): number {
    return Math.max(1, roll() + (modifiers.allRolls ?? 0));
  }
  // Descending armour class: 10, less the body armour's ac, plus `ac` effects, less the defender's DEX modifier.
  static armorClass(defender: Combatant): number {
    return 10 - defender.armorAc + (defender.modifiers.ac ?? 0) - this.statMod(defender.dexterity);
  }
  // Fighting.attack: a d20 at or above THAC0 − AC − to-hit hits; a natural 1 always misses; 20 less the critical range
  // increase is a critical; a defender with evasion then rolls d20 at or above 20 − evasion to cancel the hit.
  static attack(attacker: Combatant, defender: Combatant, roll: () => number): AttackRoll {
    const missile = attacker.weapon.missile === true;
    const toHit = this.statMod(missile ? attacker.dexterity : attacker.strength) + (attacker.modifiers.toHit ?? 0);
    const armorClass = this.armorClass(defender);
    const need = this.thac0(attacker.level) - armorClass - toHit;
    const die = this.d20(roll, attacker.modifiers);
    if (die <= 1) { return { die, need, toHit, armorClass, success: false, critical: false }; }
    const success = die >= need;
    const critical = success && die >= 20 - (attacker.modifiers.criticalRangeIncrease ?? 0);
    const result: AttackRoll = { die, need, toHit, armorClass, success, critical };
    const evasion = defender.modifiers.evasion ?? 0;
    if (success && evasion) {
      const evade = this.d20(roll, defender.modifiers), needed = 20 - evasion;
      result.evasion = { die: evade, need: needed, evaded: evade >= needed };
      if (result.evasion.evaded) { result.success = false; result.critical = false; }
    }
    return result;
  }
  // Weapon damage after the die: a critical adds max(1, round(damage × 0.2 × max(1, ⌊level / 5⌋))), then the positive
  // STR (melee) or DEX (missile) modifier, then bonusMeleeDamage for melee weapons (Commands.handleAttack).
  // meleeBonus is the attacker's rolled bonusMeleeDamage, which only a melee weapon adds.
  static weaponDamage(attacker: Combatant, rolled: number, critical: boolean,
    meleeBonus = 0): { amount: number; critical: number } {
    const bonus = critical ? Math.max(1, Math.round(rolled * 0.2 * Math.max(1, Math.floor(attacker.level / 5)))) : 0;
    const missile = attacker.weapon.missile === true;
    const stat = Math.max(0, this.statMod(missile ? attacker.dexterity : attacker.strength));
    const melee = missile ? 0 : Math.max(0, meleeBonus);
    return { amount: rolled + bonus + stat + melee, critical: bonus };
  }
  // Commands.handleHit after the attack: the attacker's bonusDamage (not against itself), resistance (resistAll plus
  // the kind's; positive reduces, negative amplifies, true damage ignores both), then damageReduction.
  // bonus is the attacker's rolled bonusDamage (zero when a creature damages itself or there is no attacker).
  static mitigate(amount: number, type: string, options: {
    bonus: number; defender: Modifiers; physical: string[];
  }): { amount: number; bonus: number; resistance: number; reduction: number } {
    const bonus = options.bonus;
    let damage = Math.max(0, amount + bonus), resistance = 0, reduction = 0;
    if (type !== 'true') {
      const r = options.defender.resistances ?? {};
      resistance = (r.all ?? 0) + (r[type] ?? (options.physical.includes(type) ? r.physical ?? 0 : 0));
      if (resistance > 0) { damage = Math.floor(damage * (1 - Math.min(1, resistance))); }
      else if (resistance < 0) { damage = Math.floor(damage * (1 + Math.abs(resistance))); }
      reduction = options.defender.damageReduction ?? 0;
      damage = Math.max(0, damage - reduction);
    }
    return { amount: damage, bonus, resistance, reduction };
  }
}
