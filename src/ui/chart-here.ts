import type { Entity, Module } from '../lang';
import type { LandModel } from './land-model';
import type { Chart, RegionChart } from './screen-types';

// Where the company stands, as its chart is drawn from it (see ChartModel.standing): the place, the plan it is on (a
// level of a site, or its area), whether below ground there, the place it is at on the land (aboard a vessel, where
// she is) and the area that is in, the country it is in, the country whose open country it may go across, and whether
// it is in the dark there (what bars a way is then told as heard or felt).
export interface Standing { here: string; home?: Entity; below: boolean; place: string; area?: string;
  region?: string; across?: string; dark: boolean }
type Drawn = { chart?: Chart; region?: RegionChart };
type Said = { chart?: [Chart, string]; region?: [RegionChart, string] };

// Where the company stands, marked on a chart drawn without it (OR-1601): the place on the plan, the area on the
// country's chart, and on its land the company's cell, each mark it stands within and the places across the country
// from there. A step within a town had drawn the whole chart again, from every way the company knows, for the one
// place now marked as here. The same plan marked at the same place is the same chart; and a chart drawn again just as
// it was (an act wrote something the chart read, which changed nothing drawn) is given as the one it was, so that
// what is kept by it (the itineraries, by the region drawn) is kept still.
export class ChartHere {
  private static readonly placed = new WeakMap<object, Map<string, Drawn>>();
  private static readonly last = new WeakMap<Module, Map<string, Said>>();
  static marked(plan: Drawn, stands: Standing, land?: LandModel): Drawn {
    const key = `${stands.here}\u0000${stands.place}`, kept = this.placed.get(plan) ?? new Map<string, Drawn>();
    this.placed.set(plan, kept);
    let out = kept.get(key);
    if (!out) {
      out = this.mark(plan, stands, land);
      kept.set(key, out);
      if (kept.size > ChartHere.places) { kept.delete(kept.keys().next().value!); }
    }
    return out;
  }
  // How many places one plan is kept marked at: the places of a town walked about.
  private static readonly places = 8;
  private static mark(plan: Drawn, stands: Standing, land?: LandModel): Drawn {
    const chart = plan.chart && { ...plan.chart,
      places: plan.chart.places.map(p => p.id === stands.here ? { ...p, here: true } : p) };
    const region = plan.region && { ...plan.region,
      areas: plan.region.areas.map(a => a.id === stands.area ? { ...a, here: true } : a),
      ...plan.region.land && land ? { land: land.placed(plan.region.land, stands.place) } : {} };
    return { ...chart ? { chart } : {}, ...region ? { region } : {} };
  }
  // The chart and the region as last drawn for this actor, where what is drawn now is just what they were.
  static same(module: Module, actor: string, drawn: Drawn): Drawn {
    const kept = this.last.get(module) ?? new Map<string, Said>();
    this.last.set(module, kept);
    const was = kept.get(actor) ?? {}, chart = this.kept(drawn.chart, was.chart);
    const region = this.kept(drawn.region, was.region);
    kept.set(actor, { ...chart ? { chart } : {}, ...region ? { region } : {} });
    return { ...chart ? { chart: chart[0] } : {}, ...region ? { region: region[0] } : {} };
  }
  private static kept<T>(now: T | undefined, was: [T, string] | undefined): [T, string] | undefined {
    if (now === undefined) { return undefined; }
    if (was?.[0] === now) { return was; }
    const said = JSON.stringify(now);
    return was?.[1] === said ? was : [now, said];
  }
}
