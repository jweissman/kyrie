import type { DeemValue } from 'deem';
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
  // No region is called what a neighbour is called: where its first draw would be, it is drawn again (the same way
  // on every load, as its neighbours' first draws never change).
  static drawn(seed: string, x: number, y: number, given: Record<string, DeemValue> = {}): Region {
    const near = Borders.sides.map(side => PlaceNames.regionName(this.first(seed, this.next([x, y], side))));
    for (let salt = 0; salt < 6; salt++) {
      const region = this.first(seed, [x, y], salt, given);
      if (!near.includes(PlaceNames.regionName(region))) { return region; }
    }
    return this.first(seed, [x, y], 0, given);
  }
  private static readonly draws = new Map<string, Region>();
  private static first(seed: string, [x, y]: [number, number], salt = 0,
    given: Record<string, DeemValue> = {}): Region {
    const key = `${this.seed(seed, x, y)}:${salt}:${JSON.stringify(given)}`;
    let region = this.draws.get(key);
    if (!region) {
      region = new Content(RandomStreams.key(this.seed(seed, x, y), 'world', 'region', ...salt ? [salt] : []))
        .generate('region', given) as unknown as Region;
      this.draws.set(key, region);
    }
    return structuredClone(region);
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
