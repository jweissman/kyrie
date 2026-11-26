import { Canon } from '../canon/canon';
import type { ItemCatalog } from '../item-catalog';

// Where something met in play is in the encyclopedia (M19-147: nothing in play led to it): a creature by its base kind
// (a great rat is a rat), by the id of its entry and the name of its kind to search by where it has none of its own.
export class EncyclopediaEntry {
  // And what it looks like, as its kind varies (see Canon.creature), for whoever says it.
  static creature(catalog: ItemCatalog, raceId: string): { id: string; name: string; looks?: string } | undefined {
    if (!catalog.isSpecies(raceId)) { return undefined; }
    const base = this.catalogued(catalog, Canon.resolve('species', raceId).split('/')[0]!),
      kind = catalog.creature(raceId);
    return { id: `species-${base.replace(/_/g, '-')}`, name: kind.name, ...kind.looks ? { looks: kind.looks } : {} };
  }
  // A module's own kind (Species manticore_kind "a manticore" like chimera) has no entry of its own, the book being
  // written from the catalogs alone: it is found under the kind it is like, up the variantOf chain, as its portrait
  // is. Its link had named an entry that was nowhere (the boundary inventory, 14 November).
  private static catalogued(catalog: ItemCatalog, id: string, seen: string[] = []): string {
    const like = !seen.includes(id) ? catalog.localSpecies(id)?.variantOf : undefined;
    return like ? this.catalogued(catalog, Canon.resolve('species', like).split('/')[0]!, [...seen, id]) : id;
  }
  // The page that opens it, beside the game (see EncyclopediaHtml.script).
  static href(entry: { id: string; name: string }): string {
    return `encyclopedia/index.html?id=${encodeURIComponent(entry.id)}&q=${encodeURIComponent(entry.name)}`;
  }
}
