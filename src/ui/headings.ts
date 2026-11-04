import { AuthoredLand } from '../world/authored-land';
import { Vantage } from '../world/vantage';
import { LandModel } from './land-model';
import type { Entity, Module } from '../lang/module';
import type { ExitRow, PlaceRef } from './screen-types';

// Which way a step across the open country goes (see RegionTracts): north-east into the next stretch, as the land is
// set out in hexes, every other row half a hex to the east. Six stretches about one were all "among the trees of
// Beorquudu" until each said which way it lay.
export class Headings {
  static of(module: Module, path: PlaceRef[], here: string | undefined, exits: ExitRow[]): ExitRow[] {
    const region = path.findLast(p => p.kind === 'region')?.id, chart = region ? AuthoredLand.of(module, region) : undefined;
    const from = here !== undefined ? chart?.places[here] : undefined;
    if (!chart || from === undefined || !exits.some(e => LandModel.tract.test(e.destination.id))) { return exits; }
    return exits.map(e => {
      const to = LandModel.tract.test(e.destination.id) ? chart.places[e.destination.id] : undefined;
      if (to === undefined || to === from) { return e; }
      const [a, b] = [this.at(from, chart.width), this.at(to, chart.width)];
      return { ...e, bearing: Vantage.bearing(b[0] - a[0], b[1] - a[1]) };
    });
  }
  // The step across the open country that goes nearest toward a place, when the company knows no way to it: from the
  // edge of what it knows, into the wild country the place is said to lie in (REV-08: a company whose aim lay beyond
  // the known roads was led back and forth between edges, and never on into the wild). None where no step brings it
  // nearer, or where the place is not on this country's land.
  static toward(module: Module, at: { path: PlaceRef[]; here: string; exits: ExitRow[] },
    place: { id: string; entities: Map<string, Entity> }): string | undefined {
    const region = at.path.findLast(p => p.kind === 'region')?.id, chart = region ? AuthoredLand.of(module, region) : undefined;
    const from = chart?.places[at.here], cell = chart && new LandModel(chart, place.entities).cell(place.id);
    // A road the aim names is anywhere along it (the bridge the father went out by, on the road to Brightbridge).
    const to = chart?.roads[place.id] ?? (cell !== undefined ? [cell] : []);
    if (!chart || from === undefined || !to.length || to.includes(from)) { return undefined; }
    const here = this.far(from, to, chart.width);
    return at.exits.filter(e => e.bearing && !e.blocked && chart.places[e.destination.id] !== undefined)
      .map(e => ({ e, d: this.far(chart.places[e.destination.id]!, to, chart.width) })).filter(x => x.d < here)
      .sort((a, b) => a.d - b.d)[0]?.e.id;
  }
  // How far a cell is from the nearest of some, hex middle to hex middle.
  private static far(a: number, cells: number[], W: number): number {
    const p = this.at(a, W);
    return Math.min(...cells.map(b => this.at(b, W)).map(q => Math.hypot(p[0] - q[0], p[1] - q[1])));
  }
  // A cell's middle, a hex's width to a column, every other row shifted half.
  private static at(cell: number, W: number): [number, number] {
    const row = Math.floor(cell / W);
    return [cell % W + (row % 2) * 0.5, row * 0.866];
  }
}
