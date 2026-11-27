import { VocabularyContext, type KindsMade, type LocalKindSpec, type LocalSpeciesSpec, type Vocabulary }
  from '../lang/vocabulary';
import { LocalKinds, type LocalCatalog } from './local-catalog';
import { Canon } from './canon';
import { ItemCatalog } from '../item-catalog';
import { FantasyVerbs } from './fantasy-verbs';

// The setting's catalogs as the language reads a module against them (see Vocabulary): its kinds of thing, and a
// module's own kinds made from them. Given to the language as this is imported, by whatever loads the setting (the
// content), so that the language itself imports none of it.
export class CanonVocabulary implements Vocabulary {
  readonly id = 'canon';
  static context(): VocabularyContext {
    return new VocabularyContext(new CanonVocabulary(), [], {
      edition: { resolve: FantasyVerbs.resolve, key: FantasyVerbs.key }, bind: FantasyVerbs.forRules,
    });
  }
  constructor(private readonly local = new LocalKinds()) {}
  fork(): Vocabulary { return new CanonVocabulary(this.local.fork()); }
  fingerprint(): string { return this.local.fingerprint(); }
  kind(id: string): { name: string; use?: unknown } | undefined {
    const item = this.local.kind(id) ?? ItemCatalog.canon.find(id);
    return item ? { name: item.name, ...item.use ? { use: item.use } : {} } : undefined;
  }
  item(module: string, spec: LocalKindSpec, capabilities: ReadonlySet<string>):
    NonNullable<LocalCatalog['items']>[string] { return this.local.item(module, spec, capabilities); }
  species(module: string, spec: LocalSpeciesSpec): NonNullable<LocalCatalog['species']>[string] {
    return this.local.speciesKind(module, spec);
  }
  install(catalog: KindsMade | undefined): void { this.local.install(catalog); }
  signature(name: string): string | undefined { return this.local.signature(name); }
  ability(id: string): { name: string; unsupported?: Record<string, string> } | undefined {
    return Canon.abilities[Canon.resolve('abilities', id)];
  }
}
