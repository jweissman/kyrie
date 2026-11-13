import { Vocabularies, type Vocabulary } from '../lang/vocabulary';
import { LocalKinds, type LocalCatalog, type LocalKindSpec, type LocalSpeciesSpec } from './local-catalog';
import { ItemCatalog } from '../item-catalog';

// The setting's catalogs as the language reads a module against them (see Vocabulary): its kinds of thing, and a
// module's own kinds made from them. Given to the language as this is imported, by whatever loads the setting (the
// content, the compiler), so that the language itself imports none of it.
export class CanonVocabulary implements Vocabulary {
  readonly id = 'canon';
  kind(id: string): { name: string; use?: unknown } | undefined { return ItemCatalog.definitions[id]; }
  item(module: string, spec: LocalKindSpec, capabilities: ReadonlySet<string>):
    NonNullable<LocalCatalog['items']>[string] { return LocalKinds.item(module, spec, capabilities); }
  species(module: string, spec: LocalSpeciesSpec): NonNullable<LocalCatalog['species']>[string] {
    return LocalKinds.species(module, spec);
  }
  install(catalog: LocalCatalog | undefined): void { LocalKinds.install(catalog); }
  seen(text: string): string { return LocalKinds.seen(text); }
}
Vocabularies.use(new CanonVocabulary());
