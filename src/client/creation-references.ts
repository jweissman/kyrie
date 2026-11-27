import { CompanyChapters } from '../handbook/phb-company';
import { HandbookText } from '../handbook/text';
import { CatalogContext } from '../item-catalog';
import { BookWording } from '../presentation/book-wording';
import type { CreationReferences } from '../creation/creation-references';
import type { CreationEntry } from '../creation/creation-flow';

export class HandbookCreationReferences implements CreationReferences {
  private entries?: Map<string, CreationEntry>;
  reference(id: string): CreationEntry | undefined {
    this.entries ??= this.written();
    return this.entries.get(id);
  }
  kind(id: string): Pick<CreationEntry, 'facts' | 'rules'> {
    return CompanyChapters.kind(id, CatalogContext.canon);
  }
  ability(id: string): string { return HandbookText.ability(id); }
  trait(id: string): string[] { return HandbookText.trait(id, BookWording); }
  private written(): Map<string, CreationEntry> {
    const callings = CompanyChapters.callings(CatalogContext.canon, BookWording);
    const all = [...CompanyChapters.ancestries(BookWording).entries ?? [], ...callings.entries ?? [],
      ...(callings.sections ?? []).flatMap(x => x.entries ?? []), ...CompanyChapters.signs(BookWording).entries ?? []];
    return new Map(all.map(e => [e.id, { facts: e.facts ?? [], rules: e.rules ?? [] }]));
  }
}
