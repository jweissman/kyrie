import type { RegionChart } from '../../src/ui/screen-types';

type Land = NonNullable<RegionChart['land']>;
type Rgb = [number, number, number];

// The land of the map as a painting rather than a board (Mission 18, the owner's review: hexes wrapped round a
// network of roads were not a country). Each cell's cover is looked up through a gentle warp, so the edges between
// wood and heath, fen and meadow, water and shore wander as land does; the ground is lit from the north-west by
// heights the covers stand for (a peak above a fell above heath, water lowest), so hills stand up and valleys sink;
// a shore is drawn pale where water meets land; and what the company does not know fades into the dark a cell or two
// beyond what it does, never quite to nothing, so the country has an edge and a further side. Drawn at a few samples
// to a cell, and smoothed when it is set on the map.
export class PaintedLand {
  // Samples to a cell: more for a small land, which is looked at nearer.
  static readonly fine = 6;
  static grain(land: Land): number {
    const cells = land.width * land.height;
    return cells <= 1000 ? 12 : cells <= 2500 ? 8 : this.fine;
  }
  static readonly palettes: Record<string, Record<string, Rgb>> = {
    any: { '~': [18, 42, 66], o: [20, 50, 76], ',': [34, 54, 50], '.': [46, 56, 36], w: [26, 52, 34], h: [64, 52, 44],
      f: [70, 67, 58], p: [104, 104, 110] },
    frost: { '~': [36, 56, 76], o: [58, 80, 98], ',': [44, 54, 58], '.': [62, 68, 76], w: [32, 50, 48], h: [58, 62, 70],
      f: [74, 78, 86], p: [118, 122, 130] },
  };
  static readonly heights: Record<string, number> = { '~': 0, o: 0.05, ',': 0.15, '.': 0.3, w: 0.38, h: 0.55, f: 0.75,
    p: 1 };
  static readonly wet = new Set(['~', 'o']);
  static paint(land: Land, terrain?: string): { width: number; height: number; data: Uint8ClampedArray } {
    const F = this.grain(land), W = land.width, H = land.height, width = W * F, height = H * F;
    const palette = this.palettes[terrain ?? ''] ?? this.palettes.any!, fog = this.distance(land);
    const data = new Uint8ClampedArray(width * height * 4);
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const u = (px + 0.5) / F, v = (py + 0.5) / F, k = land.cover[this.at(u, v, W, H)] ?? '.';
        const base = palette[k] ?? palette['.']!, shade = this.shade(land, u, v, k);
        const a = this.seen(this.sample(fog, [u, v], W, H));
        const o = (py * width + px) * 4;
        data[o] = base[0] * shade; data[o + 1] = base[1] * shade; data[o + 2] = base[2] * shade; data[o + 3] = 255 * a;
      }
    }
    return { width, height, data };
  }
  // How light the ground is at a point: lit by the slope toward the north-west, mottled a little; a shore pale.
  private static shade(land: Land, u: number, v: number, k: string): number {
    const W = land.width, H = land.height, e = 0.3, n = this.fbm(u * 3, v * 3);
    if (this.wet.has(k)) {
      const shore = [[e, 0], [-e, 0], [0, e], [0, -e]]
        .some(([a, b]) => !this.wet.has(land.cover[this.at(u + a!, v + b!, W, H)] ?? '.'));
      return (0.88 + n * 0.24) * (shore ? 1.7 : 1);
    }
    const gx = this.height(land, u + e, v) - this.height(land, u - e, v);
    const gy = this.height(land, u, v + e) - this.height(land, u, v - e);
    return (0.86 + n * 0.28) * (1 + Math.max(-0.45, Math.min(0.45, (-gx - gy) * 1.5)));
  }
  private static height(land: Land, u: number, v: number): number {
    let t = 0;
    for (const [a, b] of [[0, 0], [0.6, 0], [-0.6, 0], [0, 0.6], [0, -0.6]]) {
      t += this.heights[land.cover[this.at(u + a!, v + b!, land.width, land.height)] ?? '.'] ?? 0.3;
    }
    return t / 5 + (this.fbm(u * 2.3, v * 2.3) - 0.5) * 0.18;
  }
  // How much of a point is seen, by how far it is from a cell the company knows: all of it within a cell, fading to
  // a trace two cells further on.
  private static seen(d: number): number { return d < 0.7 ? 1 : d > 2.6 ? 0.07 : Math.max(0.07, 1 - (d - 0.7) / 1.9); }
  // The cell a point is drawn as: the one under it after a gentle warp.
  static at(u: number, v: number, W: number, H: number): number {
    const wu = u + (this.fbm(u * 0.9 + 11, v * 0.9) - 0.5) * 1.1, wv = v + (this.fbm(u * 0.9, v * 0.9 + 7) - 0.5) * 1.1;
    const x = Math.min(W - 1, Math.max(0, Math.floor(wu))), y = Math.min(H - 1, Math.max(0, Math.floor(wv)));
    return y * W + x;
  }
  // Each cell's distance from the nearest known cell, in cells (by passes of a chamfer), sampled between cells.
  static distance(land: Land): Float32Array {
    const W = land.width, H = land.height, d = new Float32Array(W * H).fill(99);
    for (const c of land.known) { d[c] = 0; }
    const back: [number, number][] = [[-1, 0], [0, -1], [-1, -1], [1, -1]];
    const on: [number, number][] = [[1, 0], [0, 1], [1, 1], [-1, 1]];
    for (let y = 0; y < H; y++) { for (let x = 0; x < W; x++) { this.pass(d, [x, y], back, [W, H]); } }
    for (let y = H - 1; y >= 0; y--) { for (let x = W - 1; x >= 0; x--) { this.pass(d, [x, y], on, [W, H]); } }
    return d;
  }
  private static pass(d: Float32Array, [x, y]: [number, number], steps: [number, number][], [W, H]: [number, number]) {
    for (const [dx, dy] of steps) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < W && ny < H) {
        d[y * W + x] = Math.min(d[y * W + x]!, d[ny * W + nx]! + (dx && dy ? Math.SQRT2 : 1));
      }
    }
  }
  private static sample(d: Float32Array, [u, v]: [number, number], W: number, H: number): number {
    const x = Math.min(W - 1.001, Math.max(0, u - 0.5)), y = Math.min(H - 1.001, Math.max(0, v - 0.5));
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, i = y0 * W + x0;
    const x1 = Math.min(W - 1, x0 + 1) - x0, y1 = (Math.min(H - 1, y0 + 1) - y0) * W;
    return d[i]! * (1 - fx) * (1 - fy) + d[i + x1]! * fx * (1 - fy) + d[i + y1]! * (1 - fx) * fy
      + d[i + x1 + y1]! * fx * fy;
  }
  static hash(x: number, y: number): number {
    let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
  private static noise(x: number, y: number): number {
    const xi = Math.floor(x), yi = Math.floor(y), u = this.ease(x - xi), v = this.ease(y - yi);
    const a = this.hash(xi, yi), b = this.hash(xi + 1, yi), c = this.hash(xi, yi + 1), d = this.hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  private static ease(t: number): number { return t * t * (3 - 2 * t); }
  static fbm(x: number, y: number): number {
    return this.noise(x, y) * 0.6 + this.noise(x * 2.1, y * 2.1) * 0.3 + this.noise(x * 4.3, y * 4.3) * 0.1;
  }
}
