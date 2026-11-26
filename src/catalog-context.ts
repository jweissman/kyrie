import type { KindsMade, Vocabulary } from './lang/vocabulary';
import type { ItemDefinition } from './item-catalog';
import type { ItemKind, Species } from './rules/catalog-schema';

// The catalog a campaign owns, exposed to the runtime without depending on the setting that implements it.
export interface CatalogContext extends Vocabulary {
  fingerprint(): string;
  isBody(id: string): boolean;
  isSpecies(id: string): boolean;
  localSpecies(id: string): boolean;
  speciesDefinition(id: string): Species | undefined;
  creature(id: string): Species;
  temperament(id: string): string | undefined;
  itemDefinition(id: string): ItemKind | undefined;
  itemDefinitions(): Record<string, ItemKind>;
  runtimeItem(id: string): ItemDefinition | undefined;
}

export class CatalogContexts {
  // Content's setting adapter registers this once; replacing the language's active vocabulary does not change it.
  private static factory?: (catalog?: KindsMade) => CatalogContext;
  static install(factory: (catalog?: KindsMade) => CatalogContext): void { this.factory = factory; }
  static scoped(catalog?: KindsMade): CatalogContext {
    if (!this.factory) { throw new Error('The setting has not installed a scoped catalog factory; import canon/canon-vocabulary'); }
    return this.factory(catalog);
  }
}
