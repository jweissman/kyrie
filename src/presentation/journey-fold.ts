import type { Screen } from '../ui/screen-types';
import type { Route } from './glance-types';

type Destination = NonNullable<Screen['destinations']>[number];

// Which journeys the rest keeps in view, the others folded behind the journeys lens as the page's map keeps them
// (cold play 5, CL-33: at the gate-well, 27 journey rows, 14 "Set out for …" and 12 "To the …"). Kept: the way out,
// one road for each way that leaves from here (the nearest place it comes to), a place an aim names, a place gone to
// before, and the nearest three others. By place id; the way out by its own command.
export class JourneyFold {
  static readonly nearest = 3;
  static kept(screen: Screen, out?: Route): Set<string> {
    const every = this.every(screen), aimed = new Set((screen.aims ?? []).flatMap(a => a.places ?? []));
    const visited = new Set(screen.map.filter(m => m.visited && !m.here).map(m => m.id));
    const kept = new Set([...this.roads(screen.roads ?? []), ...every.filter(d => aimed.has(d.id) || visited.has(d.id))
      .map(d => d.id), ...out?.command ? [out.command] : [], ...out?.to ? [out.to] : []]);
    every.filter(d => !kept.has(d.id)).sort((a, b) => a.minutes - b.minutes).slice(0, this.nearest)
      .forEach(d => kept.add(d.id));
    return kept;
  }
  // Whether a journey's row (travel:<place>, or the way out's command) is one the rest keeps.
  static keeps(kept: Set<string>, id: string): boolean {
    return kept.has(id) || kept.has(id.startsWith('travel:') ? id.slice('travel:'.length) : id);
  }
  // Of journey rows (each by its id, its place its first target or its travel: id), those folded out of the rest.
  static folded(rows: { id: string; targets?: string[] }[], screen: Screen, out?: Route): Set<string> {
    const kept = this.kept(screen, out);
    return new Set(rows.filter(r => !this.keeps(kept, r.targets?.[0] ?? r.id)).map(r => r.id));
  }
  // Every place a journey can be set out for from here, once each.
  static every(screen: Screen): Destination[] {
    return [...new Map([...screen.destinations ?? [], ...screen.around ?? [], ...screen.roads ?? []]
      .map(d => [d.id, d])).values()];
  }
  // One road for each way that leaves from here: the roads share their way to the edge of the town (the legs every
  // one goes by), and part at the first leg after it; of those that part by the same leg, the nearest.
  private static roads(roads: Destination[]): string[] {
    if (!roads.length) { return []; }
    let shared = 0;
    while (roads.every(d => d.legs.length > shared + 1 && this.leg(d, shared) === this.leg(roads[0]!, shared))) {
      shared++;
    }
    const nearest = new Map<string, Destination>();
    for (const d of roads) {
      const by = this.leg(d, shared), had = nearest.get(by);
      if (!had || d.minutes < had.minutes) { nearest.set(by, d); }
    }
    return [...nearest.values()].map(d => d.id);
  }
  private static leg(d: Destination, i: number): string {
    return d.legs[i] ? `${d.legs[i]!.way}>${d.legs[i]!.to}` : '';
  }
}
