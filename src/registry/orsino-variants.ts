import type { RegistryEntry } from './orsino-extract';

// A way a creature can be other than its kind: Orsino's aspects (an agile wolf, a venomous spider, an ancient bear),
// drawn when a creature is met, by rarity; and its templates (skeletal, spectral, vampiric, a zombie), which make the
// dead of a kind. Each is what it adds to the creature's attributes, the abilities it gives and the traits it brings.
export interface Variant { attributes: Record<string, number>; abilities: string[]; traits: string[]; source: string }
export interface Variants { aspects: Record<string, Variant>; templates: Record<string, Variant>;
  rarity: Record<string, string[]> }

export class OrsinoVariants {
  static readonly attributes: Record<string, string> = { str: 'strength', dex: 'dexterity', con: 'constitution',
    int: 'intelligence', wis: 'wisdom', cha: 'charisma' };
  constructor(private readonly entries: RegistryEntry[], private readonly known: { abilities: Set<string>;
    traits: Set<string> }) {}
  private of(family: string): RegistryEntry[] { return this.entries.filter(e => e.family === family); }
  generate(): Variants {
    return {
      aspects: Object.fromEntries(this.of('aspect').map(e => {
        const d = e.definition as { creatureAspects?: Record<string, number> & { traits?: string[] };
          creatureAspectAbilities?: string[] };
        const { traits = [], ...mods } = d.creatureAspects ?? {};
        return [e.key, this.variant(e.id, mods as Record<string, number>, d.creatureAspectAbilities ?? [], traits)];
      })),
      templates: Object.fromEntries(this.of('creatureTemplate').map(e => {
        const d = e.definition as Record<string, unknown> & { traits?: string[]; abilities?: string[] };
        const mods = Object.fromEntries(Object.entries(d)
          .filter(([k, v]) => typeof v === 'number' && k in OrsinoVariants.attributes)) as Record<string, number>;
        return [e.key, this.variant(e.id, mods, d.abilities ?? [], d.traits ?? [])];
      })),
      rarity: Object.fromEntries(this.of('aspectRarity').map(e => [e.key, e.definition as string[]])),
    };
  }
  private variant(source: string, mods: Record<string, number>, abilities: string[], traits: string[]): Variant {
    const attributes = Object.fromEntries(Object.entries(mods).map(([k, v]) => [OrsinoVariants.attributes[k] ?? k, v]));
    return { source, attributes,
      abilities: abilities.filter(a => this.known.abilities.has(a)),
      traits: traits.filter(t => this.known.traits.has(t)) };
  }
}
