import type { Screen } from '../ui/screen-types';
import type { Glance } from './glance-types';
import { Doable, type Row } from './doable';
import { JourneyFold } from './journey-fold';
import { PlaceFacets } from './place-facets';
import type { Leaf } from './fold';

// What the map sets out for, as the engine offers it (OR-152; MT-18): every journey of Doable's that is the map's
// (Row.map: across the country, a way into another hex), one row a place, in the engine's words, ranked by what the
// place is to the company (the aim's gold first, then the one precedence: PlaceFacets) and then the nearest. The page's
// map menu had made its own list (MapMenu.roads: the screen's destinations and the facets' places, three at most),
// and a place the engine set out for past those three had no row a key or a reader could reach. Every one is here; the
// menu shows them a page at a time.
export interface MapRow { place: string; name: string; row: Row; minutes: number; leaves?: Leaf[] }
export class MapRows {
  static of(glance: Glance, screen: Screen): MapRow[] {
    const facets = PlaceFacets.of(screen, glance), every = new Map(JourneyFold.every(screen).map(d => [d.id, d]));
    const seen = new Set<string>();
    return Doable.flat(Doable.of(glance, screen)).flatMap(row => {
      const place = row.map ? MapRows.place(row.does) : undefined;
      if (!place || seen.has(place)) { return []; }
      seen.add(place);
      const leaves = facets.get(place);
      const d = every.get(place);
      return [{ place, name: d?.name ?? row.label, row, minutes: row.minutes ?? d?.minutes ?? 0,
        ...leaves ? { leaves } : {} }];
    }).toSorted((a, b) => MapRows.rank(a.leaves) - MapRows.rank(b.leaves) || a.minutes - b.minutes
      || a.place.localeCompare(b.place));
  }
  private static rank(leaves?: Leaf[]): number {
    const i = PlaceFacets.order.findIndex(a => PlaceFacets.aspects(leaves).includes(a));
    return i < 0 ? PlaceFacets.order.length : i;
  }
  // Where a journey's row goes: travel:<place>, or a way's go(<passage>, <place>).
  static place(does?: string): string | undefined {
    return /^travel:(.+)$/.exec(does ?? '')?.[1] ?? /^go\([^,]+,([^)]+)\)$/.exec(does ?? '')?.[1];
  }
}
