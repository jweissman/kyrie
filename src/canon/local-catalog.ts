import { Canon } from './canon';
import { ItemCatalog } from '../item-catalog';
import type { ItemKind, Species } from '../rules/catalog-schema';
import { parseAbility } from '../lang/parse';
import type { KindsMade, LocalKindSpec, LocalSpeciesSpec } from '../lang/vocabulary';

// What one module declares for itself: kinds of thing and kinds of creature that only it has ("a little ox of dreg",
// "the hall dog"). While its campaign is the one in play, its kinds join the catalogs under the names it gave them,
// as if they had always been there, for the module and for anything that reads the catalogs (the item list, the
// bestiary, a save restored later); when another campaign is played, they leave them, so two campaigns may give the
// same name to different things. Within one campaign a name the catalog already has, or another of its modules gave
// to something else, is an error.
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
  static item(module: string, spec: LocalKindSpec, capabilities: ReadonlySet<string> = new Set()):
    ItemKind & { mass?: number } {
    const like = spec.base.like ? Canon.items[Canon.resolve('items', spec.base.like)] : undefined;
    if (spec.base.like && !like) { throw new Error(`Kind ${spec.id} is like ${spec.base.like}, which is no kind of item`); }
    const category = (spec.base.category ?? like?.category) as ItemKind['category'] | undefined;
    if (!category || !this.categories.includes(category)) {
      const kinds = this.categories.join(', ');
      throw new Error(`Kind ${spec.id} is ${spec.base.category ?? '?'}: a kind of item is one of ${kinds}`);
    }
    if (spec.grants && !Canon.skills[spec.grants] && !capabilities.has(spec.grants)) {
      throw new Error(`Kind ${spec.id} is granting ${spec.grants}, which is no skill nor a capability of the module's`);
    }
    if (spec.slot && !Object.values(Canon.items).some(i => i.slot === spec.slot)) {
      throw new Error(`Kind ${spec.id} is worn as ${spec.slot}, where nothing of the catalog is worn`);
    }
    if (spec.use) { this.usable(spec, category); }
    const inherited: Partial<ItemKind> = { ...like, ...spec.grants ? { grants: { skill: spec.grants } } : {},
      ...spec.slot ? { slot: spec.slot } : {}, ...spec.use ? { use: spec.use } : {} };
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
  static species(module: string, spec: LocalSpeciesSpec): Species {
    if (!Canon.isBody(spec.like)) { throw new Error(`Species ${spec.id} is like ${spec.like}, which is no species`); }
    return { name: spec.name, description: spec.description ?? Canon.creature(spec.like).description,
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
  // (ModuleNamespace), when it is installed (OR-540: the debt's purse_kind and the Lull's, in kite). The campaign's
  // own come back when it installs what was read (reclaim), or when what was read ahead is put aside.
  static read(made: LocalCatalog | KindsMade | undefined) { this.join(made, true); }
  private static join(made: LocalCatalog | KindsMade | undefined, reading: boolean) {
    const catalog = this.made(made);
    for (const [id, item] of Object.entries(catalog?.items ?? {})) {
      // Checked before it is recorded as a module's: a kind refused (`Kind dagger`) is not one to take out later, with
      // the catalog's own dagger (Mission 15's independent audit, F1).
      if (!reading || !this.local(id) || !this.differs(Canon.items[id]!, item)) {
        this.same('kind of item', id, Canon.items[id], item);
      } else { this.shadow(id); }
      this.installed.add(`item:${id}`);
      (Canon.items as Record<string, ItemKind>)[id] = item;
      (ItemCatalog.ambient as Record<string, unknown>)[id] = ItemCatalog.runtime(item);
    }
    for (const [id, species] of Object.entries(catalog?.species ?? {})) {
      this.same('species', id, Canon.species[id], species);
      this.installed.add(`species:${id}`); Canon.installed.add(id);
      (Canon.species as Record<string, Species>)[id] = species;
    }
  }
  // What modules have added to the catalogs, so that it can be taken out again.
  private static readonly installed = new Set<string>();
  // Whether a kind of item is a module's own, put in the catalog as the module was read.
  static local(id: string): boolean { return this.installed.has(`item:${id}`); }
  // Which kinds modules have put in the catalogs now: what a reading of a module could have turned on.
  static fingerprint(): string { return [...this.installed].sort().join(' '); }
  // What a name stands for now (see Vocabulary.signature): a module's kind, what it is; '' for no kind; none for the
  // catalog's own, which no module may give another meaning (see same). A parse is kept by what it asked of these,
  // not by the names its text holds (a kind's name alone had kept a parse made of another campaign's kind of that
  // name: the compilation-context review, 26 November).
  static signature(name: string): string | undefined {
    const item = this.installed.has(`item:${name}`), species = this.installed.has(`species:${name}`);
    if (!item && !species) { return Canon.items[name] || Canon.species[name] || Canon.isBody(name) ? undefined : ''; }
    return `${item ? this.signed(Canon.items[name]!) : ''}\u0000${species ? this.signed(Canon.species[name]!) : ''}`;
  }
  private static readonly signatures = new WeakMap<object, string>();
  private static signed(kind: object): string {
    let s = this.signatures.get(kind);
    if (s === undefined) { s = this.bare(kind); this.signatures.set(kind, s); }
    return s;
  }
  // Takes every module's own kinds back out of the catalogs: a new campaign begins with the catalogs as they are.
  static reset() {
    for (const key of this.installed) { this.remove(key); }
    this.installed.clear(); this.owner = undefined;
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
        (ItemCatalog.ambient as Record<string, unknown>)[id] = definition;
      }
    }
  }
  // The kinds of item each reading ahead under way has shadowed, as they were, to be put back when it is put aside.
  private static readonly asides: Map<string, [ItemKind, unknown]>[] = [];
  private static shadow(id: string) {
    const kept = this.asides.at(-1);
    const definitions = ItemCatalog.ambient as Record<string, unknown>;
    if (kept && !kept.has(id)) { kept.set(id, [Canon.items[id]!, definitions[id]]); }
  }
  // Whether two modules' kinds of one name are two kinds: what each is, whoever declared it.
  static differs(a: object, b: object): boolean { return this.bare(a) !== this.bare(b); }
  private static remove(key: string) {
    const [family, id] = key.split(':') as [string, string];
    if (family === 'item') {
      delete (Canon.items as Record<string, ItemKind>)[id];
      delete (ItemCatalog.ambient as Record<string, unknown>)[id];
    } else { delete (Canon.species as Record<string, Species>)[id]; Canon.installed.delete(id); }
  }
  // The campaign in play: its modules' kinds, and no other campaign's.
  static activate(catalog: KindsMade | undefined, owner?: object) {
    this.reset(); this.install(catalog); this.owner = owner;
  }
  // The campaign whose kinds are in the catalogs. One that reads its world while another's are (a second game in the
  // same process) puts its own back first, so the first game's things are not taken from it (the audit, F1). The
  // catalogs are still the process's: two campaigns' commands interleaved within one command would still meet.
  private static owner?: object;
  static claim(owner: object, catalog: KindsMade | undefined) {
    if (owner !== this.owner) { this.activate(catalog, owner); }
  }
  // And with a module being installed into it, whose kinds are not yet the campaign's own (see Campaign.install): the
  // campaign's own put back whole, since what was read may have shadowed one of them (see read).
  static reclaim(owner: object, catalog: KindsMade | undefined, installing: KindsMade | undefined) {
    this.activate(catalog, owner); this.install(installing);
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
  private static same(family: string, id: string, prior: Declared | undefined, next: Declared) {
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
