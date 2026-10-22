import { Content } from '../content';
import { RandomStreams } from '../random-streams';
import { Borders, type Side } from './land/borders';
import { PlaceNames } from './place-names';
import type { Region } from './region-writer';

// Where each region of a generated world lies: the first at 0,0, the one beyond its eastern border at 1,0, and so on
// as far as anyone goes. Each is a module of its own (the first is "region"; the rest are named for where they lie,
// x1y0, xm1y2) drawn from a seed of its own, so the same seed always makes the same world in every direction.
export class WorldGrid {
  static id(x: number, y: number): string { return x === 0 && y === 0 ? 'region' : `x${this.n(x)}y${this.n(y)}`; }
  static at(id: string): [number, number] | undefined {
    if (id === 'region') { return [0, 0]; }
    const m = /^x(m?\d+)y(m?\d+)$/.exec(id);
    return m ? [this.v(m[1]!), this.v(m[2]!)] : undefined;
  }
  static seed(seed: string, x: number, y: number): string { return x === 0 && y === 0 ? seed : `${seed}@${x},${y}`; }
  static next([x, y]: [number, number], side: Side): [number, number] {
    const [dx, dy] = Borders.steps[side];
    return [x + dx, y + dy];
  }
  // A region as Deem draws it, before its land is laid: enough to know what it is called and what country it is.
  static drawn(seed: string, x: number, y: number, terrain?: string): Region {
    return new Content(RandomStreams.key(this.seed(seed, x, y), 'world', 'region'))
      .generate('region', terrain ? { terrain } : {}) as unknown as Region;
  }
  // What the folk of a region call the country beyond each of its borders, and what kind of country it is.
  static beyond(seed: string, at: [number, number]): Region['beyond'] {
    return Object.fromEntries(Borders.sides.map(side => {
      const [x, y] = this.next(at, side), drawn = this.drawn(seed, x, y);
      return [side, { name: PlaceNames.regionName(drawn), terrain: drawn.terrain }];
    }));
  }
  private static n(v: number): string { return v < 0 ? `m${-v}` : String(v); }
  private static v(s: string): number { return s.startsWith('m') ? -Number(s.slice(1)) : Number(s); }
}
