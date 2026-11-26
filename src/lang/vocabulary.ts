// What the language may ask of the active setting while it reads a module: whether a kind of thing is one the setting
// knows (and its name, and whether it has a use), and what a module's own kinds come to (Kind cart_wheel like wheel,
// Species ash_hound like wolf), made from the kinds they are like and joined to the setting's while the module is in
// play. The language imports no setting: the setting gives itself (src/canon/canon-vocabulary.ts), so Kyr parsed with
// none knows no kinds and says so rather than loading a catalog (the owner, 14 November: parsing a file had drawn in
// all 1 MB of the catalog). What a text is read into still depends on the kinds known as it is read, and a parse is
// kept by what the reading asked of them (Vocabularies.reading), each name with what it stood for then.
export interface Vocabulary {
  readonly id: string;
  kind(id: string): { name: string; use?: unknown } | undefined;
  item(module: string, spec: LocalKindSpec, capabilities: ReadonlySet<string>): KindMade;
  species(module: string, spec: LocalSpeciesSpec): SpeciesMade;
  install(catalog: KindsMade | undefined): void;
  // What a name stands for now, to be compared later: the same for as long as it means the same, '' for a name that
  // is no kind yet; none for one of the setting's own, which means the same whatever a module declares.
  signature(name: string): string | undefined;
  // An ability the setting has, by its id: its name, and why Kyr cannot run it, where it cannot.
  ability(id: string): { name: string; unsupported?: Record<string, string> } | undefined;
}
// A module's own kind of thing, as it declares it: of a category (`is treasure`) or like a kind the setting has
// (`like dagger`), with what it is worth, weighs, grants, teaches, where it is worn and what using it does.
export interface LocalKindSpec {
  id: string; name: string; base: { category?: string; like?: string }; worth?: number; mass?: number;
  description?: string; grants?: string; teaches?: string; slot?: string; use?: string;
}
// A module's own kind of creature, like one the setting has.
export interface LocalSpeciesSpec {
  id: string; name: string; like: string; temperament?: string; description?: string; habitats?: string[];
}
// What the setting made of a module's own kinds, kept with the module: the language reads only what each is called and
// what a thing weighs; the rest of what each is, is the setting's (src/canon/local-catalog.ts).
export interface KindMade { name: string; mass?: number }
export interface SpeciesMade { name: string }
export interface KindsMade { items?: Record<string, KindMade>; species?: Record<string, SpeciesMade> }
// What a reading asked of the vocabulary that a module may give: references to kind definitions, each the kind's
// identity and its content's (its signature then): what the reading is good for, wherever each stands for the same
// again. Taken from the reading itself, as it asks (Vocabularies.kind, item, species), never guessed from its text; a
// symbol table's references would extend the same record (the symbol-table design's slice D).
export type KindReads = readonly (readonly [kind: string, content: string])[];
// A reading kept, with what it read.
export interface ReadAmong<T> { value: T; reads: KindReads }
interface Reading { reads: Map<string, string>; own: Set<string> }
// The vocabulary in force, as the language asks it. With none given, no kind is known, and a module that declares its
// own has nothing to make them from.
export class Vocabularies {
  private static active?: Vocabulary;
  static use(vocabulary: Vocabulary): void { this.active = vocabulary; }
  static get id(): string { return this.active?.id ?? 'none'; }
  static kind(id: string): { name: string; use?: unknown } | undefined {
    this.asked(id); return this.active?.kind(id);
  }
  static item(module: string, spec: LocalKindSpec, capabilities: ReadonlySet<string>): KindMade {
    if (!this.active) { throw new Error(`Kind ${spec.id}: no setting is active to make it from`); }
    if (spec.base.like) { this.asked(spec.base.like); }
    return this.active.item(module, spec, capabilities);
  }
  static species(module: string, spec: LocalSpeciesSpec): SpeciesMade {
    if (!this.active) { throw new Error(`Species ${spec.id}: no setting is active to make it from`); }
    this.asked(spec.like);
    return this.active.species(module, spec);
  }
  // A module's own kinds, made: what the readings under way read of them after is their own, not what they depend on
  // (a text that declares a kind and places things of it is read the same wherever it is read).
  static install(catalog: KindsMade | undefined): void {
    for (const id of [...Object.keys(catalog?.items ?? {}), ...Object.keys(catalog?.species ?? {})]) {
      for (const r of this.open) { r.own.add(id); r.reads.delete(id); }
    }
    this.active?.install(catalog);
  }
  // The readings under way (a module's, a file's within it, a declaration's within that), each noting what it asks.
  private static readonly open: Reading[] = [];
  // What is read by run, with what it asked of the vocabulary (see KindReads).
  static reading<T>(run: () => T): ReadAmong<T> {
    const r: Reading = { reads: new Map(), own: new Set() };
    this.open.push(r);
    try { return { value: run(), reads: [...r.reads] }; } finally { this.open.splice(this.open.lastIndexOf(r), 1); }
  }
  private static asked(name: string, signature = this.open.length ? this.active?.signature(name) : undefined) {
    if (signature === undefined) { return; }
    for (const r of this.open) { if (!r.own.has(name) && !r.reads.has(name)) { r.reads.set(name, signature); } }
  }
  // What was read, but of the kinds its reading made (a module's merged files read what they declare: its own).
  static apart(reads: KindReads, own: KindsMade | undefined): KindReads {
    return own ? reads.filter(([kind]) => !own.items?.[kind] && !own.species?.[kind]) : reads;
  }
  // Whether each name read stands for what it did.
  static holds(reads: KindReads): boolean {
    return reads.every(([name, signature]) => (this.active?.signature(name) ?? '') === signature);
  }
  // Of readings kept for one text, the one good now, its reads noted for the readings under way as if read again.
  static kept<T>(variants: readonly ReadAmong<T>[] | undefined): ReadAmong<T> | undefined {
    const kept = variants?.find(v => this.holds(v.reads));
    for (const [name, signature] of kept?.reads ?? []) { this.asked(name, signature); }
    return kept;
  }
  // A reading kept beside the others of its text, the latest first: a few, for campaigns that give its kinds other
  // meanings in turn.
  static keep<T>(variants: readonly ReadAmong<T>[] | undefined, kept: ReadAmong<T>): ReadAmong<T>[] {
    const reads = JSON.stringify(kept.reads);
    return [kept, ...(variants ?? []).filter(v => JSON.stringify(v.reads) !== reads).slice(0, 3)];
  }
  static ability(id: string): { name: string; unsupported?: Record<string, string> } | undefined {
    return this.active?.ability(id);
  }
}
