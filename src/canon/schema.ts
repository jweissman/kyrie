import type { Effect } from '../lang/parse';
import type { Modifiers } from '../rules/modifiers';
export type { Modifiers } from '../rules/modifiers';

// The canonical fantasy domain. Each family has one catalog in data/catalog; see doc/architecture/domain-model.md.
export type Attribute = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';
export interface Source { orsino?: string; kyr?: true; fidelity?: 'faithful' | 'adapted'; notes?: string }
// Orsino mechanics an entry does not execute, keyed by the Orsino field, each with the reason.
export type Omissions = Record<string, string>;
// Status hooks: Orsino effect lists that run when the holder attacks, hits, is attacked or is missed.
export interface Hooks { onAttack?: Effect[]; onAttackHit?: Effect[]; onAttacked?: Effect[]; onMissReceived?: Effect[] }
export interface Condition {
  name: string; description: string; lifetime: 'persistent' | 'encounter'; modifiers: Modifiers; hooks?: Hooks;
  // Orsino's trigger: non-lethal damage of this kind makes the target save (DC 15) or gain the condition.
  trigger?: string;
  // The duration a triggered condition lasts (Orsino's status-level duration; abilities name their own).
  duration?: number;
  // The save category a debuff applying this condition uses when the ability names none.
  saveKind?: string;
  // Orsino's compelNextMove and forceTarget: the holder must use that ability, or target whoever applied it.
  compel?: string; forceTarget?: true;
  stacking?: 'source-refresh'; omits?: Omissions; unsupported?: Omissions; source?: Source;
}
export type TraitCategory = 'lineage' | 'nature' | 'affinity' | 'character' | 'feat' | 'party' | 'specialization';
export interface Trait {
  name: string; category: TraitCategory; description?: string; modifiers: Modifiers;
  requires?: { ancestry?: string; class?: string; classes?: string[]; level?: number; ancestries?: string[] };
  spellAccess?: { tradition: 'arcane' | 'divine'; school?: string; domain?: string };
  grants?: { abilities?: string[] }; omits?: Omissions; unsupported?: Omissions; source: Source;
}
export type AbilityKind = 'technique' | 'spell' | 'natural';
export interface Ability {
  name: string; kind: AbilityKind; description?: string; effect?: string; effects?: Effect[];
  // A spell spends one slot; Kyr techniques may still cost mana where they are Kyr's own.
  cost?: number; recharge?: number;
  spell?: { tradition: 'arcane' | 'divine'; level: number; school?: string; domain?: string };
  // Orsino's ability level gate for a technique (a level-2 skill such as Meditate).
  level?: number;
  // Orsino's spell save: offensive spells whose damage halves or negates give each target a save first.
  resist?: { kind: string; difficulty: string };
  requires?: { status?: string; interceptWeapon?: true };
  unsupported?: Omissions; source?: Source;
}
export interface Ancestry {
  name: string; description: string; nameGroup: string; classes: string[]; playable?: boolean;
  attributes: Partial<Record<Attribute, number>>; traits: string[]; forbiddenTraits?: string[];
  techniques?: string[]; feature?: string; source: Source;
}
export interface Statistics {
  attributes: 'rolled' | Record<Attribute, number>; hitPoints?: number; hitDie: number;
  level?: number; weapon: string; armor?: string; primary: Attribute;
}
export interface Species {
  name: string; description: string; variantOf?: string; type?: string; kind?: 'animal' | 'monster' | 'spirit';
  statistics?: Statistics; abilities?: string[]; traits?: string[]; resistances?: Record<string, number>;
  temperament?: string; habitats?: string[]; source: Source;
}
export interface Proficiencies { all?: true; kinds?: string[]; weights?: string[] }
export interface CharacterClass {
  name: string; description: string; hitDie: number; attributes: Partial<Record<Attribute, number>>; gold: number;
  abilities: string[]; playable?: boolean; adventuring?: false; skills?: string[];
  specializations?: string[]; weapons: string[]; armor: string[]; startingGear?: string[];
  proficiencies: {
    weapons: Proficiencies; armor: Proficiencies; items?: Proficiencies & { withoutTradition?: string };
  };
  // Orsino's maxSpellSlotsForCombatant: base plus 2 + level, plus a multiple of a positive attribute modifier.
  slots: { base: number; attribute?: Attribute; multiplier?: number };
  omits?: Omissions; source: Source;
}
export interface Background {
  name: string; use: 'background' | 'profession'; attributes: Partial<Record<Attribute, number>>; gold: number;
  requiredClass?: string; skills?: string[]; gear?: string[]; offers?: { kind: string; text: string; fee: number }[];
  routine?: string; source: Source;
}
export interface Skill { name: string; description: string; source: Source }
export interface WeaponStats {
  damage: string; type: string; kind?: string; weight?: string; missile?: true; intercept?: true; natural?: true;
}
export interface ArmorStats { ac: number; weight: string; type: string }
export interface ItemKind {
  name: string; category: 'weapon' | 'armor' | 'tool' | 'gear' | 'consumable' | 'equipment' | 'treasure';
  description: string; value?: number; slot?: string; use?: string; modifiers?: Modifiers;
  weapon?: WeaponStats; armor?: ArmorStats; hooks?: Hooks;
  grants?: { ability?: string; skill?: string }; unsupported?: Omissions; source: Source;
}
export interface Domain {
  name: string; alignment: 'good' | 'neutral' | 'evil'; description?: string; spellDomain?: string;
  blessing?: { modifiers: Modifiers; omits?: Omissions; unsupported?: Omissions }; source: Source;
}
export interface Deity {
  name: string; domains: string[]; gender?: string; observance?: string;
  blessing?: { id: string; name: string; effect: string }; source: Source;
}
export interface Organism {
  name: string; kind: 'plant' | 'animal'; habitats: string[]; signs: string; species?: string; yields?: string;
  receptive?: boolean; source: Source;
}
export interface Procedure { name: string; effect: string; description: string }
