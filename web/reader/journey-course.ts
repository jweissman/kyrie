import type { Frame } from '../engine/protocol';
import type { RegionChart } from '../../src/ui/screen-types';

// The way a journey went over the land, hex by hex, as the engine made it: from where the company stood, by each place
// it came to on the way, along each known way's own course between them (its road, or its path), to the hex it came
// to, where it arrived or where it was stopped short. Walked on the map before what came of it is told (the owner,
// 5 November: travel shown as it really went, never a walk drawn over a jump).
export class JourneyCourse {
  static of(before: Frame, after: Frame): number[] | undefined {
    const a = before.screen.region?.land, region = after.screen.region, b = region?.land;
    if (!a || !region || !b || a.width !== b.width || a.cover !== b.cover || a.here === undefined
      || b.here === undefined || b.here === a.here) { return undefined; }
    const from = before.screen.region!.areas.find(x => x.here)?.id;
    const stops = [from, ...(after.travel?.legs ?? []).map(l => l.id && (region.within[l.id] ?? l.id))]
      .filter((x, i, all): x is string => !!x && x !== all[i - 1]);
    const way = [a.here];
    for (let i = 1; i < stops.length; i++) { way.push(...JourneyCourse.between(region, stops[i - 1]!, stops[i]!)); }
    const end = way.indexOf(b.here), cells = end >= 0 ? way.slice(0, end + 1) : [...way, b.here];
    return cells.filter((c, i) => c !== cells[i - 1]);
  }
  // From one place to the next: the course of the known way between them, as it runs from the first; else straight to
  // where the next stands.
  private static between(region: RegionChart, from: string, to: string): number[] {
    const e = region.edges.find(x => x.course?.length
      && (x.from === from && x.to === to || x.from === to && x.to === from));
    if (e) { return e.from === from ? e.course! : [...e.course!].reverse(); }
    const t = region.areas.find(x => x.id === to);
    return t ? [t.y * region.land!.width + t.x] : [];
  }
}
