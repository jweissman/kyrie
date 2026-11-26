import { Vocabularies, type KindsMade, type LocalKindSpec, type LocalSpeciesSpec, type Vocabulary }
  from '../lang/vocabulary';
import { LocalKinds, type LocalCatalog } from './local-catalog';
import { Canon } from './canon';
import { CanonRuntime, type RuntimeItem } from './canon-runtime';
import { ItemCatalog } from '../item-catalog';
import { TextHash } from '../lang/text-hash';
import type { ItemKind, Species } from '../rules/catalog-schema';
import { CatalogContexts } from '../catalog-context';

interface LocalVocabulary {
  items: Record<string, ItemKind>;
  species: Record<string, Species>;
  baseItems: Record<string, ItemKind>;
  baseSpecies: Record<string, Species>;
  definitions: typeof ItemCatalog.definitions;
  fingerprint?: string;
}

// The setting's catalogs as the language reads a module against them (see Vocabulary): its kinds of thing, and a
// module's own kinds made from them. Given to the language as this is imported, by whatever loads the setting (the
// content), so that the language itself imports none of it.
export class CanonVocabulary implements Vocabulary {
  readonly id = 'canon';
  private readonly local?: LocalVocabulary;
  private shadowableSpecies?: Set<string>;
  constructor(catalog?: KindsMade) {
    if (!catalog) { return; }
    this.local = { items: {}, species: {},
      baseItems: Object.fromEntries(Object.entries(Canon.items).filter(([id]) => !LocalKinds.local(id))),
      baseSpecies: Object.fromEntries(Object.entries(Canon.species).filter(([id]) => !Canon.installed.has(id))),
      definitions: Object.fromEntries(Object.entries(ItemCatalog.definitions)
        .filter(([id]) => !LocalKinds.local(id))) };
    this.install(catalog);
  }
  static scoped(catalog?: KindsMade): CanonVocabulary { return new CanonVocabulary(catalog ?? {}); }
  fork(options?: { shadowSpecies?: boolean }): CanonVocabulary {
    const fork = CanonVocabulary.scoped(this.local
      ? { items: this.local.items, species: this.local.species } : LocalKinds.snapshot());
    if (options?.shadowSpecies) { fork.shadowableSpecies = new Set(Object.keys(fork.local!.species)); }
    return fork;
  }
  kind(id: string): { name: string; use?: unknown; slot?: string; fuel?: string } | undefined {
    if (!this.local) { return ItemCatalog.definitions[id]; }
    const kind = this.local.items[id] ?? this.local.definitions[id];
    return kind && structuredClone(kind);
  }
  item(module: string, spec: LocalKindSpec, capabilities: ReadonlySet<string>):
    NonNullable<LocalCatalog['items']>[string] {
    const item = LocalKinds.item(module, spec, capabilities,
      this.local ? { ...this.local.baseItems, ...this.local.items } : Canon.items);
    return this.local ? structuredClone(item) : item;
  }
  species(module: string, spec: LocalSpeciesSpec): NonNullable<LocalCatalog['species']>[string] {
    return LocalKinds.species(module, spec, this.local ? this.parent.bind(this) : undefined);
  }
  private parent(id: string): Species | undefined { return this.isSpecies(id) ? this.creature(id) : undefined; }
  isBody(id: string): boolean {
    if (!this.local) { return Canon.isBody(id); }
    return this.isSpecies(id) || Canon.isDevice(id);
  }
  isSpecies(id: string): boolean {
    if (!this.local) { return Canon.isSpecies(id); }
    const [base, ...variants] = Canon.resolve('species', id).split('/');
    return !!(this.local.species[base!] ?? this.local.baseSpecies[base!])
      && variants.every(variant => Object.hasOwn(Canon.variations, variant));
  }
  localSpecies(id: string): boolean {
    return this.local ? Object.hasOwn(this.local.species, id) : Canon.installed.has(id);
  }
  resolveSpecies(id: string): string { return Canon.resolve('species', id); }
  speciesDefinition(id: string): Species | undefined {
    const resolved = Canon.resolve('species', id).split('/')[0]!;
    const species = this.local
      ? this.local.species[resolved] ?? this.local.baseSpecies[resolved] ?? Canon.devices[resolved]
      : Canon.species[resolved] ?? Canon.devices[resolved];
    return this.local && species ? structuredClone(species) : species;
  }
  bodyName(id: string): string | undefined {
    return this.local ? this.body(id)?.name : Canon.isBody(id) ? Canon.creature(id).name : undefined;
  }
  itemTraits(id: string): { slot?: string; fuel?: string; use?: string } | undefined {
    if (!this.local) { return ItemCatalog.definitions[id]; }
    const item = this.local.items[id];
    return item ? { slot: item.slot, use: item.use, fuel: item.fuel } : this.local.definitions[id];
  }
  itemDefinition(id: string): ItemKind | undefined {
    const resolved = Canon.resolve('items', id);
    const item = this.local ? this.local.items[id] ?? this.local.baseItems[resolved] : Canon.items[resolved];
    return this.local && item ? structuredClone(item) : item;
  }
  itemDefinitions(): Record<string, ItemKind> {
    return this.local ? structuredClone({ ...this.local.baseItems, ...this.local.items }) : Canon.items;
  }
  runtimeItem(id: string): RuntimeItem | undefined {
    if (!this.local) { return ItemCatalog.definitions[id]; }
    const item = this.local.items[id];
    const definition = item ? CanonRuntime.item(item) : this.local.definitions[id];
    return definition && structuredClone(definition);
  }
  creature(id: string): Species {
    const species = this.local ? { ...this.local.baseSpecies, ...this.local.species } : Canon.species;
    const body = Canon.creature(id, [], species);
    return this.local ? structuredClone(body) : body;
  }
  temperament(id: string): string | undefined {
    const species = this.local ? { ...this.local.baseSpecies, ...this.local.species } : Canon.species;
    return Canon.temperament(id, species);
  }
  private body(id: string): Species | undefined {
    return this.isBody(id) ? this.creature(id) : undefined;
  }
  install(catalog: KindsMade | undefined): void {
    if (!this.local) { LocalKinds.read(catalog); return; }
    const made = catalog as LocalCatalog | undefined, local = this.local;
    const items = Object.entries(made?.items ?? {}), species = Object.entries(made?.species ?? {});
    for (const [id] of items) { LocalKinds.identity('items', id); }
    for (const [id] of species) { LocalKinds.identity('species', id); }
    for (const [id, item] of items) {
      if (!local.items[id]) { LocalKinds.same('kind of item', id, local.baseItems[id], item); }
    }
    for (const [id, body] of species) {
      if (!this.shadowableSpecies?.has(id)) {
        LocalKinds.same('species', id, local.species[id] ?? local.baseSpecies[id], body);
      }
    }
    const copiedItems = structuredClone(Object.fromEntries(items));
    const copiedSpecies = structuredClone(Object.fromEntries(species));
    Object.assign(local.items, copiedItems); Object.assign(local.species, copiedSpecies);
    for (const [id] of species) { this.shadowableSpecies?.delete(id); }
    local.fingerprint = undefined;
  }
  seen(text: string): string {
    if (!this.local) { return LocalKinds.seen(text); }
    return LocalKinds.seen(text, { items: this.local.items, species: this.local.species });
  }
  fingerprint(): string {
    if (!this.local) {
      const { items = {}, species = {} } = LocalKinds.snapshot();
      return TextHash.of(JSON.stringify([items, species]));
    }
    return this.local.fingerprint ??= TextHash.of(JSON.stringify([this.local.items, this.local.species]));
  }
  ability(id: string): { name: string; unsupported?: Record<string, string> } | undefined {
    return Canon.abilities[id];
  }
}
Vocabularies.use(new CanonVocabulary());
CatalogContexts.install(CanonVocabulary.scoped.bind(CanonVocabulary));
