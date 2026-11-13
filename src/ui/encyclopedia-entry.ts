import { Canon } from '../canon/canon';

// Where something met in play is in the encyclopedia (M19-147: nothing in play led to it): a creature by its base kind
// (a great rat is a rat), by the id of its entry and the name of its kind to search by where it has none of its own.
export class EncyclopediaEntry {
  static creature(raceId: string): { id: string; name: string } | undefined {
    if (!Canon.isSpecies(raceId)) { return undefined; }
    const base = this.catalogued(Canon.resolve('species', raceId).split('/')[0]!);
    return { id: `species-${base.replace(/_/g, '-')}`, name: Canon.creature(raceId).name };
  }
  // A module's own kind (Species manticore_kind "a manticore" like chimera) has no entry of its own, the book being
  // written from the catalogs alone: it is found under the kind it is like, up the variantOf chain, as its portrait
  // is. Its link had named an entry that was nowhere (the boundary inventory, 14 November).
  private static catalogued(id: string, seen: string[] = []): string {
    const like = Canon.installed.has(id) && !seen.includes(id) ? Canon.species[id]?.variantOf : undefined;
    return like ? this.catalogued(Canon.resolve('species', like).split('/')[0]!, [...seen, id]) : id;
  }
  // The page that opens it, beside the game (see EncyclopediaHtml.script).
  static href(entry: { id: string; name: string }): string {
    return `encyclopedia/index.html?id=${encodeURIComponent(entry.id)}&q=${encodeURIComponent(entry.name)}`;
  }
}
