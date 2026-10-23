import type { Screen } from './screen-types';

export type Side = 'n' | 'e' | 's' | 'w';

// Which way each way out of a place leads, as someone standing there would point: from the rooms of the place as
// they lie (a door to the east is on the east wall); else from the country's areas as they lie (the road to the next
// town leaves by the side the town is on); else from where things lie on the land. A way the company cannot place
// goes on the side with fewest, so that every side is used before one is crowded.
export class Bearings {
  static of(screen: Screen): Map<string, Side> {
    const out = new Map<string, Side>(), unplaced: string[] = [];
    for (const exit of screen.exits) {
      const side = this.local(screen, exit.destination.id) ?? this.region(screen, exit.destination.id)
        ?? this.land(screen, exit.destination.id);
      if (side) { out.set(exit.id, side); } else { unplaced.push(exit.id); }
    }
    for (const id of unplaced) {
      out.set(id, (['e', 'w', 's', 'n'] as Side[]).reduce((a, b) => this.count(out, b) < this.count(out, a) ? b : a));
    }
    return out;
  }
  private static count(sides: Map<string, Side>, side: Side): number {
    return [...sides.values()].filter(x => x === side).length;
  }
  static side(dx: number, dy: number): Side | undefined {
    if (!dx && !dy) { return undefined; }
    return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'e' : 'w') : (dy > 0 ? 's' : 'n');
  }
  private static local(screen: Screen, to: string): Side | undefined {
    const places = screen.chart?.places ?? [], here = places.find(p => p.here), there = places.find(p => p.id === to);
    return here && there ? this.side(there.x - here.x, there.y - here.y) : undefined;
  }
  private static region(screen: Screen, to: string): Side | undefined {
    const r = screen.region;
    if (!r) { return undefined; }
    const here = r.areas.find(a => a.here) ?? r.areas.find(a => a.id === r.within[screen.place.id]);
    const there = r.areas.find(a => a.id === (r.within[to] ?? to));
    return here && there && here !== there ? this.side(there.x - here.x, there.y - here.y) : undefined;
  }
  private static land(screen: Screen, to: string): Side | undefined {
    const land = screen.region?.land;
    const cell = land?.marks.find(m => m.id === to)?.cell;
    if (!land || land.here === undefined || cell === undefined) { return undefined; }
    const W = land.width;
    return this.side(cell % W - land.here % W, Math.floor(cell / W) - Math.floor(land.here / W));
  }
}
