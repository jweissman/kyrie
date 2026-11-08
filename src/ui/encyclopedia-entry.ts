import { Canon } from '../canon/canon';

// Where something met in play is in the encyclopedia (M19-147: nothing in play led to it): a creature by its base kind
// (a great rat is a rat), by the id of its entry and the name of its kind to search by where it has none of its own.
export class EncyclopediaEntry {
  static creature(raceId: string): { id: string; name: string } | undefined {
    if (!Canon.isSpecies(raceId)) { return undefined; }
    const base = Canon.resolve('species', raceId).split('/')[0]!;
    return { id: `species-${base.replace(/_/g, '-')}`, name: Canon.creature(raceId).name };
  }
  // The page that opens it, beside the game (see EncyclopediaHtml.script).
  static href(entry: { id: string; name: string }): string {
    return `encyclopedia/index.html?id=${encodeURIComponent(entry.id)}&q=${encodeURIComponent(entry.name)}`;
  }
}
