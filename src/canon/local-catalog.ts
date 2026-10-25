import { Canon } from './canon';
import { ItemCatalog } from '../item-catalog';
import type { ItemKind, Species } from './schema';

// What one module declares for itself: kinds of thing and kinds of creature that only it has ("a little ox of dreg",
// "the hall dog"). While its campaign is the one in play, its kinds join the catalogs under the names it gave them,
// as if they had always been there, for the module and for anything that reads the catalogs (the item list, the
// bestiary, a save restored later); when another campaign is played, they leave them, so two campaigns may give the
// same name to different things. Within one campaign a name the catalog already has, or another of its modules gave
// to something else, is an error.
export interface LocalCatalog {
  items?: Record<string, ItemKind & { mass?: number }>;
  species?: Record<string, Species>;
}
type Declared = { source?: object };
export interface LocalKindSpec {
  id: string; name: string; base: { category?: ItemKind['category']; like?: string }; worth?: number; mass?: number;
  description?: string; grants?: string;
}
export interface LocalSpeciesSpec {
  id: string; name: string; like: string; temperament?: string; description?: string; habitats?: string[];
}

export class LocalKinds {
  static readonly categories: ItemKind['category'][] = ['weapon', 'armor', 'tool', 'gear', 'consumable', 'equipment',
    'treasure'];
  // A kind of thing: of a category ("is treasure"), or like a kind the catalog has ("like dagger"), with what it is
  // worth and what it weighs, and what it brings whoever carries it equipped in place of what its like brings
  // ("granting oath": the Wardens' oath-tablet is carried as a book is, and brings the oath, not a glossary's lore).
  static item(module: string, spec: LocalKindSpec): ItemKind & { mass?: number } {
    const like = spec.base.like ? Canon.items[Canon.resolve('items', spec.base.like)] : undefined;
    if (spec.base.like && !like) { throw new Error(`Kind ${spec.id} is like ${spec.base.like}, which is no kind of item`); }
    const category = spec.base.category ?? like?.category;
    if (!category || !this.categories.includes(category)) {
      const kinds = this.categories.join(', ');
      throw new Error(`Kind ${spec.id} is ${spec.base.category ?? '?'}: a kind of item is one of ${kinds}`);
    }
    if (spec.grants && !Canon.skills[spec.grants]) {
      throw new Error(`Kind ${spec.id} is granting ${spec.grants}, which is no skill`);
    }
    const inherited: Partial<ItemKind> = { ...like, ...spec.grants ? { grants: { skill: spec.grants } } : {} };
    delete inherited.source;
    return { ...inherited, name: spec.name, category, description: spec.description ?? like?.description ?? spec.name,
      ...spec.worth !== undefined ? { value: spec.worth } : {}, ...spec.mass !== undefined ? { mass: spec.mass } : {},
      source: { kyr: true, notes: `Declared by the module ${module}.` } } as ItemKind & { mass?: number };
  }
  // A kind of creature like one the bestiary has: its statistics and abilities, with its own name and temperament.
  static species(module: string, spec: LocalSpeciesSpec): Species {
    if (!Canon.isSpecies(spec.like)) { throw new Error(`Species ${spec.id} is like ${spec.like}, which is no species`); }
    return { name: spec.name, description: spec.description ?? Canon.creature(spec.like).description,
      variantOf: spec.like, ...spec.temperament ? { temperament: spec.temperament } : {},
      ...spec.habitats ? { habitats: spec.habitats } : {},
      source: { kyr: true, notes: `Declared by the module ${module}.` } };
  }
  // A module's own kinds, joined to the catalogs. The same module may declare a kind again (it is read again, or
  // edited); another may declare the same kind only the same way.
  static install(catalog: LocalCatalog | undefined) {
    for (const [id, item] of Object.entries(catalog?.items ?? {})) {
      // Checked before it is recorded as a module's: a kind refused (`Kind dagger`) is not one to take out later, with
      // the catalog's own dagger (Mission 15's independent audit, F1).
      this.same('kind of item', id, Canon.items[id], item);
      this.installed.add(`item:${id}`);
      (Canon.items as Record<string, ItemKind>)[id] = item;
      (ItemCatalog.definitions as Record<string, unknown>)[id] = { name: item.name, description: item.description,
        ...item.slot ? { slot: item.slot } : {}, ...item.modifiers ? { modifiers: item.modifiers } : {},
        ...item.hooks ? { hooks: item.hooks } : {}, ...item.weapon ? { weapon: item.weapon } : {},
        ...item.armor ? { armor: item.armor } : {}, ...item.use ? { use: item.use } : {},
        ...item.grants?.skill ? { capability: item.grants.skill } : {},
        ...item.grants?.ability ? { ability: item.grants.ability } : {} };
    }
    for (const [id, species] of Object.entries(catalog?.species ?? {})) {
      this.same('species', id, Canon.species[id], species);
      this.installed.add(`species:${id}`);
      (Canon.species as Record<string, Species>)[id] = species;
    }
  }
  // What modules have added to the catalogs, so that it can be taken out again.
  private static readonly installed = new Set<string>();
  // Takes every module's own kinds back out of the catalogs: a new campaign begins with the catalogs as they are.
  static reset() {
    for (const key of this.installed) { this.remove(key); }
    this.installed.clear(); this.owner = undefined;
  }
  // Something read ahead of its use (the country beyond a march, parsed while the player reads): the kinds it joins to
  // the catalogs as it is read are taken out again afterwards, so the campaign in play keeps only its own. They join
  // again when what was read is installed (see ModuleBundle.parsed).
  static aside<T>(read: () => T): T {
    const before = new Set(this.installed);
    try { return read(); } finally {
      for (const key of [...this.installed]) { if (!before.has(key)) { this.remove(key); this.installed.delete(key); } }
    }
  }
  private static remove(key: string) {
    const [family, id] = key.split(':') as [string, string];
    if (family === 'item') {
      delete (Canon.items as Record<string, ItemKind>)[id];
      delete (ItemCatalog.definitions as Record<string, unknown>)[id];
    } else { delete (Canon.species as Record<string, Species>)[id]; }
  }
  // The campaign in play: its modules' kinds, and no other campaign's.
  static activate(catalog: LocalCatalog | undefined, owner?: object) {
    this.reset(); this.install(catalog); this.owner = owner;
  }
  // The campaign whose kinds are in the catalogs. One that reads its world while another's are (a second game in the
  // same process) puts its own back first, so the first game's things are not taken from it (the audit, F1). The
  // catalogs are still the process's: two campaigns' commands interleaved within one command would still meet.
  private static owner?: object;
  static claim(owner: object, catalog: LocalCatalog | undefined) {
    if (owner !== this.owner) { this.activate(catalog, owner); }
  }
  // Two modules' own kinds together, when modules are joined.
  static merge(...catalogs: (LocalCatalog | undefined)[]): { catalog?: LocalCatalog } {
    // Two modules that give one kind two meanings cannot be joined, whatever they are called (the audit, F1: two
    // modules both labelled `shared`, one coin worth 2 and the other 99).
    for (const family of ['items', 'species'] as const) {
      const seen = new Map<string, string>();
      for (const [id, kind] of catalogs.flatMap(c => Object.entries(c?.[family] ?? {}))) {
        const bare = this.bare(kind as Declared);
        if (seen.has(id) && seen.get(id) !== bare) { throw new Error(`The kind ${id} is declared differently by two modules`); }
        seen.set(id, bare);
      }
    }
    const items = Object.assign({}, ...catalogs.map(c => c?.items ?? {})) as NonNullable<LocalCatalog['items']>;
    const species = Object.assign({}, ...catalogs.map(c => c?.species ?? {})) as NonNullable<LocalCatalog['species']>;
    const catalog = { ...Object.keys(items).length ? { items } : {},
      ...Object.keys(species).length ? { species } : {} };
    return Object.keys(catalog).length ? { catalog } : {};
  }
  private static same(family: string, id: string, prior: Declared | undefined, next: Declared) {
    if (!prior) { return; }
    if (!/^Declared by /.test(this.by(prior))) {
      throw new Error(`The ${family} ${id} is already in the catalog; give yours another name, or make it like ${id}`);
    }
    if (this.by(prior) !== this.by(next) && this.bare(prior) !== this.bare(next)) {
      throw new Error(`The ${family} ${id} is declared differently by two modules (${this.by(prior)} ${this.by(next)})`);
    }
  }
  private static by(x: Declared): string { return (x.source as { notes?: string } | undefined)?.notes ?? ''; }
  private static bare(x: Declared): string { return JSON.stringify({ ...x, source: undefined }); }
}
