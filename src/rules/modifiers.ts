import type { Attribute } from '../canon/schema';

// Something a condition does at the end of its holder's turn: Orsino's onTurnEnd damage or heal.
// triggers: false, its harm sets off no condition by its kind (see Effect's).
export interface Periodic { kind: 'damage' | 'heal'; amount: string; damageType?: string; triggers?: false }

// Orsino's StatusModifications, restricted to the keys Kyr executes. Keys keep Orsino's names and signs: `ac` is added
// to armour class, which is better when lower (Orsino's dodge is ac -2); every other number is better when higher.
// Conditions, traits, equipment and a creature's kind all contribute through this one vocabulary.
// Bonuses Orsino evaluates with Deem at each use may be dice ("1d4"); sums of dice are kept as one expression.
export type Dice = number | string;
export interface Modifiers {
  toHit?: number; ac?: number; evasion?: number; bonusDamage?: Dice; bonusMeleeDamage?: Dice;
  damageReduction?: number; criticalRangeIncrease?: number; initiative?: number; allRolls?: number;
  saveVersusAll?: number; saves?: Record<string, number>; attributes?: Partial<Record<Attribute, number>>;
  // The share of a blow its holder sends back on whoever dealt it (Orsino's reflect).
  reflectDamagePercent?: number;
  resistances?: Record<string, number>; immune?: string[]; noActions?: boolean; noSpellcasting?: boolean;
  bonusHealing?: Dice; bonusSpellDC?: number; tempHp?: string; onTurnEnd?: Periodic[];
  // Figments that take blows meant for their holder, thrown as the condition is laid (see Images).
  images?: string;
  // Added to the harm of every spell its bearer casts (Orsino's bonusSpellDamage: a singing stone's one).
  bonusSpellDamage?: number;
  // Orsino's turn structure: actions a turn beyond the one (haste +1, slow −1, never fewer than one); acting at random
  // (confused); taking the other side (charmed); and control passing to the other side (dominated).
  extraAttacksPerTurn?: number; randomActions?: boolean; changeAllegiance?: boolean; controlledActions?: boolean;
  // An armour of force (the SRD's Mage Armor, case 22): body armour of that much where it is better than what is worn,
  // never added to it; of two, the better (see Fighting.armorClass).
  force?: number;
  // Concealment (the SRD's, srd-proving-cases.md case 57): the chance in a hundred that a blow which lands at its
  // holder misses after all (Blur's 20, Darkness's), thrown after the hit; of two sources, the better, never summed.
  concealment?: number;
  // A flat resistance to a kind of harm (the SRD's Resist Energy, srd-proving-cases.md case 38): that much off each
  // blow of it, after any fraction; of two sources, the better for each kind, never summed (the SRD's rule).
  resist?: Record<string, number>;
  // Orsino's flee status: a foe so marked leaves the fight when the next round begins.
  flee?: boolean;
  // Orsino's invisible: no one picks it out as the one foe they go for, unless they see the invisible (truesight).
  invisible?: boolean; seeInvisible?: boolean;
}
export type DiceModifier = 'bonusDamage' | 'bonusMeleeDamage' | 'bonusHealing';
export type NumericModifier = 'toHit' | 'ac' | 'evasion' | 'damageReduction' | 'criticalRangeIncrease' | 'initiative'
  | 'allRolls' | 'saveVersusAll' | 'bonusSpellDC' | 'bonusSpellDamage' | 'extraAttacksPerTurn' | 'reflectDamagePercent';
export type FlagModifier = 'noActions' | 'noSpellcasting' | 'randomActions' | 'changeAllegiance' | 'controlledActions'
  | 'flee' | 'invisible' | 'seeInvisible';

export class ModifierSet {
  static readonly numeric: NumericModifier[] = ['toHit', 'ac', 'evasion', 'damageReduction', 'criticalRangeIncrease',
    'initiative', 'allRolls', 'saveVersusAll', 'bonusSpellDC', 'bonusSpellDamage', 'extraAttacksPerTurn',
    // Orsino's reflect: the share of a blow (0.25, 0.5, 0.75) its holder sends back on whoever dealt it.
    'reflectDamagePercent'];
  static readonly dice: DiceModifier[] = ['bonusDamage', 'bonusMeleeDamage', 'bonusHealing'];
  static readonly flags: FlagModifier[] = ['noActions', 'noSpellcasting', 'randomActions', 'changeAllegiance',
    'controlledActions', 'flee', 'invisible', 'seeInvisible'];
  static readonly keys = [...ModifierSet.numeric, ...ModifierSet.dice, ...ModifierSet.flags, 'saves', 'attributes',
    'resistances', 'immune', 'tempHp', 'onTurnEnd', 'force', 'resist', 'images', 'concealment'];
  // Orsino's gatherEffects: numbers add, maps add per key, flags and lists accumulate.
  static sum(list: Modifiers[]): Modifiers {
    const out: Modifiers = {};
    for (const m of list) {
      for (const key of ModifierSet.numeric) {
        if (m[key] !== undefined) { out[key] = (out[key] ?? 0) + m[key]; }
      }
      for (const key of ModifierSet.dice) {
        const v = m[key], prior = out[key];
        if (v === undefined) { continue; }
        out[key] = prior === undefined ? v : typeof prior === 'number' && typeof v === 'number' ? prior + v
          : `${String(prior)} + ${String(v)}`;
      }
      for (const key of ['saves', 'attributes', 'resistances'] as const) {
        for (const [k, v] of Object.entries(m[key] ?? {})) {
          const map = (out[key] ??= {}) as Record<string, number>;
          map[k] = (map[k] ?? 0) + (v as number);
        }
      }
      if (m.immune?.length) { out.immune = [...new Set([...out.immune ?? [], ...m.immune])]; }
      for (const key of ModifierSet.flags) { if (m[key]) { out[key] = true; } }
      if (m.onTurnEnd?.length) { out.onTurnEnd = [...out.onTurnEnd ?? [], ...m.onTurnEnd]; }
      if (m.force !== undefined) { out.force = Math.max(out.force ?? 0, m.force); }
      if (m.concealment !== undefined) { out.concealment = Math.max(out.concealment ?? 0, m.concealment); }
      for (const [k, v] of Object.entries(m.resist ?? {})) { (out.resist ??= {})[k] = Math.max(out.resist[k] ?? 0, v); }
    }
    return out;
  }
  // What a condition's perAmount names that cannot be counted (see ConditionAmount): only scores, saves and numbers.
  static uncounted(m: Modifiers | undefined): string[] {
    return Object.keys(m ?? {}).filter(k => !['attributes', 'saves', ...ModifierSet.numeric].includes(k));
  }
  static validate(m: Modifiers, where: string, vocabulary: { saveKinds: string[]; damageTypes: string[] }) {
    for (const key of Object.keys(m)) {
      if (!ModifierSet.keys.includes(key)) { throw new Error(`${where}: unknown modifier ${key}`); }
    }
    for (const key of ModifierSet.numeric) {
      if (m[key] !== undefined && !Number.isFinite(m[key])) { throw new Error(`${where}: ${key} must be a number`); }
    }
    for (const key of ModifierSet.dice) {
      const v = m[key];
      if (v !== undefined && !(Number.isFinite(v) || (typeof v === 'string' && v.trim()))) {
        throw new Error(`${where}: ${key} must be a number or dice`);
      }
    }
    for (const kind of [...Object.keys(m.saves ?? {}), ...m.immune ?? []]) {
      if (!vocabulary.saveKinds.includes(kind)) { throw new Error(`${where}: unknown save category ${kind}`); }
    }
    for (const [type, value] of Object.entries(m.resistances ?? {})) {
      if (type !== 'all' && !vocabulary.damageTypes.includes(type)) { throw new Error(`${where}: unknown damage type ${type}`); }
      // Orsino allows resistances beyond ±1: above 1 still leaves nothing, below −1 multiplies the damage further.
      if (!Number.isFinite(value)) { throw new Error(`${where}: resistance must be a number`); }
    }
    for (const [type, value] of Object.entries(m.resist ?? {})) {
      if (!vocabulary.damageTypes.includes(type) || !Number.isSafeInteger(value) || value <= 0) {
        throw new Error(`${where}: a flat resistance is a whole number off a known harm`);
      }
    }
    for (const p of m.onTurnEnd ?? []) {
      if (!['damage', 'heal'].includes(p.kind) || typeof p.amount !== 'string' || !p.amount.trim()
        || (p.kind === 'damage' && (!p.damageType || !vocabulary.damageTypes.includes(p.damageType)))) {
        throw new Error(`${where}: invalid turn-end effect`);
      }
    }
  }
}
