import variants from '../data/catalog/orsino/variants.json';
import type { Creature } from './model';
import type { Variant, Variants } from './registry/orsino-variants';

// What makes one creature of a kind other than the rest (Orsino's aspects: an agile wolf, a venomous spider), and
// what makes the dead of a kind (its templates: a skeletal wolf, a spectral knight): applied to a creature once it is
// made, adding to its attributes, its abilities and its traits, and said in its name. Aspects are drawn by rarity:
// most creatures met are common, a few are rare, and a very few are legendary.
export class CreatureVariants {
  static readonly table = variants as unknown as Variants;
  static readonly weights: Record<string, number> = { common: 50, uncommon: 25, rare: 15, epic: 7, legendary: 3 };
  static aspect(id: string): Variant | undefined { return this.table.aspects[id]; }
  static template(id: string): Variant | undefined { return this.table.templates[id]; }
  // An aspect drawn from a roll of 1 to 100: by rarity, then one of that rarity.
  static draw(roll: number, pick: (n: number) => number): string {
    let left = roll;
    const tiers = Object.entries(this.weights);
    const tier = tiers.find(([, w]) => (left -= w) <= 0)?.[0] ?? 'common';
    const list = this.table.rarity[tier] ?? this.table.rarity.common!;
    return list[pick(list.length)]!;
  }
  // A creature as its context makes it: with its aspect and its template, which must be known ones.
  static vary(creature: Creature, context: { aspect?: string; template?: string }): Creature {
    for (const [id, variant] of [[context.aspect, context.aspect && this.aspect(context.aspect)],
      [context.template, context.template && this.template(context.template)]] as const) {
      if (!id) { continue; }
      if (!variant) { throw new Error(`${creature.id}: no aspect or undead template ${id}`); }
      this.apply(creature, variant);
    }
    return creature;
  }
  static apply(creature: Creature, variant: Variant) {
    for (const [key, value] of Object.entries(variant.attributes)) {
      const base = creature.base as unknown as Record<string, number>;
      if (typeof base[key] === 'number') { base[key] = Math.max(1, base[key] + value); }
    }
    creature.base.abilities = [...new Set([...creature.base.abilities, ...variant.abilities])];
    creature.traits = [...new Set([...creature.traits ?? [], ...variant.traits])];
  }
}
