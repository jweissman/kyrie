// What the language may ask of the active setting while it reads a module: whether a kind of thing is one the setting
// knows (and its name, and whether it has a use), and what a module's own kinds come to (Kind cart_wheel like wheel,
// Species ash_hound like wolf), made from the kinds they are like and joined to the setting's while the module is in
// play. The language imports no setting: the setting gives itself (src/canon/canon-vocabulary.ts), so Kyr parsed with
// none knows no kinds and says so rather than loading a catalog (the owner, 14 November: parsing a file had drawn in
// all 1 MB of the catalog). What a text is read into still depends on the kinds known as it is read, and a parse is
// kept by those it names (seen); that what is read depends on them at all is the next boundary to move.
export interface Vocabulary {
  readonly id: string;
  kind(id: string): { name: string; use?: unknown } | undefined;
  item(module: string, spec: LocalKindSpec, capabilities: ReadonlySet<string>): KindMade;
  species(module: string, spec: LocalSpeciesSpec): SpeciesMade;
  install(catalog: KindsMade | undefined): void;
  seen(text: string): string;
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
// The vocabulary in force, as the language asks it. With none given, no kind is known, and a module that declares its
// own has nothing to make them from.
export class Vocabularies {
  private static active?: Vocabulary;
  static use(vocabulary: Vocabulary): void { this.active = vocabulary; }
  static get id(): string { return this.active?.id ?? 'none'; }
  static kind(id: string): { name: string; use?: unknown } | undefined { return this.active?.kind(id); }
  static item(module: string, spec: LocalKindSpec, capabilities: ReadonlySet<string>): KindMade {
    if (!this.active) { throw new Error(`Kind ${spec.id}: no setting is active to make it from`); }
    return this.active.item(module, spec, capabilities);
  }
  static species(module: string, spec: LocalSpeciesSpec): SpeciesMade {
    if (!this.active) { throw new Error(`Species ${spec.id}: no setting is active to make it from`); }
    return this.active.species(module, spec);
  }
  static install(catalog: KindsMade | undefined): void { this.active?.install(catalog); }
  // What a parse is kept by: the vocabulary, and the kinds in it the text names.
  static seen(text: string): string { return `${this.id}:${this.active?.seen(text) ?? ''}`; }
  static ability(id: string): { name: string; unsupported?: Record<string, string> } | undefined {
    return this.active?.ability(id);
  }
}
