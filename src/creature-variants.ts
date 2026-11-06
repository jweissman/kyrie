import variants from '../data/catalog/orsino/variants.json';
import variations from '../data/catalog/variations.json';
import { Deem, type DeemValue } from 'deem';
import { Canon } from './canon/canon';
import type { Creature } from './model';
import type { Variant, Variants } from './registry/orsino-variants';
import { Creation } from './rules/creation';

// One way a creature differs from its kind, on one axis (data/catalog/variations.json): the word it is called by, what
// is seen of it, what it adds, the kinds of creature it can be, and where a generated country lays it on.
export interface Variation {
  axis: string; word: string; says: string; kinds: string[]; attributes?: Record<string, number>; health?: number;
  abilities?: string[]; traits?: string[]; hint?: string;
  // Where a kind made with it lives, and how commonly (an elemental of sand in the desert), beside its base's.
  habitats?: string[]; abundance?: number;
  // What it makes the creature proof against (a fraction) or hurt by (a negative one), as its kind's are.
  resistances?: Record<string, number>;
  // The types of creature it can be laid on (a material on a construct, an element on an elemental, a lineage on a
  // dragon): any of its kinds, if none is said.
  types?: string[];
  // The natural weapon it gives (a dragon's breath, by its lineage), in place of its kind's; and the material it is of
  // (data/catalog/materials.json).
  weapon?: string; material?: string;
}

// What makes one creature of a kind other than the rest (Orsino's aspects: an agile wolf, a venomous spider), and
// what makes the dead of a kind (its templates: a skeletal wolf, a spectral knight): applied to a creature once it is
// made, adding to its attributes, its abilities and its traits, and said in its name. Aspects are drawn by rarity:
// most creatures met are common, a few are rare, and a very few are legendary.
export class CreatureVariants {
  static readonly table = variants as unknown as Variants;
  static readonly weights: Record<string, number> = { common: 50, uncommon: 25, rare: 15, epic: 7, legendary: 3 };
  static aspect(id: string): Variant | undefined { return this.table.aspects[id]; }
  // Orsino's undead templates are variations of their own axis (undeath: skeletal, spectral, vampiric, rotting).
  static template(id: string): Variation | undefined {
    const v = this.variations[id];
    return v?.axis === 'undeath' ? v : undefined;
  }
  static get templates(): string[] { return Object.keys(this.variations).filter(id => this.template(id)); }
  // An aspect drawn from a roll of 1 to 100: by rarity, then one of that rarity.
  static draw(roll: number, pick: (n: number) => number): string {
    let left = roll;
    const tiers = Object.entries(this.weights);
    const tier = tiers.find(([, w]) => (left -= w) <= 0)?.[0] ?? 'common';
    const list = this.table.rarity[tier] ?? this.table.rarity.common!;
    return list[pick(list.length)]!;
  }
  static readonly variations = variations.variations as Record<string, Variation>;
  // A creature's variations, if they are known ones, fit its kind and type, and none shares an axis with another: why
  // not, else nothing.
  static refused(ids: string[], species?: string): string | undefined {
    const unknown = ids.find(id => !this.variations[id]);
    if (unknown) { return `no variation ${unknown}`; }
    const of = species && Canon.isBody(species) ? Canon.creature(species) : undefined;
    const unfit = of && ids.find(id => { const v = this.variations[id]!;
      return !v.kinds.includes(of.kind ?? 'animal') || (v.types && !v.types.includes(of.type ?? '')); });
    if (unfit) { return `${this.variations[unfit]!.word || unfit} is not for ${Creation.a(species!)}`; }
    const axes = ids.map(id => this.variations[id]!.axis), twice = axes.find((a, i) => axes.indexOf(a) !== i);
    return twice ? `two variations of its ${twice}` : undefined;
  }
  // The variations that fit a creature of a species where it is met (its hints, on the place's facts), one of each
  // axis at most, each drawn by chance: how a generated country makes its dens' beasts its own.
  static fitting(species: string, where: Record<string, DeemValue>, chance: () => number): string[] {
    // A kind named for what varies it (a cave spider: great, of the caves) has those axes taken already.
    const own = Canon.creature(species).variations ?? [], kind = Canon.creature(species).kind ?? 'animal';
    const deem = new Deem({ seed: 1 }), taken = new Set<string>(own.map(id => this.variations[id]!.axis));
    return Object.entries(this.variations).filter(([, v]) => {
      if (!v.hint || taken.has(v.axis) || !v.kinds.includes(kind)
        || (v.types && !v.types.includes(Canon.creature(species).type ?? ''))) { return false; }
      const fits = deem.evaluate(v.hint, where) === true && chance() < 0.5;
      if (fits) { taken.add(v.axis); }
      return fits;
    }).map(([id]) => id);
  }
  // Whether a kind is only ever met with what it lacks: it requires a variation of an axis (an elemental, an element)
  // and its record gives it none (the Elemental bare; not the fire elemental).
  static wanting(kind: string): boolean {
    const s = Canon.creature(kind);
    return !!s.requires && !(s.variations ?? []).some(id => this.variations[id]?.axis === s.requires);
  }
  // What a base is always made of or descended from (its record's requires: an elemental's element, a golem's
  // material, a dragon's lineage): the variations of that axis that fit it, each a kind of it.
  static structurals(kind: string): string[] {
    const s = Canon.creature(kind);
    if (s.variantOf || !s.requires) { return []; }
    return Object.entries(this.variations).filter(([, v]) => v.axis === s.requires && v.kinds.includes(s.kind ?? 'animal')
      && (!v.types || v.types.includes(s.type ?? ''))).map(([id]) => id);
  }
  // What a creature is called with its variations: "a wolf", old and frost, is "an old frost wolf".
  static called(role: string, ids: string[]): string {
    const bare = role.replace(/^(a|an|the) /, ''), named = new Set(bare.toLowerCase().split(/\W+/));
    // A word the kind's own name has already (the cave hound, of the caves) is not said again.
    const words = ids.map(id => this.variations[id]!.word).filter(w => w && !named.has(w.toLowerCase())).join(' ');
    if (!words) { return role; }
    const article = /^(the) /.exec(role)?.[1]
      ?? (/^[aeiou]/.test(words) ? 'an' : 'a');
    return `${article} ${words} ${bare}`;
  }
  // A creature as its context makes it: with its aspect, its template and its variations, which must be known ones.
  static vary(creature: Creature, context: { aspect?: string; template?: string; variations?: string[] }): Creature {
    if (context.aspect) {
      const aspect = this.aspect(context.aspect);
      if (!aspect) { throw new Error(`${creature.id}: no aspect ${context.aspect}`); }
      this.apply(creature, aspect);
    }
    if (context.template && !this.template(context.template)) {
      throw new Error(`${creature.id}: no undead template ${context.template}`);
    }
    // Made of the dead: the template is one more of its variations, kept with it.
    const ids = [...new Set([...context.variations ?? [], ...context.template ? [context.template] : []])];
    const refused = this.refused(ids, creature.raceId);
    if (refused) { throw new Error(`${creature.id}: ${refused}`); }
    // What it is, kept with it (saved and read again as it was made): its variations.
    if (ids.length) { creature.variations = [...ids]; }
    for (const v of ids.map(id => this.variations[id]!)) {
      this.apply(creature, { attributes: v.attributes ?? {}, abilities: v.abilities ?? [], traits: v.traits ?? [] });
      // Its health at each level, and what it has now with it.
      const more = (v.health ?? 0) * creature.base.level;
      creature.base.maxHp = Math.max(1, creature.base.maxHp + more);
      creature.state.hp = Math.max(1, Math.min(creature.base.maxHp, creature.state.hp + more));
    }
    return creature;
  }
  // A creature's natural weapon as its variations make it (a red dragon breathes fire), else its kind's.
  static weapon(creature: Creature, own?: string): string | undefined {
    return (creature.variations ?? []).map(id => this.variations[id]?.weapon).filter(Boolean).at(-1) ?? own;
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
