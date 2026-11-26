import type { ItemKind } from '../rules/catalog-schema';

export interface CanonItemReader {
  definition(id: string): ItemKind | undefined;
  ids: readonly string[];
}
