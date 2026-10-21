import { Canon } from '../canon/canon';
import { CanonRuntime } from '../canon/canon-runtime';
import type { Bonuses, Perk, Triggers } from '../canon/schema';

// Where and with what a perk is asked about: the holder's environment and wielded weapon.
export interface PerkContext { environment?: string; weapon?: { weight?: string; missile?: boolean } }
// The perks of the traits a creature holds (a party formation's, a class feature's) that hold where it is, and what
// they give beyond modifiers: triggers (on a kill, on a level) and standing bonuses (longer statuses, more gold).
export class Perks {
  static of(traits: string[] | undefined, at: PerkContext = {}): Perk[] {
    return [...new Set(traits ?? [])].flatMap(id => Canon.traits[Canon.resolve('traits', id)]?.perks ?? [])
      .filter(p => !(p.environment || p.weapon) || CanonRuntime.holds(p, at));
  }
  // A bonus summed over the perks that hold; a multiplier is the largest one (one source of more gold, not several).
  static bonus(traits: string[] | undefined, key: keyof Omit<Bonuses, 'abilityDamage'>, at: PerkContext = {}): number {
    const values = this.of(traits, at).map(p => p.bonuses?.[key]).filter((v): v is number => v !== undefined);
    if (key === 'goldMultiplier') { return values.length ? Math.max(...values) : 1; }
    return values.reduce((a, b) => a + b, 0);
  }
  // How much more one ability's damage is: Orsino's backstabMultiplier for backstab.
  static abilityDamage(traits: string[] | undefined, ability: string, at: PerkContext = {}): number {
    return this.of(traits, at).reduce((m, p) => m * (p.bonuses?.abilityDamage?.[ability] ?? 1), 1);
  }
  static triggers<K extends keyof Triggers>(traits: string[] | undefined, key: K, at: PerkContext = {}):
    NonNullable<Triggers[K]>[number][] {
    return this.of(traits, at).flatMap(p => (p.triggers?.[key] ?? []) as NonNullable<Triggers[K]>[number][]);
  }
}
