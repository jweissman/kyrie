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
    const stops = [from, ...(after.travel?.legs ?? []).map(l => l.id && JourneyCourse.stop(region, l.id))]
      .filter((x, i, all): x is string => !!x && x !== all[i - 1]);
    const way = [a.here];
    for (let i = 1; i < stops.length; i++) {
      way.push(...JourneyCourse.between(region, stops[i - 1]!, stops[i]!, way.at(-1)!));
    }
    const end = way.indexOf(b.here), cells = end >= 0 ? way.slice(0, end + 1) : [...way, b.here];
    return cells.filter((c, i) => c !== cells[i - 1]);
  }
  // The way a journey set out for now would go, hex by hex, by the itinerary's own stops: the map had drawn its own
  // shortest way over the hexes, and the journey went by the known ways, another way (the owner, 10 November).
  static planned(screen: Frame['screen'], id?: string): number[] | undefined {
    const plans = [...screen.destinations ?? [], ...screen.roads ?? [], ...screen.around ?? [], ...screen.mapped ?? []];
    const d = id === undefined ? undefined : plans.find(x => x.id === id);
    return JourneyCourse.along(screen, d?.stops);
  }
  // The same, by a journey's stops as the engine plans them (see the plan request).
  static along(screen: Frame['screen'], by?: string[]): number[] | undefined {
    const region = screen.region, here = region?.land?.here, from = region?.areas.find(x => x.here)?.id;
    if (!region || here === undefined || !from || !by?.length) { return undefined; }
    const stops = [from, ...by.map(s => JourneyCourse.stop(region, s))].filter((x, i, all) => x !== all[i - 1]);
    const way = [here];
    for (let i = 1; i < stops.length; i++) {
      way.push(...JourneyCourse.between(region, stops[i - 1]!, stops[i]!, way.at(-1)!));
    }
    // As far as the hex it comes to, as a walk is (see of): where the place gone to stands on the map, which for a site
    // in a wood is its own hex, not the wood's (the walk to the charcoal-burners' clearing had gone a hex past the way
    // laid to it: the owner, 11 November).
    const mark = region.land!.marks.find(m => m.id === by.at(-1))?.cell;
    const to = mark ?? JourneyCourse.cell(region, stops.at(-1)!);
    const end = to === undefined ? -1 : way.indexOf(to);
    const cells = end >= 0 ? way.slice(0, end + 1) : mark === undefined ? way : [...way, mark];
    return cells.filter((c, i) => c !== cells[i - 1]);
  }
  // Where a journey comes to, as the map stands it: the place, or what the map draws it within; a stretch of open
  // country is its own hex. The chart had a stretch within the wide country or wood it lies in, and the walk to the
  // next hex went by that country's middle, hexes away (the owner, 11 November: "the route preview and executed
  // travel still disagree"; next door, north of Thornhaven, went 221, 140, 90, 201).
  private static stop(region: RegionChart, id: string): string {
    return JourneyCourse.tract(region, id) === undefined ? region.within[id] ?? id : id;
  }
  private static tract(region: RegionChart, id: string): number | undefined {
    const prefix = region.land?.tracts, n = prefix && id.startsWith(prefix) ? Number(id.slice(prefix.length)) : NaN;
    return Number.isInteger(n) ? n : undefined;
  }
  private static cell(region: RegionChart, id: string): number | undefined {
    const t = JourneyCourse.tract(region, id), a = t === undefined ? region.areas.find(x => x.id === id) : undefined;
    return t ?? (a && a.y * region.land!.width + a.x);
  }
  // From one place to the next: the course of the known way between them, as it runs from the first; else straight to
  // where the next stands.
  private static between(region: RegionChart, from: string, to: string, last: number): number[] {
    const e = region.edges.find(x => x.course?.length
      && (x.from === from && x.to === to || x.from === to && x.to === from));
    if (e) {
      // From whichever end lies nearer where the journey has got to: a way's course is not always written from its
      // first place (the ford's road to Thornhaven's neighbour ran from the town's end, and the walk jumped a hex).
      const c = e.course!, w = region.land!.width;
      return JourneyCourse.far(c.at(-1)!, last, w) < JourneyCourse.far(c[0]!, last, w) ? [...c].reverse() : c;
    }
    const t = JourneyCourse.cell(region, to);
    return t === undefined ? [] : [t];
  }

  // How far apart two hexes lie on the land, near enough to tell which end of a way is nearer.
  private static far(a: number, b: number, width: number): number {
    return Math.hypot(a % width - b % width, Math.floor(a / width) - Math.floor(b / width));
  }
}
