import abilities from '../../data/canon/abilities.json';
import aliases from '../../data/canon/aliases.json';
import ancestries from '../../data/canon/ancestries.json';
import backgrounds from '../../data/canon/backgrounds.json';
import classes from '../../data/canon/classes.json';
import conditions from '../../data/canon/conditions.json';
import items from '../../data/canon/items.json';
import organisms from '../../data/canon/organisms.json';
import religion from '../../data/canon/religion.json';
import rules from '../../data/canon/rules.json';
import skills from '../../data/canon/skills.json';
import species from '../../data/canon/species.json';
import traits from '../../data/canon/traits.json';
import legacyAbilities from '../../data/legacy/abilities.json';
import legacyBackgrounds from '../../data/legacy/backgrounds.json';
import legacyCapabilities from '../../data/legacy/capabilities.json';
import legacyClasses from '../../data/legacy/classes.json';
import legacyCreatures from '../../data/legacy/creatures.json';
import legacyItems from '../../data/legacy/items.json';
import type {
  Ability, Ancestry, Background, CharacterClass, Condition, Deity, Domain, ItemKind, Organism, Procedure, Skill,
  Species, Trait,
} from './schema';

export type Family = 'abilities' | 'conditions' | 'traits' | 'items' | 'organisms';
export interface LegacyClass {
  name: string; role: string; hitDie: number; mana: number; primary: string; abilities: string[]; hpPerLevel: number;
  playable?: boolean; supersededBy?: string;
}
export interface LegacyItem { name: string; description: string; slot?: string; capability?: string; ability?: string;
  armor?: number; power?: number; save?: number; use?: string }

// The canonical fantasy domain, read from data/canon, with the quarantined legacy material in data/legacy kept
// apart. Every other module reads content through this class; no runtime code imports a catalog file directly.
export class Canon {
  static readonly rules = rules as unknown as {
    attributes: string[]; damageTypes: string[]; physicalDamage: string[]; resources: string[];
    saveKinds: Record<string, string>; saveLimit: number; procedures: Record<string, Procedure>;
  };
  static readonly abilities = abilities.abilities as unknown as Record<string, Ability>;
  static readonly conditions = conditions.conditions as unknown as Record<string, Condition>;
  static readonly traits = traits.traits as unknown as Record<string, Trait>;
  static readonly ancestries = ancestries.ancestries as unknown as Record<string, Ancestry>;
  static readonly species = species.species as unknown as Record<string, Species>;
  static readonly classes = classes.classes as unknown as Record<string, CharacterClass>;
  static readonly backgrounds = backgrounds.backgrounds as unknown as Record<string, Background>;
  static readonly skills = skills.skills as unknown as Record<string, Skill>;
  static readonly items = items.items as unknown as Record<string, ItemKind>;
  static readonly domains = religion.domains as unknown as Record<string, Domain>;
  static readonly deities = religion.deities as unknown as Record<string, Deity>;
  static readonly habitats = organisms.habitats as unknown as Record<string, { name: string; terrain?: string }>;
  static readonly organisms = organisms.organisms as unknown as Record<string, Organism>;
  static readonly aliases = aliases as unknown as Record<Family, Record<string, string>>;
  static readonly legacy = {
    abilities: legacyAbilities.abilities as unknown as Record<string, Ability>,
    classes: legacyClasses.classes as unknown as Record<string, LegacyClass>,
    backgrounds: legacyBackgrounds.backgrounds as unknown as Record<string, { name: string; description: string }>,
    grants: legacyCapabilities.grants as unknown as
      Record<string, { classes: string[]; races: string[]; backgrounds: string[] }>,
    items: legacyItems.items as unknown as Record<string, LegacyItem>,
    creatures: legacyCreatures.creatures as unknown as Record<string, { race: string; class: string }>,
    encounters: legacyCreatures.encounters as unknown as Record<string, { race: string; class: string }[]>,
  };
  static resolve(family: Family, id: string): string { return this.aliases[family]?.[id] ?? id; }
  static isLegacy(family: 'abilities' | 'classes' | 'items' | 'backgrounds', id: string): boolean {
    return Object.hasOwn(this.legacy[family], id);
  }
  // A species with variantOf is its base with the variant's declared fields laid over it. Cycles are errors.
  static creature(id: string, seen: string[] = []): Species {
    const own = this.species[id];
    if (!own) { throw new Error(`Unknown species ${id}`); }
    if (!own.variantOf) { return own; }
    if (seen.includes(id)) { throw new Error(`Species variant cycle: ${[...seen, id].join(' > ')}`); }
    const { variantOf, ...changes } = own;
    return { ...this.creature(variantOf, [...seen, id]), ...changes, variantOf };
  }
  static isAncestry(id: string): boolean { return Object.hasOwn(this.ancestries, id); }
  static isSpecies(id: string): boolean { return Object.hasOwn(this.species, id); }
}
