import { AuthoredLand } from '../world/authored-land';
import { Vantage } from '../world/vantage';
import { LandModel } from './land-model';
import type { Module } from '../lang/module';
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
  // A cell's middle, a hex's width to a column, every other row shifted half.
  private static at(cell: number, W: number): [number, number] {
    const row = Math.floor(cell / W);
    return [cell % W + (row % 2) * 0.5, row * 0.866];
  }
}
