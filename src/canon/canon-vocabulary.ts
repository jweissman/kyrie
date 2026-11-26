import { Vocabularies, type KindsMade, type LocalKindSpec, type LocalSpeciesSpec, type Vocabulary }
  from '../lang/vocabulary';
import { LocalKinds, type LocalCatalog } from './local-catalog';
import { Canon } from './canon';
import { ItemCatalog } from '../item-catalog';

// The setting's catalogs as the language reads a module against them (see Vocabulary): its kinds of thing, and a
// module's own kinds made from them. Given to the language as this is imported, by whatever loads the setting (the
// content), so that the language itself imports none of it.
export class CanonVocabulary implements Vocabulary {
  readonly id = 'canon';
  kind(id: string): { name: string; use?: unknown } | undefined { return ItemCatalog.ambient[id]; }
  item(module: string, spec: LocalKindSpec, capabilities: ReadonlySet<string>):
    NonNullable<LocalCatalog['items']>[string] { return LocalKinds.item(module, spec, capabilities); }
  species(module: string, spec: LocalSpeciesSpec): NonNullable<LocalCatalog['species']>[string] {
    return LocalKinds.species(module, spec);
  }
  install(catalog: KindsMade | undefined): void { LocalKinds.read(catalog); }
  signature(name: string): string | undefined { return LocalKinds.signature(name); }
  ability(id: string): { name: string; unsupported?: Record<string, string> } | undefined {
    return Canon.abilities[id];
  }
}
Vocabularies.use(new CanonVocabulary());
