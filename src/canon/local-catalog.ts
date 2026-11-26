import { Canon } from './canon';
import type { ItemKind, Species } from '../rules/catalog-schema';
import { parseAbility } from '../lang/parse';
import type { KindsMade, LocalKindSpec, LocalSpeciesSpec } from '../lang/vocabulary';

export interface LocalCatalog extends KindsMade {
  items?: Record<string, ItemKind & { mass?: number }>;
  species?: Record<string, Species>;
}
type Declared = { source?: object };

export class LocalKinds {
  static readonly categories: ItemKind['category'][] = ['weapon', 'armor', 'tool', 'gear', 'consumable', 'equipment',
    'treasure', 'document'];
  private readonly items: Record<string, ItemKind & { mass?: number }>;
  private readonly species: Record<string, Species>;

  constructor(items: Record<string, ItemKind & { mass?: number }> = {},
    species: Record<string, Species> = {}) {
    this.items = { ...items };
    this.species = { ...species };
  }
  fork(): LocalKinds { return new LocalKinds(this.items, this.species); }
  kind(id: string): ItemKind | undefined {
    const name = Canon.resolve('items', id);
    return this.items[name] ?? Canon.items[name];
  }
  item(module: string, spec: LocalKindSpec, capabilities: ReadonlySet<string> = new Set()):
    ItemKind & { mass?: number } {
    const like = spec.base.like ? this.kind(spec.base.like) : undefined;
    if (spec.base.like && !like) { throw new Error(`Kind ${spec.id} is like ${spec.base.like}, which is no kind of item`); }
    const category = (spec.base.category ?? like?.category) as ItemKind['category'] | undefined;
    if (!category || !LocalKinds.categories.includes(category)) {
      const kinds = LocalKinds.categories.join(', ');
      throw new Error(`Kind ${spec.id} is ${spec.base.category ?? '?'}: a kind of item is one of ${kinds}`);
    }
    if (spec.grants && !Canon.skills[spec.grants] && !capabilities.has(spec.grants)) {
      throw new Error(`Kind ${spec.id} is granting ${spec.grants}, which is no skill nor a capability of the module's`);
    }
    if (spec.slot && ![...Object.values(Canon.items), ...Object.values(this.items)].some(i => i.slot === spec.slot)) {
      throw new Error(`Kind ${spec.id} is worn as ${spec.slot}, where nothing of the catalog is worn`);
    }
    if (spec.use) { this.usable(spec, category); }
    const inherited: Partial<ItemKind> = { ...like, ...spec.grants ? { grants: { skill: spec.grants } } : {},
      ...spec.slot ? { slot: spec.slot } : {}, ...spec.use ? { use: spec.use } : {} };
    delete inherited.source;
    if (spec.grants) { delete inherited.tool; delete inherited.aids; }
    return { ...inherited, name: spec.name, category, description: spec.description ?? like?.description ?? spec.name,
      ...spec.worth !== undefined ? { value: spec.worth } : {}, ...spec.mass !== undefined ? { mass: spec.mass } : {},
      source: { kyr: true, notes: `Declared by the module ${module}.` } } as ItemKind & { mass?: number };
  }
  private usable(spec: LocalKindSpec, category: ItemKind['category']) {
    if (category !== 'consumable') { throw new Error(`Kind ${spec.id} is using: what is used up is consumable, not ${category}`); }
    try { parseAbility(spec.id, spec.name, spec.use!); } catch (error) {
      throw new Error(`Kind ${spec.id} is using "${spec.use}", which the effect language does not read: ${(error as Error).message}`);
    }
  }
  speciesKind(module: string, spec: LocalSpeciesSpec): Species {
    const name = Canon.resolve('species', spec.like), body = this.species[name] ?? Canon.species[name];
    if (!body && !Canon.isBody(spec.like)) { throw new Error(`Species ${spec.id} is like ${spec.like}, which is no species`); }
    const base = body ?? Canon.creature(spec.like);
    return { name: spec.name, description: spec.description ?? base.description,
      variantOf: spec.like, ...spec.temperament ? { temperament: spec.temperament } : {},
      ...spec.habitats ? { habitats: spec.habitats } : {},
      source: { kyr: true, notes: `Declared by the module ${module}.` } };
  }
  install(made: LocalCatalog | KindsMade | undefined, allowShadow = true): void {
    const catalog = made as LocalCatalog | undefined;
    for (const [id, item] of Object.entries(catalog?.items ?? {})) {
      const prior = this.items[id] ?? Canon.items[id];
      if (prior && !this.items[id]) {
        throw new Error(`The kind of item ${id} is already in the catalog; give yours another name, or make it like ${id}`);
      }
      if (prior && LocalKinds.differs(prior, item) && !allowShadow) {
        throw new Error(`The kind of item ${id} is declared differently by two modules`);
      }
      if (!prior || LocalKinds.differs(prior, item)) { this.items[id] = Object.freeze(item); }
    }
    for (const [id, species] of Object.entries(catalog?.species ?? {})) {
      const prior = this.species[id] ?? Canon.species[id];
      if (prior && !this.species[id]) {
        throw new Error(`The species ${id} is already in the catalog; give yours another name, or make it like ${id}`);
      }
      if (prior && LocalKinds.differs(prior, species) && !allowShadow) {
        throw new Error(`The species ${id} is declared differently by two modules`);
      }
      if (!prior || LocalKinds.differs(prior, species)) { this.species[id] = Object.freeze(species); }
    }
  }
  signature(name: string): string | undefined {
    const item = this.items[name], species = this.species[name];
    if (!item && !species) { return Canon.items[name] || Canon.species[name] || Canon.isBody(name) ? undefined : ''; }
    return `${item ? JSON.stringify(item, (_key, value) => _key === 'source' ? undefined : value) : ''}\u0000`
      + `${species ? JSON.stringify(species, (_key, value) => _key === 'source' ? undefined : value) : ''}`;
  }
  fingerprint(): string {
    return JSON.stringify({ items: Object.keys(this.items).sort(), species: Object.keys(this.species).sort() });
  }
  local(id: string): boolean { return Object.hasOwn(this.items, id); }
  static merge(...catalogs: (KindsMade | undefined)[]): { catalog?: LocalCatalog } {
    for (const family of ['items', 'species'] as const) {
      const seen = new Map<string, string>();
      for (const [id, kind] of catalogs.flatMap(c => Object.entries(c?.[family] ?? {}))) {
        const bare = this.bare(kind as Declared);
        if (seen.has(id) && seen.get(id) !== bare) {
          throw new Error(`The kind ${id} is declared differently by two modules`);
        }
        seen.set(id, bare);
      }
    }
    const items = Object.assign({}, ...catalogs.map(c => c?.items ?? {})) as NonNullable<LocalCatalog['items']>;
    const species = Object.assign({}, ...catalogs.map(c => c?.species ?? {})) as NonNullable<LocalCatalog['species']>;
    const catalog = { ...Object.keys(items).length ? { items } : {},
      ...Object.keys(species).length ? { species } : {} };
    return Object.keys(catalog).length ? { catalog } : {};
  }
  static differs(a: object, b: object): boolean { return this.bare(a) !== this.bare(b); }
  private static bare(x: object): string { return JSON.stringify({ ...x, source: undefined }); }
}
