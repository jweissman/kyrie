import { Canon } from './canon';
import { ItemCatalog } from '../item-catalog';
import type { ItemKind, Species } from '../rules/catalog-schema';
import { parseAbility } from '../lang/parse';
import { Vocabularies, type KindsMade, type LocalKindSpec, type LocalSpeciesSpec } from '../lang/vocabulary';

// What one module declares for itself: kinds of thing and kinds of creature that only it has ("a little ox of dreg",
// "the hall dog"). A campaign owns its catalog; unscoped language and catalog tools retain a legacy ambient catalog.
// Within one campaign a name the catalog already has, or another of its modules gave to something else, is an error.
// What the language keeps of them with the module (KindsMade), as this made them (item, species).
export interface LocalCatalog extends KindsMade {
  items?: Record<string, ItemKind & { mass?: number }>;
  species?: Record<string, Species>;
}
type Declared = { source?: object };

export class LocalKinds {
  // A document (a list, a playbill) is carried and read, never worn, and brings nothing unless it says it does: one
  // declared like the glossary of the old script had taken its book slot and its lore (Wapshott's Circus's 12, WPC-12).
  static readonly categories: ItemKind['category'][] = ['weapon', 'armor', 'tool', 'gear', 'consumable', 'equipment',
    'treasure', 'document'];
  // A kind of thing: of a category ("is treasure"), or like a kind the catalog has ("like dagger"), with what it is
  // worth and what it weighs, and what it brings whoever carries it equipped in place of what its like brings
  // ("granting oath": the Wardens' oath-tablet is carried as a book is, and brings the oath, not a glossary's lore).
  // What it grants is a skill of the catalog's or a capability the module declares for itself (breath under the sea,
  // proof against the Fire: the Grand Tour's 9, GTR-09).
  static item(module: string, spec: LocalKindSpec, capabilities: ReadonlySet<string> = new Set(),
    items: Readonly<Record<string, ItemKind>> = Canon.items):
    ItemKind & { mass?: number } {
    const like = spec.base.like ? items[Canon.resolve('items', spec.base.like)] : undefined;
    if (spec.base.like && !like) { throw new Error(`Kind ${spec.id} is like ${spec.base.like}, which is no kind of item`); }
    const category = (spec.base.category ?? like?.category) as ItemKind['category'] | undefined;
    if (!category || !this.categories.includes(category)) {
      const kinds = this.categories.join(', ');
      throw new Error(`Kind ${spec.id} is ${spec.base.category ?? '?'}: a kind of item is one of ${kinds}`);
    }
    if (spec.grants && !Canon.skills[spec.grants] && !capabilities.has(spec.grants)) {
      throw new Error(`Kind ${spec.id} is granting ${spec.grants}, which is no skill nor a capability of the module's`);
    }
    if (spec.slot && !Object.values(items).some(i => i.slot === spec.slot)) {
      throw new Error(`Kind ${spec.id} is worn as ${spec.slot}, where nothing of the catalog is worn`);
    }
    if (spec.use) { this.usable(spec, category); }
    const inherited: Partial<ItemKind> = { ...like, ...spec.grants ? { grants: { skill: spec.grants } } : {},
      ...spec.slot ? { slot: spec.slot } : {}, ...spec.use ? { use: spec.use } : {} };
    if (category === 'consumable' && !inherited.use && !inherited.unsupported?.use) {
      throw new Error(`Kind ${spec.id}: a consumable needs a use`);
    }
    delete inherited.source;
    // What it grants is in place of what its like is for: Gosse's crown of paste, like the glossary, is no glossary.
    if (spec.grants) { delete inherited.tool; delete inherited.aids; }
    return { ...inherited, name: spec.name, category, description: spec.description ?? like?.description ?? spec.name,
      ...spec.worth !== undefined ? { value: spec.worth } : {}, ...spec.mass !== undefined ? { mass: spec.mass } : {},
      source: { kyr: true, notes: `Declared by the module ${module}.` } } as ItemKind & { mass?: number };
  }
  // What using one does is said in the effect language, and read as the module is (a word wrong is the author's to
  // hear at once, not the player's when it is used); and what is used is used up: a consumable (OB-07).
  private static usable(spec: LocalKindSpec, category: ItemKind['category']) {
    if (category !== 'consumable') { throw new Error(`Kind ${spec.id} is using: what is used up is consumable, not ${category}`); }
    try { parseAbility(spec.id, spec.name, spec.use!); } catch (error) {
      throw new Error(`Kind ${spec.id} is using "${spec.use}", which the effect language does not read: ${(error as Error).message}`);
    }
  }
  // A kind of creature like one the bestiary has: its statistics and abilities, with its own name and temperament.
  static species(module: string, spec: LocalSpeciesSpec, body?: (id: string) => Species | undefined): Species {
    const like = body ? body(spec.like) : Canon.isSpecies(spec.like) ? Canon.creature(spec.like) : undefined;
    if (!like) { throw new Error(`Species ${spec.id} is like ${spec.like}, which is no species`); }
    const unknown = spec.habitats?.find(id => !Object.hasOwn(Canon.habitats, id));
    if (unknown) { throw new Error(`Species ${spec.id}: unknown habitat ${unknown}`); }
    return { name: spec.name, description: spec.description ?? like.description,
      variantOf: spec.like, ...spec.temperament ? { temperament: spec.temperament } : {},
      ...spec.habitats ? { habitats: spec.habitats } : {},
      source: { kyr: true, notes: `Declared by the module ${module}.` } };
  }
  // A module's own kinds, joined to the catalogs. The same module may declare a kind again (it is read again, or
  // edited); another may declare the same kind only the same way.
  // Given the setting's own (a spec's kind) or what a module kept of them.
  static install(made: LocalCatalog | KindsMade | undefined) { this.join(made, false); }
  // A module's own kinds as it is read: a kind of item another module of the campaign has given its name to something
  // else is the reading's own while it is read, and becomes its installation's own, under the installation's name
  // (ModuleNamespace), when it is installed (OR-540: the debt's purse_kind and the Lull's, in kite).
  static read(made: LocalCatalog | KindsMade | undefined) { this.join(made, true); }
  private static join(made: LocalCatalog | KindsMade | undefined, reading: boolean) {
    const catalog = this.made(made);
    this.identities(catalog);
    for (const [id, item] of Object.entries(catalog?.items ?? {})) {
      if (!reading || !this.local(id) || !this.differs(Canon.items[id]!, item)) {
        this.same('kind of item', id, Canon.items[id], item);
      }
    }
    for (const [id, species] of Object.entries(catalog?.species ?? {})) {
      this.same('species', id, Canon.species[id], species);
    }
    for (const [id, item] of Object.entries(catalog?.items ?? {})) {
      // Checked before it is recorded as a module's: a kind refused (`Kind dagger`) is not one to take out later, with
      // the catalog's own dagger (Mission 15's independent audit, F1).
      if (reading && this.local(id) && this.differs(Canon.items[id]!, item)) { this.shadow(id); }
      this.installed.add(`item:${id}`);
      (Canon.items as Record<string, ItemKind>)[id] = item;
      (ItemCatalog.definitions as Record<string, unknown>)[id] = { name: item.name, description: item.description,
        ...item.slot ? { slot: item.slot } : {}, ...item.modifiers ? { modifiers: item.modifiers } : {},
        ...item.hooks ? { hooks: item.hooks } : {}, ...item.weapon ? { weapon: item.weapon } : {},
        ...item.armor ? { armor: item.armor } : {}, ...item.use ? { use: item.use } : {},
        ...item.grants?.skill ? { capability: item.grants.skill } : {},
        ...item.grants?.ability ? { ability: item.grants.ability } : {},
        ...item.tool ? { tool: item.tool } : {}, ...item.aids ? { aids: item.aids } : {} };
    }
    for (const [id, species] of Object.entries(catalog?.species ?? {})) {
      this.installed.add(`species:${id}`); Canon.installed.add(id);
      (Canon.species as Record<string, Species>)[id] = species;
    }
  }
  private static identities(catalog: KindsMade | undefined) {
    for (const family of ['items', 'species'] as const) {
      for (const id of Object.keys(catalog?.[family] ?? {})) { this.identity(family, id); }
    }
  }
  // What modules have added to the catalogs, so that it can be taken out again.
  private static readonly installed = new Set<string>();
  // Whether a kind of item is a module's own, put in the catalog as the module was read.
  static local(id: string): boolean { return this.installed.has(`item:${id}`); }
  static snapshot(): LocalCatalog {
    const items: NonNullable<LocalCatalog['items']> = {}, species: NonNullable<LocalCatalog['species']> = {};
    for (const key of this.installed) {
      const [family, id] = key.split(':') as [string, string];
      if (family === 'item') { items[id] = structuredClone(Canon.items[id]!); }
      else { species[id] = structuredClone(Canon.species[id]!); }
    }
    return { items, species };
  }
  // Which kinds modules have put in the catalogs now, and what they mean.
  static fingerprint(): string { return this.signature([...this.installed].sort()); }
  private static signature(keys: string[], catalog?: LocalCatalog): string {
    return JSON.stringify(keys.map(key => {
      const [family, id] = key.split(':') as [string, string];
      return [key, family === 'item' ? (catalog ? catalog.items?.[id] : Canon.items[id])
        : (catalog ? catalog.species?.[id] : Canon.species[id])];
    }));
  }
  // Kyr permits an identifier immediately after a keyword, so a word scan can miss a named kind. A substring may
  // include extra kinds, but never misses one. A declaration using `like` can depend on an already installed kind
  // even when it declares the same name. Worn kinds also depend on the slots available across the catalog.
  static seen(text: string, local?: LocalCatalog): string {
    const keys = local ? [...Object.keys(local.items ?? {}).map(id => `item:${id}`),
      ...Object.keys(local.species ?? {}).map(id => `species:${id}`)].sort() : [...this.installed].sort();
    const words = this.words(text), catalog = JSON.stringify(keys);
    if (words.catalog !== catalog) { words.matches.clear(); words.catalog = catalog; }
    const { items, species, matches } = words, inherited = text.includes('like');
    const named = keys.filter(key => {
      const [family, id] = key.split(':') as [string, string];
      return this.names(text, id, matches) && (inherited || !(family === 'item' ? items : species).has(id));
    });
    const speciesKeys = new Set(keys.filter(key => key.startsWith('species:')));
    const needed = new Set(named), pending = named.filter(key => speciesKeys.has(key));
    while (pending.length) {
      const id = pending.pop()!.slice(8);
      const parent = (local ? local.species?.[id] : Canon.species[id])?.variantOf;
      const key = parent && `species:${Canon.resolve('species', parent).split('/')[0]}`;
      if (key && speciesKeys.has(key) && !needed.has(key)) { needed.add(key); pending.push(key); }
    }
    const slots = text.includes('worn') ? keys.flatMap(key => {
      if (!key.startsWith('item:')) { return []; }
      const slot = local ? local.items?.[key.slice(5)]?.slot : Canon.items[key.slice(5)]?.slot;
      return slot ? [slot] : [];
    }).sort() : [];
    return `v5:${this.signature([...needed].sort(), local)}:${JSON.stringify(slots)}`;
  }
  private static names(text: string, id: string, matches: Map<string, boolean>): boolean {
    let found = matches.get(id);
    if (found === undefined) {
      found = text.includes(id);
      if (matches.size < 512) { matches.set(id, found); }
    }
    return found;
  }
  // The kinds a text declares, gathered once: the same text is keyed many times as a world is read (its
  // parse, its bundle's, its reading ahead), a country's first file a third of a megabyte. The last few hundred kept.
  private static readonly worded = new Map<string, {
    items: Set<string>; species: Set<string>; matches: Map<string, boolean>; catalog?: string;
  }>();
  private static words(text: string): {
    items: Set<string>; species: Set<string>; matches: Map<string, boolean>; catalog?: string;
  } {
    let w = this.worded.get(text);
    if (!w) {
      w = { items: new Set([...text.matchAll(/^\s*Kind ([\p{L}\p{M}_][\p{L}\p{M}\p{N}_-]*) "/gmu)].map(m => m[1]!)),
        species: new Set([...text.matchAll(/^\s*Species ([\p{L}\p{M}_][\p{L}\p{M}\p{N}_-]*) "/gmu)].map(m => m[1]!)),
        matches: new Map() };
      if (this.worded.size >= 400) { this.worded.delete(this.worded.keys().next().value!); }
      this.worded.set(text, w);
    }
    return w;
  }
  // Takes every module's own kinds back out of the catalogs: a new campaign begins with the catalogs as they are.
  static reset() {
    for (const key of this.installed) { this.remove(key); }
    this.installed.clear();
  }
  // Something read ahead of its use (the country beyond a march, parsed while the player reads): the kinds it joins to
  // the catalogs as it is read are taken out again afterwards, so the campaign in play keeps only its own. They join
  // again when what was read is installed (see ModuleBundle.parsed).
  // A kind of the campaign's that what was read gave its name to something else is the campaign's again.
  static aside<T>(read: () => T): T {
    const before = new Set(this.installed), shadowed = new Map<string, [ItemKind, unknown]>();
    this.asides.push(shadowed);
    try { return read(); } finally {
      this.asides.pop();
      for (const key of [...this.installed]) { if (!before.has(key)) { this.remove(key); this.installed.delete(key); } }
      for (const [id, [item, definition]] of shadowed) {
        (Canon.items as Record<string, ItemKind>)[id] = item;
        (ItemCatalog.definitions as Record<string, unknown>)[id] = definition;
      }
    }
  }
  // The kinds of item each reading ahead under way has shadowed, as they were, to be put back when it is put aside.
  private static readonly asides: Map<string, [ItemKind, unknown]>[] = [];
  private static shadow(id: string) {
    const kept = this.asides.at(-1);
    const definitions = ItemCatalog.definitions as Record<string, unknown>;
    if (kept && !kept.has(id)) { kept.set(id, [Canon.items[id]!, definitions[id]]); }
  }
  // Whether two modules' kinds of one name are two kinds: what each is, whoever declared it.
  static differs(a: object, b: object): boolean { return Vocabularies.differs(a, b); }
  static identity(family: 'items' | 'species', id: string) {
    const families = family === 'items'
      ? { ability: Canon.abilities, skill: Canon.skills, deity: Canon.deities, plant: Canon.plants }
      : { ancestry: Canon.ancestries, class: Canon.classes, device: Canon.devices };
    const collision = Object.entries(families).find(([, entries]) => Object.hasOwn(entries, id));
    if (collision) {
      throw new Error(`The ${family === 'items' ? 'item' : 'species'} ${id} is also ${collision[0] === 'ancestry' ? 'an' : 'a'} ${collision[0]}`);
    }
    if (Object.hasOwn(Canon.aliases[family], id)) {
      throw new Error(`The ${family === 'items' ? 'item' : 'species'} ${id} shadows a canonical alias`);
    }
  }
  private static remove(key: string) {
    const [family, id] = key.split(':') as [string, string];
    if (family === 'item') {
      delete (Canon.items as Record<string, ItemKind>)[id];
      delete (ItemCatalog.definitions as Record<string, unknown>)[id];
    } else { delete (Canon.species as Record<string, Species>)[id]; Canon.installed.delete(id); }
  }
  // Replace the legacy ambient catalog.
  static activate(catalog: KindsMade | undefined) {
    this.identities(catalog);
    const replacement = this.made(catalog);
    for (const [id, item] of Object.entries(replacement?.items ?? {})) {
      if (!this.local(id)) { this.same('kind of item', id, Canon.items[id], item); }
    }
    for (const [id, species] of Object.entries(replacement?.species ?? {})) {
      if (!Canon.installed.has(id)) { this.same('species', id, Canon.species[id], species); }
    }
    this.reset(); this.install(catalog);
  }
  // Two modules' own kinds together, when modules are joined.
  static merge(...catalogs: (KindsMade | undefined)[]): { catalog?: LocalCatalog } {
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
  static same(family: string, id: string, prior: Declared | undefined, next: Declared) {
    if (!prior) { return; }
    if (!/^Declared by /.test(this.by(prior))) {
      throw new Error(`The ${family} ${id} is already in the catalog; give yours another name, or make it like ${id}`);
    }
    if (this.by(prior) !== this.by(next) && this.bare(prior) !== this.bare(next)) {
      throw new Error(`The ${family} ${id} is declared differently by two modules (${this.by(prior)} ${this.by(next)})`);
    }
  }
  // What a module keeps of its own kinds is what item and species made of them, so the setting's own again.
  private static made(catalog: KindsMade | undefined): LocalCatalog | undefined {
    return catalog as LocalCatalog | undefined;
  }
  private static by(x: Declared): string { return (x.source as { notes?: string } | undefined)?.notes ?? ''; }
  private static bare(x: object): string { return JSON.stringify({ ...x, source: undefined }); }
}
