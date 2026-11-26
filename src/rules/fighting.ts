import type { Modifiers } from './modifiers';
import type { Effect } from '../lang/parse';
import { FantasyRules } from '../fantasy-rules';
import { Defenses, type Defense, type Mitigated } from './defenses';

export interface WeaponProfile {
  id: string; name: string; damage: string; type: string; missile?: boolean; intercept?: boolean; natural?: boolean;
  // Light, medium or heavy: what a perk for a kind of weapon (a knight's heavy hand) reads; and what kind of weapon it
  // is (a bow, a blade), as a fight tells its blow coming (see Telegraph).
  weight?: string; kind?: string;
  // A lesser blow of a kind's routine (a dragon's claws beside its bite): its own dice, without the strength behind
  // the kind's own weapon, as the old games give a dragon's claws a die and its bite the weight.
  lesser?: boolean;
  // What its blow carries beside its damage type (silver, magic), for a defense it passes.
  tags?: string[];
  // What a blow of it carries when it lands (its kind's riders: a ghoul's bite paralyses).
  onHit?: Effect[];
  // A fixed routine's individual ascending attack bonus and signed damage bonus, not added to its scores.
  attackBonus?: number;
  damageBonus?: number;
}
// What the attack roll reads about one combatant: level, effective scores, equipment and gathered modifiers.
export interface Combatant {
  level: number; strength: number; dexterity: number; armorAc: number; weapon: WeaponProfile; modifiers: Modifiers;
  // A fixed stat block's to-hit, in place of its score's modifier (FixedStatBlock).
  fixedToHit?: number;
}
export interface AttackRoll {
  die: number; need: number; toHit: number; armorClass: number; success: boolean; critical: boolean;
  evasion?: { die: number; need: number; evaded: boolean };
  // The concealment's throw (d100 at or under its chance misses), when the defender had some and the blow landed.
  concealment?: { die: number; chance: number; missed: boolean };
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
    // Worn armour, or an armour of force where that is better (never both: the SRD's armour bonus does not stack).
    const armour = Math.max(defender.armorAc, defender.modifiers.force ?? 0);
    return 10 - armour + (defender.modifiers.ac ?? 0) - this.statMod(defender.dexterity);
  }
  // Fighting.attack: a d20 at or above THAC0 − AC − to-hit hits; a natural 1 always misses; 20 less the critical range
  // increase is a critical; a defender with evasion then rolls d20 at or above 20 − evasion to cancel the hit.
  // What a blow is struck at, one number for the roll, its forecast and the page: a fixed stat block's to-hit, or the
  // modifier of the score it is struck with (Dexterity for a missile, else Strength), and what modifies it.
  static toHit(attacker: Combatant): number {
    const missile = attacker.weapon.missile === true;
    const fixed = attacker.weapon.attackBonus;
    return (fixed === undefined ? attacker.fixedToHit ?? this.statMod(missile ? attacker.dexterity : attacker.strength)
      : this.thac0(attacker.level) - 21 + fixed)
      + (attacker.modifiers.toHit ?? 0);
  }
  // A hit at one concealed is thrown for again (percent: d100), and misses at or under the concealment's chance.
  static attack(attacker: Combatant, defender: Combatant, roll: () => number, percent?: () => number): AttackRoll {
    const toHit = this.toHit(attacker);
    const armorClass = this.armorClass(defender);
    const need = this.thac0(attacker.level) - armorClass - toHit;
    const natural = roll(), die = this.d20(() => natural, attacker.modifiers);
    const success = this.lands(natural, die, need, attacker.weapon.attackBonus !== undefined);
    if (!success) { return { die, need, toHit, armorClass, success: false, critical: false }; }
    const critical = success && die >= 20 - (attacker.modifiers.criticalRangeIncrease ?? 0);
    const result: AttackRoll = { die, need, toHit, armorClass, success, critical };
    const hidden = defender.modifiers.concealment ?? 0;
    if (success && hidden > 0 && percent) {
      const thrown = percent();
      result.concealment = { die: thrown, chance: hidden, missed: thrown <= hidden };
      if (result.concealment.missed) { result.success = false; result.critical = false; return result; }
    }
    const evasion = defender.modifiers.evasion ?? 0;
    if (success && evasion) {
      const evade = this.d20(roll, defender.modifiers), needed = 20 - evasion;
      result.evasion = { die: evade, need: needed, evaded: evade >= needed };
      if (result.evasion.evaded) { result.success = false; result.critical = false; }
    }
    return result;
  }
  // The chance an attack lands, before the die is thrown: the d20 (with allRolls) at or above the need and not a 1,
  // and then not evaded. What the company sees on a blow it could strike.
  static chance(attacker: Combatant, defender: Combatant): number {
    const toHit = this.toHit(attacker);
    const need = this.thac0(attacker.level) - this.armorClass(defender) - toHit;
    const evasion = defender.modifiers.evasion ?? 0;
    let hits = 0, evades = 0;
    for (let r = 1; r <= 20; r++) {
      const die = Math.max(1, r + (attacker.modifiers.allRolls ?? 0));
      if (this.lands(r, die, need, attacker.weapon.attackBonus !== undefined)) { hits++; }
      if (evasion && Math.max(1, r + (defender.modifiers.allRolls ?? 0)) >= 20 - evasion) { evades++; }
    }
    return (hits / 20) * (1 - Math.min(100, defender.modifiers.concealment ?? 0) / 100) * (1 - evades / 20);
  }
  private static lands(natural: number, die: number, need: number, fixed: boolean): boolean {
    if (fixed && natural === 20) { return true; }
    return (!fixed || natural !== 1) && die > 1 && die >= need;
  }
  // A touch (the SRD's melee and ranged touch attacks, srd-proving-cases.md case 35): the attack roll as a blow's, by
  // Strength for a touch and Dexterity for a ranged one, against the one touched as though it wore nothing: its armour,
  // its hide and an armour of force do not count, what it dodges by does (the SRD's touch armour class). A touch
  // spell's die makes no telling blow (Kyr's criticals are a weapon's weight).
  // Its throws by their sides: the d20, and a d100 for a concealment (see attack).
  static touch(attacker: Combatant, defender: Combatant, roll: (sides: number) => number, ranged: boolean): AttackRoll {
    const [hand, bare] = this.touching(attacker, defender, ranged);
    return { ...this.attack(hand, bare, () => roll(20), () => roll(100)), critical: false };
  }
  static touchChance(attacker: Combatant, defender: Combatant, ranged: boolean): number {
    const [hand, bare] = this.touching(attacker, defender, ranged);
    return this.chance(hand, bare);
  }
  private static touching(attacker: Combatant, defender: Combatant, ranged: boolean): [Combatant, Combatant] {
    return [{ ...attacker, weapon: { ...attacker.weapon, missile: ranged,
      attackBonus: undefined, damageBonus: undefined } },
      { ...defender, armorAc: 0, modifiers: { ...defender.modifiers, force: 0 } }];
  }
  // Weapon damage after the die: a critical adds max(1, round(damage × 0.2 × max(1, ⌊level / 5⌋))), then the positive
  // STR (melee) or DEX (missile) modifier, then bonusMeleeDamage for melee weapons (Commands.handleAttack).
  // meleeBonus is the attacker's rolled bonusMeleeDamage, which only a melee weapon adds.
  static weaponDamage(attacker: Combatant, rolled: number, critical: boolean,
    meleeBonus = 0): { amount: number; critical: number } {
    const bonus = critical ? Math.max(1, Math.round(rolled * 0.2 * Math.max(1, Math.floor(attacker.level / 5)))) : 0;
    const missile = attacker.weapon.missile === true;
    const stat = attacker.weapon.damageBonus ?? (attacker.weapon.lesser ? 0
      : Math.max(0, this.statMod(missile ? attacker.dexterity : attacker.strength)));
    const melee = missile ? 0 : Math.max(0, meleeBonus);
    const amount = rolled + bonus + stat + melee;
    return { amount: attacker.weapon.damageBonus === undefined ? amount : Math.max(1, amount), critical: bonus };
  }
  // Commands.handleHit after the attack: the attacker's bonusDamage (not against itself), then the defender's
  // defenses in their order (see Defenses: immunity, resistance as a fraction, a flat resistance, the best reduction
  // the blow does not pass; true damage ignores them all). bonus is the attacker's rolled bonusDamage (zero when a
  // creature damages itself or there is no attacker).
  static mitigate(amount: number, type: string, options: {
    bonus: number; defender: Modifiers; physical: string[]; defenses?: readonly Defense[]; tags?: string[];
    evaluate?: (amount: string) => number;
  }): Mitigated {
    return Defenses.mitigate({ amount, bonus: options.bonus, type, physical: options.physical,
      ...options.tags ? { tags: options.tags } : {}, ...options.evaluate ? { evaluate: options.evaluate } : {} },
    options.defender, options.defenses);
  }
}
