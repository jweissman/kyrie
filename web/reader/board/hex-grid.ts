import { Vector2 } from 'three';

// The hexes of a country's land as the board lays them out: rows of hexes pointed at top and foot, every other row
// set half a hex east, a hex one unit across. Where each stands, which are about it, which a point of the land is in.
export class HexGrid {
  static readonly ROW = Math.sqrt(3) / 2;
  static readonly R = 0.5 / Math.cos(Math.PI / 6);
  private static readonly steps = [[[1, 0], [-1, 0], [0, -1], [-1, -1], [0, 1], [-1, 1]],
    [[1, 0], [-1, 0], [1, -1], [0, -1], [1, 1], [0, 1]]];
  private static readonly bearings = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north',
    'north-east'];
  readonly centres: Vector2[];
  constructor(readonly width: number, readonly height: number) {
    this.centres = [...Array(width * height).keys()].map(i => this.centre(i));
  }
  get cells(): number[] { return [...this.centres.keys()]; }
  get across(): number { return this.width + 0.5; }
  get down(): number { return this.height * HexGrid.ROW + 0.5; }
  centre(i: number): Vector2 {
    const row = Math.floor(i / this.width);
    return new Vector2((i % this.width) + (row % 2) * 0.5 + 0.5, row * HexGrid.ROW + 0.5);
  }
  neighbours(i: number): number[] {
    const x = i % this.width, y = Math.floor(i / this.width);
    return HexGrid.steps[y % 2]!.map(([dx, dy]) => [x + dx!, y + dy!])
      .filter(([a, b]) => a! >= 0 && a! < this.width && b! >= 0 && b! < this.height).map(([a,
        b]) => b! * this.width + a!);
  }
  // The hex a point of the land lies in: the nearest centre, as hexes are; none past the land's edge.
  cellAt(x: number, z: number): number | undefined {
    const r0 = Math.round((z - 0.5) / HexGrid.ROW);
    let best: number | undefined, nearest = 9;
    for (let r = r0 - 1; r <= r0 + 1; r++) {
      const c = Math.floor(x - (r % 2) * 0.5);
      if (r < 0 || r >= this.height || c < 0 || c >= this.width) { continue; }
      const i = r * this.width + c, d = Math.hypot(this.centres[i]!.x - x, this.centres[i]!.y - z);
      if (d < nearest) { nearest = d; best = i; }
    }
    return nearest < 0.62 ? best : undefined;
  }
  // A corner of a hex of the given radius, counted from its top.
  static corner(i: number, r: number): [number, number] {
    return [Math.sin(i * Math.PI / 3) * r, Math.cos(i * Math.PI / 3) * r];
  }
  // How far a point is from a hex's centre, as a share of the way to its edge.
  static outward(x: number, z: number, inradius: number): number {
    const ax = Math.abs(x), az = Math.abs(z);
    return Math.max(ax, ax * 0.5 + az * 0.8660254) / inradius;
  }
  bearing(from: number, to: number): string {
    const a = this.centres[from]!, b = this.centres[to]!;
    return HexGrid.bearings[(Math.round(Math.atan2(b.y - a.y, b.x - a.x) / (Math.PI / 4)) + 8) % 8]!;
  }
  // The cheapest way from one hex to another over those that may be crossed.
  route(from: number, to: number, cost: (a: number, b: number) => number, open: (c: number) => boolean): number[] {
    const dist = new Map([[from, 0]]), prev = new Map<number, number>(), frontier = [from];
    while (frontier.length) {
      frontier.sort((a, b) => dist.get(a)! - dist.get(b)!);
      const c = frontier.shift()!;
      if (c === to) { break; }
      for (const n of this.neighbours(c).filter(x => open(x) || x === to)) {
        const d = dist.get(c)! + cost(c, n);
        if (d < (dist.get(n) ?? Infinity)) { dist.set(n, d); prev.set(n, c); frontier.push(n); }
      }
    }
    if (!dist.has(to)) { return []; }
    const out = [to];
    while (out[0] !== from) { out.unshift(prev.get(out[0]!)!); }
    return out;
  }
}
