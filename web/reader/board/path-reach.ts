import type { Vector3 } from 'three';

// The points along a country's rivers, or along its roads, kept by the small square of the land each lies in, so that
// whether a point of the land is near one asks only the squares about it, not every point of every river or road.
export class PathReach {
  // A square's side: no nearer than anything asks after (a bank, a verge, a bush kept off a road).
  private static readonly SIDE = 0.15;
  private static readonly none: Vector3[] = [];
  private readonly squares = new Map<number, Vector3[]>();
  constructor(points: Vector3[]) {
    for (const p of points) {
      const k = PathReach.key(Math.floor(p.x / PathReach.SIDE), Math.floor(p.z / PathReach.SIDE)),
        square = this.squares.get(k);
      if (square) { square.push(p); } else { this.squares.set(k, [p]); }
    }
  }
  // Whether any of the points lies within so far of a point of the land (asked no further than a square's side).
  near(x: number, z: number, limit: number): boolean {
    const i = Math.floor(x / PathReach.SIDE), j = Math.floor(z / PathReach.SIDE), most = limit * limit;
    for (let a = i - 1; a <= i + 1; a++) {
      for (let b = j - 1; b <= j + 1; b++) {
        for (const p of this.squares.get(PathReach.key(a, b)) ?? PathReach.none) {
          if ((p.x - x) ** 2 + (p.z - z) ** 2 < most) { return true; }
        }
      }
    }
    return false;
  }
  private static key(i: number, j: number): number { return (i + 64) * 8192 + j + 64; }
}
