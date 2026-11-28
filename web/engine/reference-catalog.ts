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
    const peoples = CompanyChapters.ancestries();
    // A people's carries its words too, under their heads, and the encyclopedia's section it is a page of: creation
    // sets it as that page (OR-1801).
    const pages = new Map((peoples.entries ?? []).map(e => [e.id, { book: peoples.title, text: [
      ...(e.text ?? []).map(text => ({ text })), ...(e.parts ?? []).map(([heading, text]) => ({ heading, text }))] }]));
    const entries = [...peoples.entries ?? [], ...callings.entries ?? [],
      ...(callings.sections ?? []).flatMap(x => x.entries ?? []), ...CompanyChapters.signs().entries ?? []];
    this.entries = new Map(entries.map(e => [e.id,
      { facts: e.facts ?? [], rules: e.rules ?? [], ...pages.get(e.id) }]));
    return this.entries;
  }
  static entry(id: string): CreationEntry | undefined { return this.all().get(id); }
  static kind(id: string): CreationEntry { return CompanyChapters.kind(id, CatalogContext.canon); }
  static gift(id: string): string { return CompanyChapters.gift(id); }
}
