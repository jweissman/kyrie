import type { Effect } from '../lang/parse';

// The canonical fantasy domain. Each family has one catalog in data/canon; see doc/architecture/domain-model.md.
export type Attribute = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';
export interface Source { orsino?: string; kyr?: true; fidelity?: 'faithful' | 'adapted'; notes?: string }
export interface Modifiers {
  armor?: number; power?: number; save?: number; saves?: Record<string, number>; immune?: string[];
  resistances?: Record<string, number>;
}
export interface Condition {
  name: string; description: string; lifetime: 'persistent' | 'encounter';
  damage: number; damageType?: string; skip: boolean; armor: number; power: number; save?: number;
  saves?: Record<string, number>; immune?: string[]; resistances?: Record<string, number>;
  stacking?: 'source-refresh'; source?: Source;
}
export type TraitCategory = 'lineage' | 'nature' | 'affinity' | 'character' | 'feat' | 'party' | 'specialization';
export interface Trait {
  name: string; category: TraitCategory; description?: string; modifiers: Modifiers;
  requires?: { ancestry?: string; class?: string; level?: number; ancestries?: string[] };
  spellAccess?: { tradition: 'arcane' | 'divine'; school?: string; domain?: string };
  grants?: { abilities?: string[] }; omits?: Record<string, string>; source: Source;
}
export type AbilityKind = 'technique' | 'spell' | 'natural';
export interface Ability {
  name: string; kind: AbilityKind; description?: string; effect?: string; effects?: Effect[];
  cost?: number; recharge?: number; damagePolicy?: 'typed-v1';
  attack?: { stat: 'strength' | 'dexterity'; defense: number; critical: number };
  spell?: { tradition: 'arcane' | 'divine'; level: number; school?: string; domain?: string };
  source?: Source;
}
export interface Ancestry {
  name: string; description: string; nameGroup: string; classes: string[]; playable?: boolean;
  techniques: string[]; feature: string; lineageTraits?: string[]; source: Source;
}
export interface Statistics {
  attributes: 'rolled' | Record<Attribute, number>; hitPoints?: number; hitDie: number; hpPerLevel: number;
  mana: number; primary: Attribute;
}
export interface Species {
  name: string; description: string; variantOf?: string; type?: string; kind?: 'animal' | 'monster' | 'spirit';
  statistics?: Statistics; abilities?: string[]; traits?: string[]; resistances?: Record<string, number>;
  temperament?: string; habitats?: string[]; source: Source;
}
export interface CharacterClass {
  name: string; description: string; hitDie: number; hpPerLevel: number; mana: number; primary: Attribute;
  abilities: string[]; playable?: boolean; adventuring?: false; skills?: string[]; specializations?: string[];
  source: Source;
}
export interface Background {
  name: string; use: 'background' | 'profession'; attributes: Partial<Record<Attribute, number>>; gold: number;
  requiredClass?: string; skills?: string[]; gear?: string[]; offers?: { kind: string; text: string; fee: number }[];
  routine?: string; source: Source;
}
export interface Skill { name: string; description: string; source: Source }
export interface ItemKind {
  name: string; category: 'weapon' | 'armor' | 'tool' | 'gear' | 'consumable' | 'equipment' | 'treasure';
  description: string; value?: number; slot?: string; use?: string;
  modifiers?: { armor?: number; power?: number; save?: number };
  grants?: { ability?: string; skill?: string }; damage?: { dice: string; type: string };
  rider?: { dice: string; type: string; on: 'hit' }; source: Source;
}
export interface Domain {
  name: string; alignment: 'good' | 'neutral' | 'evil'; description?: string; spellDomain?: string;
  blessing?: { modifiers: Modifiers; omits?: Record<string, string> }; source: Source;
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
