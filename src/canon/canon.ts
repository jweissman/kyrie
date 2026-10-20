import abilities from '../../data/catalog/abilities.json';
import aliases from '../../data/catalog/aliases.json';
import ancestries from '../../data/catalog/ancestries.json';
import backgrounds from '../../data/catalog/backgrounds.json';
import classes from '../../data/catalog/classes.json';
import conditions from '../../data/catalog/conditions.json';
import items from '../../data/catalog/items.json';
import organisms from '../../data/catalog/organisms.json';
import religion from '../../data/catalog/religion.json';
import rules from '../../data/catalog/vocabulary.json';
import skills from '../../data/catalog/skills.json';
import species from '../../data/catalog/species.json';
import traits from '../../data/catalog/traits.json';
import orsinoAbilities from '../../data/catalog/orsino/abilities.json';
import orsinoConditions from '../../data/catalog/orsino/conditions.json';
import orsinoItems from '../../data/catalog/orsino/items.json';
import orsinoTraits from '../../data/catalog/orsino/traits.json';
import orsinoBlessings from '../../data/catalog/orsino/blessings.json';
import type {
  Ability, Ancestry, Background, CharacterClass, Condition, Deity, Domain, ItemKind, Organism, Procedure, Skill,
  Source, Species, Trait,
} from './schema';

export type Family = 'abilities' | 'conditions' | 'traits' | 'items' | 'organisms' | 'classes';

// The canonical fantasy domain, read from data/catalog. Every other module reads content through this class; no
// runtime code imports a catalog file directly. Abilities, conditions, items and traits combine the generated Orsino
// translation (data/catalog/orsino) with hand-written entries; a hand-written entry may replace a generated one only by
// naming the same Orsino source, which marks it as a deliberate adaptation.
export class Canon {
  static readonly conflicts: string[] = [];
  private static merge<T extends { source?: Source }>(family: string, generated: Record<string, unknown>,
    own: Record<string, unknown>): Record<string, T> {
    const out = { ...generated } as Record<string, T>;
    for (const [id, entry] of Object.entries(own as Record<string, T>)) {
      const prior = out[id];
      if (prior && prior.source?.orsino !== entry.source?.orsino) {
        Canon.conflicts.push(`${family} ${id}: hand-written entry collides with ${prior.source?.orsino ?? 'a generated entry'}`
          + ' without naming it as its source');
      }
      out[id] = entry;
    }
    return out;
  }
  static readonly rules = rules as unknown as {
    attributes: string[]; damageTypes: string[]; physicalDamage: string[]; resources: string[];
    saveKinds: Record<string, string>; saveLimit: number; procedures: Record<string, Procedure>;
  };
  static readonly abilities = Canon.merge<Ability>('ability', orsinoAbilities.abilities, abilities.abilities);
  static readonly conditions = Canon.merge<Condition>('condition', orsinoConditions.conditions, conditions.conditions);
  static readonly traits = Canon.merge<Trait>('trait', orsinoTraits.traits, traits.traits);
  static readonly ancestries = ancestries.ancestries as unknown as Record<string, Ancestry>;
  static readonly species = species.species as unknown as Record<string, Species>;
  static readonly classes = classes.classes as unknown as Record<string, CharacterClass>;
  static readonly backgrounds = backgrounds.backgrounds as unknown as Record<string, Background>;
  static readonly skills = skills.skills as unknown as Record<string, Skill>;
  static readonly items = Canon.merge<ItemKind>('item', orsinoItems.items, items.items);
  // A domain's blessing is Orsino's, generated; the domain itself (name, alignment, spell domain) is hand-written.
  static readonly domains = Object.fromEntries(Object.entries(religion.domains as unknown as Record<string, Domain>)
    .map(([id, d]) => [id, { ...d, ...(orsinoBlessings.blessings as Record<string, Domain['blessing']>)[id]
      ? { blessing: (orsinoBlessings.blessings as Record<string, Domain['blessing']>)[id] } : {} }])) as Record<string, Domain>;
  static readonly deities = religion.deities as unknown as Record<string, Deity>;
  static readonly habitats = organisms.habitats as unknown as Record<string, { name: string; terrain?: string }>;
  static readonly organisms = organisms.organisms as unknown as Record<string, Organism>;
  static readonly aliases = aliases as unknown as Record<Family, Record<string, string>>;
  static resolve(family: Family, id: string): string { return this.aliases[family]?.[id] ?? id; }
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
