import { CompanyChapters } from '../../src/handbook/phb-company';
import { CatalogContext } from '../../src/item-catalog';
import type { CreationEntry } from '../../src/creation/creation-flow';

// The web composition root asks the reference books for creation's catalog details. The player receives those details
// as data; it does not depend on the handbook publisher.
export class ReferenceCatalog {
  private static entries?: Map<string, CreationEntry>;
  private static all(): Map<string, CreationEntry> {
    if (this.entries) { return this.entries; }
    const callings = CompanyChapters.callings(CatalogContext.canon);
    const entries = [...CompanyChapters.ancestries().entries ?? [], ...callings.entries ?? [],
      ...(callings.sections ?? []).flatMap(x => x.entries ?? []), ...CompanyChapters.signs().entries ?? []];
    this.entries = new Map(entries.map(e => [e.id, { facts: e.facts ?? [], rules: e.rules ?? [] }]));
    return this.entries;
  }
  static entry(id: string): CreationEntry | undefined { return this.all().get(id); }
  static kind(id: string): CreationEntry { return CompanyChapters.kind(id, CatalogContext.canon); }
  static gift(id: string): string { return CompanyChapters.gift(id); }
}
