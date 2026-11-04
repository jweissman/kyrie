import variants from '../data/catalog/orsino/variants.json';
import variations from '../data/catalog/variations.json';
import { Deem, type DeemValue } from 'deem';
import { Canon } from './canon/canon';
import type { Creature } from './model';
import type { Variant, Variants } from './registry/orsino-variants';

// One way a creature differs from its kind, on one axis (data/catalog/variations.json): the word it is called by, what
// is seen of it, what it adds, the kinds of creature it can be, and where a generated country lays it on.
export interface Variation {
  axis: string; word: string; says: string; kinds: string[]; attributes?: Record<string, number>; health?: number;
  abilities?: string[]; traits?: string[]; hint?: string;
}

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
  static readonly variations = variations.variations as Record<string, Variation>;
  // A creature's variations, if they are known ones and none shares an axis with another: why not, else nothing.
  static refused(ids: string[]): string | undefined {
    const unknown = ids.find(id => !this.variations[id]);
    if (unknown) { return `no variation ${unknown}`; }
    const axes = ids.map(id => this.variations[id]!.axis), twice = axes.find((a, i) => axes.indexOf(a) !== i);
    return twice ? `two variations of its ${twice}` : undefined;
  }
  // The variations that fit a creature of a species where it is met (its hints, on the place's facts), one of each
  // axis at most, each drawn by chance: how a generated country makes its dens' beasts its own.
  static fitting(species: string, where: Record<string, DeemValue>, chance: () => number): string[] {
    const kind = Canon.creature(species).kind ?? 'animal', deem = new Deem({ seed: 1 }), taken = new Set<string>();
    return Object.entries(this.variations).filter(([, v]) => {
      if (!v.hint || taken.has(v.axis) || !v.kinds.includes(kind)) { return false; }
      const fits = deem.evaluate(v.hint, where) === true && chance() < 0.5;
      if (fits) { taken.add(v.axis); }
      return fits;
    }).map(([id]) => id);
  }
  // What a creature is called with its variations: "a wolf", old and frost, is "an old frost wolf".
  static called(role: string, ids: string[]): string {
    const words = ids.map(id => this.variations[id]!.word).join(' ');
    if (!words) { return role; }
    const bare = role.replace(/^(a|an|the) /, ''), article = /^(the) /.exec(role)?.[1]
      ?? (/^[aeiou]/.test(words) ? 'an' : 'a');
    return `${article} ${words} ${bare}`;
  }
  // A creature as its context makes it: with its aspect, its template and its variations, which must be known ones.
  static vary(creature: Creature, context: { aspect?: string; template?: string; variations?: string[] }): Creature {
    for (const [id, variant] of [[context.aspect, context.aspect && this.aspect(context.aspect)],
      [context.template, context.template && this.template(context.template)]] as const) {
      if (!id) { continue; }
      if (!variant) { throw new Error(`${creature.id}: no aspect or undead template ${id}`); }
      this.apply(creature, variant);
    }
    const ids = context.variations ?? [], refused = this.refused(ids);
    if (refused) { throw new Error(`${creature.id}: ${refused}`); }
    for (const v of ids.map(id => this.variations[id]!)) {
      this.apply(creature, { attributes: v.attributes ?? {}, abilities: v.abilities ?? [], traits: v.traits ?? [] });
      // Its health at each level, and what it has now with it.
      const more = (v.health ?? 0) * creature.base.level;
      creature.base.maxHp = Math.max(1, creature.base.maxHp + more);
      creature.state.hp = Math.max(1, Math.min(creature.base.maxHp, creature.state.hp + more));
    }
    return creature;
  }
  static apply(creature: Creature, variant: Pick<Variant, 'attributes' | 'abilities' | 'traits'>) {
    for (const [key, value] of Object.entries(variant.attributes)) {
      const base = creature.base as unknown as Record<string, number>;
      if (typeof base[key] === 'number') { base[key] = Math.max(1, base[key] + value); }
    }
    creature.base.abilities = [...new Set([...creature.base.abilities, ...variant.abilities])];
    creature.traits = [...new Set([...creature.traits ?? [], ...variant.traits])];
  }
}
