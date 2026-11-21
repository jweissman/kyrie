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
export interface MapRow { place: string; name: string; row: Row; minutes: number; leaves?: Leaf[]; close?: true }
export class MapRows {
  // Ranked: what stands on the company's own stretch of country first (entered from it: Millholm from hex 89, its
  // gate the engine's row, which the map's menu had offered as "Enter …" and lost with OR-152: int-mat5's CI,
  // test/safe-zone-browser at 1180 wide); then by what each place is to the company; then a journey across the
  // country before a step into the next stretch (a map is for setting out, its next hexes the board's own: int-mat5's
  // CI, test/page-walk-browser, whose landing's first page had been steps alone); then the nearest.
  static of(glance: Glance, screen: Screen): MapRow[] {
    const facets = PlaceFacets.of(screen, glance), every = new Map(JourneyFold.every(screen).map(d => [d.id, d]));
    const seen = new Set<string>(), open = MapRows.open(screen);
    return Doable.flat(Doable.of(glance, screen)).flatMap(row => {
      const to = MapRows.place(row.does), close = !row.map && open && !!to && MapRows.enters(screen, row, to);
      const place = row.map || close ? to : undefined;
      if (!place || seen.has(place)) { return []; }
      seen.add(place);
      const leaves = facets.get(place);
      const d = every.get(place);
      return [{ place, name: d?.name ?? row.label, row, minutes: row.minutes ?? d?.minutes ?? 0,
        ...leaves ? { leaves } : {}, ...close ? { close: true as const } : {} }];
    }).toSorted((a, b) => Number(!!b.close) - Number(!!a.close) || MapRows.rank(a.leaves) - MapRows.rank(b.leaves)
      || MapRows.kind(a.row) - MapRows.kind(b.row) || a.minutes - b.minutes || a.place.localeCompare(b.place));
  }
  // Whether the company stands in a stretch of open country (region__t<cell>), where the map is the place itself.
  private static open(screen: Screen): boolean {
    const tracts = screen.region?.land?.tracts;
    return !!tracts && screen.place.id.startsWith(tracts) && /^\d+$/.test(screen.place.id.slice(tracts.length));
  }
  // A way from here into a place on this stretch (one that does not cross into another).
  private static enters(screen: Screen, row: Row, to: string): boolean {
    return screen.exits.some(e => e.destination.id === to && !e.crosses && (e.id === row.id || row.does?.startsWith('go(')));
  }
  private static kind(row: Row): number { return row.does?.startsWith('travel:') ? 0 : 1; }
  private static rank(leaves?: Leaf[]): number {
    const i = PlaceFacets.order.findIndex(a => PlaceFacets.aspects(leaves).includes(a));
    return i < 0 ? PlaceFacets.order.length : i;
  }
  // Where a journey's row goes: travel:<place>, or a way's go(<passage>, <place>).
  static place(does?: string): string | undefined {
    return /^travel:(.+)$/.exec(does ?? '')?.[1] ?? /^go\([^,]+,([^)]+)\)$/.exec(does ?? '')?.[1];
  }
}
