import type { LocalCatalog, LocalKindSpec, LocalSpeciesSpec } from '../canon/local-catalog';

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
  item(module: string, spec: LocalKindSpec, capabilities: ReadonlySet<string>): NonNullable<LocalCatalog['items']>[string];
  species(module: string, spec: LocalSpeciesSpec): NonNullable<LocalCatalog['species']>[string];
  install(catalog: LocalCatalog | undefined): void;
  seen(text: string): string;
}
// The vocabulary in force, as the language asks it. With none given, no kind is known, and a module that declares its
// own has nothing to make them from.
export class Vocabularies {
  private static active?: Vocabulary;
  static use(vocabulary: Vocabulary): void { this.active = vocabulary; }
  static get id(): string { return this.active?.id ?? 'none'; }
  static kind(id: string): { name: string; use?: unknown } | undefined { return this.active?.kind(id); }
  static item(module: string, spec: LocalKindSpec, capabilities: ReadonlySet<string>):
    NonNullable<LocalCatalog['items']>[string] {
    if (!this.active) { throw new Error(`Kind ${spec.id}: no setting is active to make it from`); }
    return this.active.item(module, spec, capabilities);
  }
  static species(module: string, spec: LocalSpeciesSpec): NonNullable<LocalCatalog['species']>[string] {
    if (!this.active) { throw new Error(`Species ${spec.id}: no setting is active to make it from`); }
    return this.active.species(module, spec);
  }
  static install(catalog: LocalCatalog | undefined): void { this.active?.install(catalog); }
  // What a parse is kept by: the vocabulary, and the kinds in it the text names.
  static seen(text: string): string { return `${this.id}:${this.active?.seen(text) ?? ''}`; }
}
