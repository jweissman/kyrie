// Smooth shapes from a grid of land, as a cartographer would draw them over the cells rather than as the cells: the
// shore of every water, the edge of every wood and fell, the bounds of what the company knows. A kind of cover is a
// field over the land, near one inside it and near zero outside, roughened the same way every time so that an edge
// wanders as real edges do; its outline is where the field crosses a level, traced and rounded off.
export interface Pt { x: number; y: number }
export interface Field { nx: number; ny: number; k: number; pad: number; v: Float32Array }
export interface Ground { width: number; height: number; cover: string }
interface Tracing { f: Field; level: number; links: Map<number, number[]> }

export class Cartography {
  // The width of a cell on the map, in the map's own units.
  static readonly cell = 88;
  // For each kind of square crossed by an outline, which of its sides (top, right, bottom, left) the outline joins.
  static readonly crossings: number[][][] = [[], [[3, 2]], [[2, 1]], [[3, 1]], [[0, 1]], [], [[0, 2]], [[3, 0]],
    [[3, 0]], [[0, 2]], [], [[0, 1]], [[3, 1]], [[2, 1]], [[3, 2]], []];
  // A field for the cells whose cover is one of the given marks, k points to a cell. The land's edge cells go on a
  // cell further, as the sea goes on past the edge of a map, and a ring of nothing beyond closes every outline out of
  // sight.
  static field(ground: Ground, test: (c: number) => boolean, k: number, rough: number): Field {
    const pad = 1, nx = (ground.width + 2 * pad) * k + 3, ny = (ground.height + 2 * pad) * k + 3;
    const v = new Float32Array(nx * ny);
    for (let j = 1; j < ny - 1; j++) {
      for (let i = 1; i < nx - 1; i++) {
        // Roughened only where it is neither wholly in nor wholly out, so that the open sea and the deep wood stay
        // whole, and every outline of one cover (a shore and the lines drawn inside it) wanders alike.
        const u = (i - 1) / k - pad, w = (j - 1) / k - pad, s = this.share(ground, test, u, w);
        v[j * nx + i] = s + rough * 4 * s * (1 - s) * (this.noise(u, w) - 0.5);
      }
    }
    return { nx, ny, k, pad, v };
  }
  // How much of a point of the land (in cells) is the cover: from the centres of the four cells around it.
  private static share(ground: Ground, test: (c: number) => boolean, u: number, w: number): number {
    const x = u - 0.5, y = w - 0.5, x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    const at = [[x0, y0], [x0 + 1, y0], [x0, y0 + 1], [x0 + 1, y0 + 1]].map(([cx, cy]) => {
      const row = Math.min(ground.height - 1, Math.max(0, cy!)), column = Math.min(ground.width - 1, Math.max(0, cx!));
      return test(row * ground.width + column) ? 1 : 0;
    });
    return (at[0]! * (1 - fx) + at[1]! * fx) * (1 - fy) + (at[2]! * (1 - fx) + at[3]! * fx) * fy;
  }
  // The field's value at a point of the land, in cells.
  static value(f: Field, u: number, w: number): number {
    const x = (u + f.pad) * f.k + 1, y = (w + f.pad) * f.k + 1, i = Math.floor(x), j = Math.floor(y);
    if (i < 0 || j < 0 || i >= f.nx - 1 || j >= f.ny - 1) { return 0; }
    const fx = x - i, fy = y - j, v = f.v, n = f.nx;
    return (v[j * n + i]! * (1 - fx) + v[j * n + i + 1]! * fx) * (1 - fy)
      + (v[(j + 1) * n + i]! * (1 - fx) + v[(j + 1) * n + i + 1]! * fx) * fy;
  }
  // A number in [0, 1) for a pair of integers, the same every time.
  static hash(x: number, y: number): number {
    let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  // Smooth noise over the land: two scales of it, the broader stronger.
  static noise(u: number, w: number): number {
    return this.smooth(u * 2.1, w * 2.1) * 0.65 + this.smooth(u * 5.3 + 17, w * 5.3 + 31) * 0.35;
  }
  private static smooth(x: number, y: number): number {
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = this.ease(x - x0), fy = this.ease(y - y0);
    const a = this.hash(x0, y0), b = this.hash(x0 + 1, y0), c = this.hash(x0, y0 + 1), d = this.hash(x0 + 1, y0 + 1);
    return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
  }
  private static ease(t: number): number { return t * t * (3 - 2 * t); }
  // The outlines where the field crosses a level, as closed rings of points in map units; specks are dropped.
  static outlines(f: Field, level: number): Pt[][] {
    const t: Tracing = { f, level, links: new Map() };
    for (let j = 0; j < f.ny - 1; j++) { for (let i = 0; i < f.nx - 1; i++) { this.square(t, i, j); } }
    return this.rings(t).filter(r => Math.abs(this.area(r)) > (this.cell * 0.18) ** 2);
  }
  private static square(t: Tracing, i: number, j: number) {
    const { f, level } = t, n = f.nx, v = f.v;
    const a = v[j * n + i]!, b = v[j * n + i + 1]!, c = v[(j + 1) * n + i + 1]!, d = v[(j + 1) * n + i]!;
    const kind = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
    if (kind === 0 || kind === 15) { return; }
    const sides = [(j * n + i) * 2, (j * n + i + 1) * 2 + 1, ((j + 1) * n + i) * 2, (j * n + i) * 2 + 1];
    // Where two opposite corners are in, the middle of the square says whether they join.
    const middle = (a + b + c + d) / 4 > level;
    const pairs = kind === 5 ? (middle ? [[3, 0], [2, 1]] : [[0, 1], [3, 2]])
      : kind === 10 ? (middle ? [[0, 1], [3, 2]] : [[3, 0], [2, 1]]) : this.crossings[kind]!;
    for (const [p, q] of pairs) { this.link(t, sides[p!]!, sides[q!]!); }
  }
  private static link(t: Tracing, p: number, q: number) {
    t.links.set(p, [...t.links.get(p) ?? [], q]);
    t.links.set(q, [...t.links.get(q) ?? [], p]);
  }
  // The point where an outline crosses a side of a square, in map units.
  private static point(t: Tracing, side: number): Pt {
    const { f, level } = t, e = side >> 1, i = e % f.nx, j = Math.floor(e / f.nx), down = (side & 1) === 1;
    const v0 = f.v[j * f.nx + i]!, v1 = f.v[(down ? j + 1 : j) * f.nx + (down ? i : i + 1)]!;
    const s = v1 === v0 ? 0.5 : (level - v0) / (v1 - v0), scale = this.cell / f.k;
    return { x: ((down ? i : i + s) - 1 - f.pad * f.k) * scale, y: ((down ? j + s : j) - 1 - f.pad * f.k) * scale };
  }
  private static rings(t: Tracing): Pt[][] {
    const seen = new Set<number>(), rings: Pt[][] = [];
    for (const start of t.links.keys()) {
      if (seen.has(start)) { continue; }
      const ring: Pt[] = [];
      let previous = -1, at: number | undefined = start;
      while (at !== undefined && !seen.has(at)) {
        seen.add(at);
        ring.push(this.point(t, at));
        const next: number[] = t.links.get(at) ?? [];
        const onward: number | undefined = next[0] !== previous ? next[0] : next[1];
        previous = at;
        at = onward;
      }
      rings.push(ring);
    }
    return rings;
  }
  static area(ring: Pt[]): number {
    return ring.reduce((sum, p, i) => {
      const q = ring[(i + 1) % ring.length]!;
      return sum + p.x * q.y - q.x * p.y;
    }, 0) / 2;
  }
  // A ring with its corners cut, twice over: the outline a pen would draw.
  static round(ring: Pt[], times = 2): Pt[] {
    let points = ring;
    for (let n = 0; n < times; n++) {
      points = points.flatMap((p, i) => {
        const q = points[(i + 1) % points.length]!;
        return [{ x: p.x * 0.75 + q.x * 0.25, y: p.y * 0.75 + q.y * 0.25 },
          { x: p.x * 0.25 + q.x * 0.75, y: p.y * 0.25 + q.y * 0.75 }];
      });
    }
    return points;
  }
  // Closed rings as one path, to be filled even-odd so that an island in a lake stays land.
  static path(rings: Pt[][]): string {
    return rings.map(r => `M${r.map(p => this.at(p)).join('L')}Z`).join('');
  }
  // An open line through points, as a smooth curve.
  static line(points: Pt[]): string {
    if (points.length < 2) { return ''; }
    return `M${this.at(points[0]!)}${points.slice(1).map((p2, n) => {
      const p1 = points[n]!, p0 = points[n - 1] ?? p1, p3 = points[n + 2] ?? p2;
      const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
      const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
      return `C${this.at(c1)} ${this.at(c2)} ${this.at(p2)}`;
    }).join('')}`;
  }
  private static at(p: Pt): string { return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }
  // The centre of a cell in map units, set off a little by a wander (as a fraction of a cell) for a line through it.
  static centre(width: number, c: number, wander = 0): Pt {
    const dx = wander ? (this.hash(c, 7) - 0.5) * wander : 0, dy = wander ? (this.hash(c, 11) - 0.5) * wander : 0;
    return { x: (c % width + 0.5 + dx) * this.cell, y: (Math.floor(c / width) + 0.5 + dy) * this.cell };
  }
  // A course through cells, wandering between its ends but meeting them exactly.
  static course(width: number, cells: number[], wander: number): Pt[] {
    return cells.map((c, i) => this.centre(width, c, i === 0 || i === cells.length - 1 ? 0 : wander));
  }
}
