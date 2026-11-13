import abilities from '../../data/catalog/abilities.json';
import aliases from '../../data/catalog/aliases.json';
import ancestries from '../../data/catalog/ancestries.json';
import backgrounds from '../../data/catalog/backgrounds.json';
import classes from '../../data/catalog/classes.json';
import conditions from '../../data/catalog/conditions.json';
import arms from '../../data/catalog/items/arms.json';
import armour from '../../data/catalog/items/armour.json';
import naturalArms from '../../data/catalog/items/natural.json';
import gear from '../../data/catalog/items/gear.json';
import consumables from '../../data/catalog/items/consumables.json';
import wonders from '../../data/catalog/items/wonders.json';
import valuables from '../../data/catalog/items/valuables.json';
import gems from '../../data/catalog/items/gems.json';
import plants from '../../data/catalog/plants.json';
import habitats from '../../data/catalog/habitats.json';
import religion from '../../data/catalog/religion.json';
import rules from '../../data/catalog/vocabulary.json';
import skills from '../../data/catalog/skills.json';
import animals from '../../data/catalog/animals.json';
import monsters from '../../data/catalog/monsters.json';
import materials from '../../data/catalog/materials.json';
import variations from '../../data/catalog/variations.json';
import devices from '../../data/catalog/devices.json';
import traits from '../../data/catalog/traits.json';
import orsinoAbilities from '../../data/catalog/orsino/abilities.json';
import orsinoConditions from '../../data/catalog/orsino/conditions.json';
import orsinoTraits from '../../data/catalog/orsino/traits.json';
import orsinoBlessings from '../../data/catalog/orsino/blessings.json';
import orsinoBackgrounds from '../../data/catalog/orsino/backgrounds.json';
import professions from '../../data/catalog/professions.json';
import forms from '../../data/catalog/forms.json';
import { Defenses } from '../rules/defenses';
import { BackgroundCatalog, type BackgroundTables, type CompiledBackground, type Forms, type KyrProfession } from './background-catalog';
import type {
  Ability, Ancestry, CharacterClass, Combat, Condition, Deity, Domain, Habitat, ItemKind, Plant, Procedure, Skill,
  Material, Overlay, Source, Species, Trait,
} from './schema';

export type Family = 'abilities' | 'conditions' | 'traits' | 'items' | 'plants' | 'species' | 'classes';

// The canonical fantasy domain, read from data/catalog. Every other module reads content through this class; no
// runtime code imports a catalog file directly. Abilities, conditions, items and traits combine the generated Orsino
// translation (data/catalog/orsino) with hand-written entries; a hand-written entry may replace a generated one only by
// naming the same Orsino source, which marks it as a deliberate adaptation.
export class Canon {
  static readonly conflicts: string[] = [];
  // A fine make of each ordinary weapon, a smith's best work: a point more on every blow, four times the price
  // (REV-04, the owner's note of 31 October: "no real way to improve weapons").
  // What a plant gives that no item is written for (the owner's plants, 6 November, each added by its record alone): a
  // thing of its own, named for the plant and looking as it does, worth a coin. One written in items.json is that.
  private static gathered(items: Record<string, ItemKind>): Record<string, ItemKind> {
    const made = Object.entries(plants.plants as unknown as Record<string, Plant>)
      .filter(([, p]) => p.yields && !items[p.yields])
      .map(([id, p]): [string, ItemKind] => [Canon.yielded(id, p.yields!), { name: p.name, value: 1,
        description: `${p.looks} Gathered where it grows.`, ...Canon.raw(p),
        source: { kyr: true, notes: `What the plant ${id} gives, made from its record (data/catalog/plants.json).` } }]);
    return { ...items, ...Object.fromEntries(made) };
  }
  // What is gathered of a plant good to eat or to heal is used as it is (the owner, 6 November): a mouthful, or a leaf
  // laid on a hurt, less than a remedy made of it (see HerbRecipes); anything else is gathered to sell or to make with.
  private static raw(p: Plant): Pick<ItemKind, 'category' | 'use'> {
    const uses = (p as { uses?: string[] }).uses ?? [];
    return uses.includes('healing') ? { category: 'consumable', use: 'Heal (1d4) health to ally.' }
      : uses.includes('food') ? { category: 'consumable', use: 'Heal (1) health to ally.' } : { category: 'gear' };
  }
  // The item a plant yields by its own name is its gathered thing (an item and a plant are never one id).
  private static yielded(plant: string, yields: string): string { return yields === plant ? `${plant}_gathered` : yields; }
  private static fine(items: Record<string, ItemKind>): Record<string, ItemKind> {
    const made = Object.entries(items).filter(([id, i]) => i.category === 'weapon' && i.weapon && !id.startsWith('fine_')
      && /^\d+d\d+$/.test(i.weapon.damage.replace(/\s/g, '')) && (i.value ?? 0) > 0 && (i.value ?? 0) <= 50)
      .map(([id, i]): [string, ItemKind] => [`fine_${id}`, { ...i, name: `fine ${i.name}`, value: (i.value ?? 1) * 4,
        description: `${i.description} A smith's best make of it, of better steel and balanced to the hand: it bites `
          + 'a little deeper.', weapon: { ...i.weapon!, damage: `${i.weapon!.damage.replace(/\s/g, '')}+1` },
        source: { kyr: true, notes: `A fine make of ${id}, for the capability market's masters to sell (REV-04).` } }]);
    return { ...items, ...Object.fromEntries(made) };
  }
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
    saveKinds: Record<string, string>; saveLimit: number; procedures: Record<string, Procedure>; combat: Combat;
  };
  static readonly abilities = Canon.merge<Ability>('ability', orsinoAbilities.abilities, abilities.abilities);
  static readonly conditions = Canon.merge<Condition>('condition', orsinoConditions.conditions,
    { ...conditions.conditions, ...Canon.favours() });
  static readonly traits = Canon.merge<Trait>('trait', orsinoTraits.traits, traits.traits);
  static readonly ancestries = ancestries.ancestries as unknown as Record<string, Ancestry>;
  // The base creatures, every one in one of two authored files (animals.json, monsters.json): Orsino's kinds among
  // them by provenance (source.orsino), none generated beside them (the owner, 5 November: one authoritative record).
  static readonly species = Canon.defended(Canon.lived({ ...animals.species, ...monsters.species } as unknown as
    Record<string, Species>));
  // The kinds a module installed as it loaded (see LocalCatalog), belonging to the world that wrote them.
  static readonly installed = new Set<string>();
  // The catalog's own kinds: what generation draws from, never a module's own.
  static get catalogued(): string[] { return Object.keys(this.species).filter(id => !this.installed.has(id)); }
  // The devices that fight without being creatures (data/catalog/devices.json): a turret, a ward, a bomb.
  static readonly devices = Canon.defended(devices.devices as unknown as Record<string, Species>);
  // A body's old resistance map (Orsino's fractions) as its typed defenses, before any it states (the SRD adaptation
  // briefing, §3: introduce defenses, translate the old map at canon load), so that every reader reads defenses.
  private static defended(records: Record<string, Species>): Record<string, Species> {
    return Object.fromEntries(Object.entries(records).map(([id, r]) => {
      if (!r.resistances) { return [id, r]; }
      const { resistances, ...rest } = r;
      return [id, { ...rest, defenses: [...Defenses.translated(resistances), ...r.defenses ?? []] }];
    }));
  }
  // The stuff things are made of (data/catalog/materials.json): named once, and by its id wherever something is of it.
  static readonly materials = materials.materials as unknown as Record<string, Material>;
  static readonly classes = classes.classes as unknown as Record<string, CharacterClass>;
  static readonly skills = skills.skills as unknown as Record<string, Skill>;
  // Every kind of thing, one authored catalog (data/catalog/items/: arms, armour, gear, consumables, wonders,
  // valuables, gems, and the natural weapons of bodies): Orsino's among them by provenance (source.orsino), none
  // generated beside them (the owner, 6 November: one authoritative, authorable item system).
  static readonly items = Canon.gathered(Canon.fine(Canon.shelved([arms, armour, naturalArms, gear, consumables,
    wonders, valuables, gems].map(f => f.items as unknown as Record<string, ItemKind>))));
  // What is a wonder: what the wonders' file holds (a ring of power, a wand), which a dealer in rare things buys.
  static readonly wonders = new Set(Object.keys(wonders.items));
  // The catalog's files as one, each kind once.
  private static shelved(files: Record<string, ItemKind>[]): Record<string, ItemKind> {
    const out: Record<string, ItemKind> = {};
    for (const file of files) {
      for (const [id, item] of Object.entries(file)) {
        if (out[id]) { Canon.conflicts.push(`item ${id}: in two of the item catalog's files`); }
        out[id] = item;
      }
    }
    return out;
  }
  // A domain's blessing is Orsino's, generated; the domain itself (name, alignment, spell domain) is hand-written.
  static readonly domains = Object.fromEntries(Object.entries(religion.domains as unknown as Record<string, Domain>)
    .map(([id, d]) => [id, { ...d, ...(orsinoBlessings.blessings as Record<string, Domain['blessing']>)[id]
      ? { blessing: (orsinoBlessings.blessings as Record<string, Domain['blessing']>)[id] } : {} }])) as Record<string, Domain>;
  static readonly deities = religion.deities as unknown as Record<string, Deity>;
  // A god's favour from its shrine (Orsino's fxBuff "<deity>'s Favor"): the blessing of its faith's domain, carried
  // through the recipient's fights for as many turns as the shrine gives. One condition for each domain with a
  // blessing.
  private static favours(): Record<string, unknown> {
    const domains = religion.domains as unknown as Record<string, Domain>;
    const blessings = orsinoBlessings.blessings as Record<string, Domain['blessing']>;
    return Object.fromEntries(Object.entries(blessings).filter(([id]) => domains[id]).map(([id, b]) => [`favor_${id}`, {
      name: `Favour of ${domains[id]!.name.toLowerCase()}`, lifetime: 'persistent', modifiers: b!.modifiers,
      stacking: 'source-refresh', description: `The favour of a god of ${domains[id]!.name.toLowerCase()}, asked for at a shrine.`,
      begins: `{target} goes out with the favour of ${domains[id]!.name.toLowerCase()}.`,
      ends: `{target}'s favour of ${domains[id]!.name.toLowerCase()} fades.`,
      source: { kyr: true, notes: `Orsino's shrine favour: the ${id} blessing of deityBlessings, for the turns the shrine gives.` },
    }]));
  }
  // The kinds of country life is met in, one vocabulary (data/catalog/habitats.json), and the plants that grow in them
  // (data/catalog/plants.json): organisms.json, which had held both and three animals again, is retired.
  static readonly habitats = habitats.habitats as unknown as Record<string, Habitat>;
  static readonly plants = Canon.grown(plants.plants as unknown as Record<string, Plant>);
  // Where a record says it lives, by the vocabulary's own words, in whatever words its author used (aliases.json,
  // habitats: a forest is the wood, a moor the heath, a garden is by houses and farms; the owner's plants, 6 November).
  private static lived<T extends { habitats?: string[] }>(records: Record<string, T>): Record<string, T> {
    const words = (aliases as unknown as { habitats?: Record<string, string> }).habitats ?? {};
    return Object.fromEntries(Object.entries(records).map(([id, r]) => [id,
      r.habitats ? { ...r, habitats: [...new Set(r.habitats.map(h => words[h] ?? h))] } : r]));
  }
  // And the ground it does best on in its author's words too (rocky_vale is rocky), and what it yields by its id.
  private static grown(records: Record<string, Plant>): Record<string, Plant> {
    const words = (aliases as unknown as { grounds?: Record<string, string> }).grounds ?? {};
    return Object.fromEntries(Object.entries(Canon.lived(records)).map(([id, p]) => [id, { ...p,
      ...p.yields ? { yields: Canon.yielded(id, p.yields) } : {},
      ...p.grounds ? { grounds: [...new Set(p.grounds.map(g => words[g] ?? g))] } : {} }]));
  }
  static readonly aliases = aliases as unknown as Record<Family, Record<string, string>>;
  static resolve(family: Family, id: string): string { return this.aliases[family]?.[id] ?? id; }
  // Orsino's background rows composed with Kyr's background kinds (see BackgroundCatalog).
  static readonly backgrounds: Record<string, CompiledBackground> = BackgroundCatalog.compile(
    orsinoBackgrounds.backgrounds,
    backgrounds as unknown as BackgroundTables, id => Object.hasOwn(Canon.items, Canon.resolve('items', id)),
    { kyr: professions.professions as unknown as Record<string, KyrProfession>,
      forms: forms.forms as Record<string, Forms> });
  static readonly backgroundKinds = (backgrounds as unknown as BackgroundTables).backgroundKindMeaning.groups;
  // A body's record (a species', a device's), by its id or an old name for it (aliases.json: fire_elemental is
  // elemental/fire_element), or a kind composed of a base and what varies it (golem/glass): the base, called by the
  // variations' words, living where the base and they say, the variations made with it (the owner, 6 November: one
  // archetype, its elements, materials and lineages overlays, never a chassis each). One with variantOf is its base
  // with the variant's declared fields laid over it. Cycles are errors.
  static creature(id: string, seen: string[] = []): Species {
    const named = this.resolve('species', id);
    if (named.includes('/')) { return this.composed(named); }
    // Every body the one chassis makes, a creature's (with a module's own kinds, installed as it loads) or a
    // device's: the contract they share (qualities, hit points, a natural strike, powers, nature).
    const own = this.species[named] ?? this.devices[named];
    if (!own) { throw new Error(`Unknown species ${id}`); }
    if (!own.variantOf) { return own; }
    if (seen.includes(id)) { throw new Error(`Species variant cycle: ${[...seen, id].join(' > ')}`); }
    const { variantOf, ...changes } = own;
    return { ...this.creature(variantOf, [...seen, id]), ...changes, variantOf };
  }
  // How a species meets a company: its own temperament, or for a monster the one its type has. An animal without
  // its own (a hare, a moth) has none, and lets the company be.
  static temperament(id: string): string | undefined {
    if (!this.isSpecies(id)) { return undefined; }
    const s = this.creature(id), byType = monsters.temperaments as Record<string, string>;
    return s.temperament ?? (s.kind === 'monster' ? byType[s.type ?? ''] : undefined);
  }
  static isAncestry(id: string): boolean { return Object.hasOwn(this.ancestries, id); }
  static isSpecies(id: string): boolean {
    if (!id) { return false; }
    const named = this.resolve('species', id);
    if (!named.includes('/')) { return Object.hasOwn(this.species, named); }
    const [base, ...ids] = named.split('/');
    return Object.hasOwn(this.species, base!) && ids.every(v => Object.hasOwn(this.variations, v));
  }
  static readonly variations = variations.variations as unknown as Record<string, Overlay>;
  // A base and its variations as one kind (see creature).
  private static composed(id: string): Species {
    const [base, ...ids] = id.split('/'), b = this.creature(base!), over = ids.map(v => this.variations[v]);
    if (over.some(v => !v)) { throw new Error(`Unknown species ${id}`); }
    const words = over.map(v => v!.word).filter(Boolean).join(' '), name = b.name.toLowerCase();
    const habitats = [...new Set([...b.habitats ?? [], ...over.flatMap(v => v!.habitats ?? [])])];
    const abundance = over.map(v => v!.abundance).find(a => a !== undefined) ?? b.abundance;
    // A variation's temper where its base has none or only slips away (a great rat stands its ground); its type where
    // it makes the kind another (the skeletal are undead).
    const temper = over.map(v => v!.temperament).find(Boolean), type = over.map(v => v!.type).find(Boolean);
    const said = over.map(v => v!.says).join(', and ');
    return { ...b, ...Canon.stated(b, over as Overlay[]), name: words ? `${words.charAt(0).toUpperCase()}${words.slice(1)} ${name}` : b.name, variantOf: base!,
      variations: [...b.variations ?? [], ...ids], ...habitats.length ? { habitats } : {},
      ...abundance !== undefined ? { abundance } : {},
      ...temper && (!b.temperament || b.temperament === 'wary') ? { temperament: temper } : {},
      ...type ? { type } : {},
      description: `${b.description} This one is ${said}.`,
      looks: `${b.looks ?? b.description} ${said.charAt(0).toUpperCase()}${said.slice(1)}.` };
  }
  // What a variation that is a stat block makes of its base (see Overlay.hitDice): its Hit Dice in place of the base's
  // growth or fixed hit points, its routine and hide, its defenses beside the base's, and the base's powers and nature
  // less what it goes without. A variation that says none of these leaves the base's as they are.
  private static stated(b: Species, over: Overlay[]): Partial<Species> {
    const hitDice = over.map(v => v.hitDice).find(Boolean), attacks = over.map(v => v.attacks).find(Boolean);
    const armor = over.map(v => v.armor).find(Boolean), defenses = over.flatMap(v => v.defenses ?? []);
    const riders = over.map(v => v.riders).find(Boolean), damage = over.map(v => v.damage).find(Boolean);
    const armorBonus = over.map(v => v.armorBonus).find(Boolean);
    const forgone = new Set(over.flatMap(v => [...v.forgoes?.abilities ?? [], ...v.forgoes?.traits ?? []]));
    if (!hitDice && !attacks && !armor && !defenses.length && !forgone.size && !riders && !damage && !armorBonus) {
      return {};
    }
    const st = { ...b.statistics! };
    // Hit Dice are the whole of its hit points: no growth, no fixed number beside them.
    if (hitDice) { delete st.growth; delete st.hitPoints; }
    return { statistics: { ...st, ...hitDice ? { hitDice } : {}, ...attacks ? { attacks, weapon: attacks[0]! } : {},
      ...armor ? { armor } : {}, ...riders ? { riders } : {}, ...damage ? { damage } : {},
      ...armorBonus ? { armorBonus } : {} },
    ...defenses.length ? { defenses: [...b.defenses ?? [], ...defenses] } : {},
    ...b.abilities ? { abilities: b.abilities.filter(a => !forgone.has(a)) } : {},
    ...b.traits ? { traits: b.traits.filter(t => !forgone.has(t)) } : {} };
  }
  // A body made from its own record, not a person of a people: a creature or a device.
  static isBody(id: string): boolean { return this.isSpecies(id) || this.isDevice(id); }
  static isDevice(id: string): boolean { return Object.hasOwn(this.devices, id); }
  // One of the dead or a spirit who is a he or a she (pron_she), not an it: someone, if they keep the peace (a drowned
  // girl, a captain kneeling in his chapel), where a peaceable beast is an animal.
  static soul(id: string, pronoun?: string): boolean {
    return this.isSpecies(id) && ['monster', 'spirit'].includes(this.creature(id).kind ?? '')
      && !!pronoun && pronoun !== 'pron_it';
  }
}
