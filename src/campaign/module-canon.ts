import type { Entity, Module } from '../lang/module';
import { ModuleParser } from '../lang/module-parser';
import { KeptParses } from '../lang/kept-parses';
import { Vocabularies, type KindsMade, type Vocabulary } from '../lang/vocabulary';
import type { BundleSource } from './bundle-source';

// What the canon declares: the ids that are the world's (its manifest's globals), and each one's declaration.
export interface CanonDeclarations { ids: Set<string>; entities: Map<string, Entity>; catalog: KindsMade }
// The world's canon, data/imbar: Imbar, the planes beyond it and their thresholds, and the names (the College of Dun
// Rì, its House of Doors, the world events) that every world holds before any module is installed (see
// CanonInstall). A module names those it uses in its manifest's "canon", and is given their declarations from this
// one source, bound to the world's own: it writes no stand-in, and declares none of them itself. It may set regions
// of its own within a canonical plane, join its ways to a canonical threshold, and say of a canonical identity where
// it is seated (seatOf); it puts no law on a canonical place, which would hold for every author's places within it.
export class ModuleCanon {
  static readonly id = 'canon';
  static readonly path = 'data/imbar/module.json';
  // Imbar, the material world: every country is a region within it, generated or authored, and a place an author set
  // in no plane is in it too (see Passages.transition, and ModuleBundle.nest).
  static readonly imbar = 'imbar';
  private static readonly sources = new WeakMap<BundleSource, Promise<{
    globals: string[]; texts: string[];
  } | undefined>>();
  static request(source: BundleSource): { id: string; bundle: string } {
    return { id: ModuleCanon.id, bundle: source.resolve(ModuleCanon.path) };
  }
  static is(path: string, source: BundleSource): boolean { return path === source.resolve(ModuleCanon.path); }
  // The canon a source holds, read once for it; none, for a source without data/imbar (a test's handful of files).
  static async declarations(source: BundleSource, vocabulary: Vocabulary = Vocabularies):
    Promise<CanonDeclarations | undefined> {
    let read = this.sources.get(source);
    if (!read) { read = this.read(source); this.sources.set(source, read); }
    const canon = await read;
    if (!canon) { return undefined; }
    const reading = vocabulary.fork?.({ shadowSpecies: true });
    if (!reading) { throw new Error('Reading canon requires a forkable vocabulary'); }
    const parts = KeptParses.together(canon.texts, reading, text => text,
      text => ModuleParser.parse(text, [], reading));
    const entities = parts.flatMap(part => part.entities);
    const catalog = { items: Object.assign({}, ...parts.map(part => part.catalog?.items ?? {})),
      species: Object.assign({}, ...parts.map(part => part.catalog?.species ?? {})) };
    return { ids: new Set(canon.globals), entities: new Map(entities.map(e => [e.id, e])), catalog };
  }
  static supply(canon: CanonDeclarations | undefined, vocabulary: Vocabulary) {
    if (!canon) { return; }
    const items = Object.fromEntries(Object.entries(canon.catalog.items ?? {}).filter(([id]) => !vocabulary.kind(id)));
    const species: NonNullable<KindsMade['species']> = {}, different = new Set<string>();
    for (const [id, body] of Object.entries(canon.catalog.species ?? {})) {
      const known = vocabulary.isSpecies?.(id) ?? vocabulary.isBody?.(id);
      if (known === undefined) { throw new Error('Supplying canon species requires a species-aware vocabulary'); }
      if (!known) { species[id] = body; continue; }
      const current = vocabulary.speciesDefinition?.(id);
      if (!current || Vocabularies.differs(current, body)) { different.add(id); }
    }
    this.dependencies(species, canon.catalog.species ?? {}, different, vocabulary);
    vocabulary.install({ items, species });
  }
  private static dependencies(species: NonNullable<KindsMade['species']>, canon: NonNullable<KindsMade['species']>,
    different: Set<string>, vocabulary: Vocabulary) {
    for (const [id, body] of Object.entries(species)) {
      const seen = new Set<string>();
      for (let parent = body.variantOf; parent;) {
        if (different.size && !vocabulary.resolveSpecies) {
          throw new Error(`Cannot verify canon species ${id}'s parent without species alias resolution`);
        }
        const resolved = (vocabulary.resolveSpecies?.(parent) ?? parent).split('/')[0]!;
        if (seen.has(resolved)) { break; }
        if (different.has(parent) || different.has(resolved)) {
          throw new Error(`Canon species ${id} depends on a different species ${parent}`);
        }
        seen.add(resolved);
        const definition = canon[parent] ?? canon[resolved] ?? vocabulary.speciesDefinition?.(parent);
        if (!definition && different.size) { throw new Error(`Cannot verify canon species ${id}'s parent ${parent}`); }
        parent = definition?.variantOf;
      }
    }
  }
  private static async read(source: BundleSource): Promise<{ globals: string[]; texts: string[] } | undefined> {
    const path = source.resolve(ModuleCanon.path);
    const text = await source.read(path).catch(() => undefined);
    if (text === undefined) { return undefined; }
    const manifest = JSON.parse(text) as { source: string | string[]; globals?: string[] };
    const files = typeof manifest.source === 'string' ? [manifest.source] : manifest.source;
    const texts = await Promise.all(files.map(f => source.read(source.resolve(f, path))));
    return { globals: manifest.globals ?? [], texts };
  }
  // The declarations a module names in its "canon", given to it with the canonical places they lie within and those
  // within them (a plane's threshold comes with the plane): the ids given, which it binds as globals. A module that
  // declares a canonical id itself is refused, as is one naming what the canon does not declare.
  static give(module: Module, names: string[], canon: CanonDeclarations | undefined, path: string): string[] {
    if (!canon) {
      if (names.length) { throw new Error(`${path} names the canon (${names.join(', ')}), but there is no data/imbar`); }
      return [];
    }
    const own = module.entities.find(e => canon.ids.has(e.id));
    if (own) {
      throw new Error(`${path} declares ${own.id}, which is the canon's (data/imbar): name it in the manifest's `
        + '"canon", and declare it nowhere');
    }
    const unknown = names.find(n => !canon.ids.has(n));
    if (unknown) { throw new Error(`${path} names ${unknown} in its "canon", which data/imbar does not declare`); }
    const given = [...canon.ids].filter(id => names.some(n => this.line(canon, id).includes(n)
      || this.line(canon, n).includes(id)));
    module.entities.push(...given.map(id => structuredClone(canon.entities.get(id)!)));
    return given;
  }
  // A canonical entity and the canonical places it lies within, nearest first.
  private static line(canon: CanonDeclarations, id: string): string[] {
    const line: string[] = [];
    for (let at: string | undefined = id; at && !line.includes(at); at = canon.entities.get(at)?.space?.parent) {
      line.push(at);
    }
    return line;
  }
  // The module, composed, as it may stand beside the canon: with no law on a canonical place, and without what its
  // places' setting says of the canon's (indoors, settled), which the canon's own installation has said already and
  // which an installation may not say again of what it imports.
  static settle(module: Module, given: string[]) {
    if (!given.length) { return; }
    const ours = new Set(given), changes = [...module.initial, ...(module.rules ?? []).flatMap(r => r.effects),
      ...module.actions.flatMap(a => [...a.success, ...a.failure])];
    const law = changes.find(c => c.call.name === 'law' && ours.has(c.call.args[0] ?? ''));
    if (law) {
      throw new Error(`law(${law.call.args.join(', ')}): a module puts no law on a place of the canon (data/imbar), `
        + 'which would hold for every author\'s places within it; put it on a place of its own');
    }
    module.initial = module.initial.filter(c => !(['indoors', 'settled'].includes(c.call.name)
      && ours.has(c.call.args[0] ?? '')));
  }
}
