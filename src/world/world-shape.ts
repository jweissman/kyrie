import shape from '../../data/imbar/shape.json';
import type { DeemValue } from 'deem';
import { Borders, type Side } from './land/borders';

// A great region of the world (data/imbar/shape.json): what it is called, whether it is land or sea, the kind of
// country it is, and the cells of the grid it holds, as the steps each lies from the first country, least and most,
// on whichever sides it says (null: no bound). A sea's coast: the side of the land near it that falls to it, and how
// many countries off it that land may lie.
export interface Great {
  id: string; name: string; kind: 'land' | 'sea'; terrain?: string;
  where: Partial<Record<Side, [number | null, number | null]>>;
  coast?: { side: Side; within: number };
}
// The shape of Imbar: certain cells of every generated world's grid of countries (see WorldGrid) are what they are
// whatever the seed, by rule over the grid rather than by any coordinate an author must know: the Eastern Ocean
// beyond the first country's eastern march, the Great Desert south beyond its southern neighbour, the Southern Sea
// beyond the desert and the Southern Continent beyond that. Read before any country is drawn, so the countries of a
// great region are drawn with its terrain given, named as part of it, and the land beside a sea falls to it where
// the sea says. The first country's land is never redrawn by it: a world's start is its seed's (the recorded descents
// and traces play on it), and the ocean comes into it only by Tolleth's firth (see Firth).
export class WorldShape {
  static readonly regions = shape.regions as Great[];
  // The great region that holds a cell, if one does: the first listed that does.
  static at(x: number, y: number): Great | undefined {
    return this.regions.find(g => this.holds(g, [x, y]));
  }
  // Whether a cell is sea, and so not a country anyone walks into: no road goes over the march toward it.
  static sea(x: number, y: number): boolean { return this.at(x, y)?.kind === 'sea'; }
  // What a cell's country is drawn with: its land's terrain, where a great region of land gives one.
  static given(x: number, y: number): Record<string, DeemValue> {
    const great = this.at(x, y);
    return great?.kind === 'land' && great.terrain ? { terrain: great.terrain } : {};
  }
  // The side of a land country that falls to the sea: the side toward the nearest sea that has the land within its
  // reach (the desert's southern row, beside the Southern Sea); of seas as near, the first listed. One side only, as
  // a country's land has one coast; none for the first country, whose land is its seed's.
  static coast(x: number, y: number): Side | undefined {
    if (this.sea(x, y) || (x === 0 && y === 0)) { return undefined; }
    let best: { side: Side; steps: number } | undefined;
    for (const g of this.regions) {
      if (g.kind !== 'sea' || !g.coast) { continue; }
      for (let steps = 1; steps <= g.coast.within && (!best || steps < best.steps); steps++) {
        const [dx, dy] = Borders.steps[g.coast.side];
        if (this.at(x + dx * steps, y + dy * steps) === g) { best = { side: g.coast.side, steps }; }
      }
    }
    return best?.side;
  }
  // What a country of a great region is called: its own name of the region ("Sandholm of the Great Desert"); a
  // sea's cell, the sea's.
  static named(great: Great | undefined, own: string): string {
    if (!great) { return own; }
    if (great.kind === 'sea') { return great.name; }
    const of = ` of ${great.name}`;
    return own.endsWith(of) ? own : `${own}${of}`;
  }
  private static holds(g: Great, at: [number, number]): boolean {
    return Object.entries(g.where).every(([side, [least, most]]) => {
      const steps = this.steps(at, side as Side);
      return (least === null || steps >= least) && (most === null || steps <= most);
    });
  }
  // How many countries a cell lies from the first toward a side (negative: the other way).
  private static steps([x, y]: [number, number], side: Side): number {
    const [dx, dy] = Borders.steps[side];
    return x * dx + y * dy;
  }
}
