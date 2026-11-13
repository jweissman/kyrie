import type { RegionChart, Screen } from './screen-types';

type Land = NonNullable<RegionChart['land']>;

// How the map may set out for a place it shows that no way is planned to (see Itineraries.mapped): across the open
// country to the stretch it stands on, where that stretch is known and can be walked. Never one in the company's own
// hex: that is reached by the ways about where it stands, and across the country about it had walked the company out
// of the town to a circus ground behind the houses (the owner's player report, 12 November; E155). The engine's
// decision, so that the page, the terminal and `serve` draw the same (M21's playability list, PL-18): it had been
// made in the page's map alone (web/reader/map-view.tsx).
export class LandCrossing {
  // The sea and the lakes have no stretch of country (see RegionTracts.cells).
  static readonly water = new Set(['~', 'o']);
  static of(land: Omit<Land, 'across'>): Record<string, string> {
    if (!land.tracts) { return {}; }
    const known = new Set(land.known);
    return Object.fromEntries(land.marks.flatMap(m => {
      const go = land.goes?.[m.cell];
      return m.cell !== land.here && known.has(m.cell) && LandCrossing.walkable(land, m.cell) && go
        ? [[m.id, `travel:${go}`]] : [];
    }));
  }
  // The same, as every client offers it: the place shown, and the command that sets out for it.
  static offers(screen: Pick<Screen, 'region'>): { id: string; name: string; command: string }[] {
    const land = screen.region?.land;
    return (land?.marks ?? []).flatMap(m => {
      const command = land?.across?.[m.id];
      return command ? [{ id: m.id, name: m.name, command }] : [];
    });
  }
  static walkable(land: Pick<Land, 'cover'>, cell: number): boolean {
    return !LandCrossing.water.has(land.cover[cell] ?? '.');
  }
}
