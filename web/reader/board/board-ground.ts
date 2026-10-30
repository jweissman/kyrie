import { MathUtils } from 'three';
import { HexGrid } from './hex-grid';
import { Noise } from './noise';
import type { BoardLand } from './board-types';
import type { PathReach } from './path-reach';

// The ground of the board: each hex a low terrace, as high as its land goes (fen lowest, then fields, woods, heath,
// fells, the heights), eased toward its neighbours and lower where a river runs, in no more than five gentle steps;
// its top swelling within itself and level at its rim, so that it meets its sides: the fells in rounded swells, the
// heath and the heights' feet in lesser ones, the fields hardly at all, and a hex a town or a place stands on only
// in its grain. A wood is a canopy close over its hex, broken into crowns, open along a river or a road through it. A
// river runs in a bed cut into the land, the ground falling to it on either side.
export class BoardGround {
  static readonly GAP = 0.975;
  private static readonly rise: Record<string, number> = { ',': 0.15, '.': 0.25, w: 0.32, h: 0.45, f: 0.62, p: 0.9 };
  private static readonly grains: Record<string,
    number> = { p: 0.035, f: 0.02, h: 0.02, w: 0.015, '.': 0.012, ',': 0.006 };
  private static readonly swells: Record<string, number> = { f: 0.12, p: 0.06, h: 0.05, '.': 0.014 };
  // The minutes a step across country takes, by its land, and the hours of a road's own step, as the game has them.
  private static readonly going: Record<string, number> = { '.': 30, h: 40, w: 60, ',': 70, f: 70, p: 120 };
  private static readonly road: Record<string, number> = { '.': 1, h: 1.1, w: 1.2, ',': 1.4, f: 1.6, p: 2.5 };
  // How deep a river's bed is cut at its middle, and how far from its middle the ground begins to fall to it and
  // has come down into it.
  static readonly BED = 0.036;
  // How high a wood's canopy stands over its ground, at its thickest.
  static readonly CANOPY = 0.12;
  private static readonly banks = [0.025, 0.085] as const;
  readonly levels: number[];
  // The hexes a river runs through, and each step along a known road, either way.
  private readonly river: Set<number>;
  private readonly roads = new Set<string>();
  // The hexes something stands on, kept level.
  private readonly settled: Set<number>;
  constructor(readonly grid: HexGrid, readonly land: BoardLand,
    private readonly ways?: { rivers: PathReach; roads: PathReach }) {
    const wet = this.river = new Set(land.rivers.flat()),
      raw = grid.cells.map(c => this.wet(c) ? 0 : BoardGround.rise[land.cover[c]!] ?? 0.3);
    this.settled = new Set(land.marks.map(m => m.cell));
    for (const r of Object.values(land.roads)) {
      for (let i = 1; i < r.length; i++) { this.roads.add(`${r[i - 1]!}:${r[i]!}`).add(`${r[i]!}:${r[i - 1]!}`); }
    }
    const eased = grid.cells.map(c => {
      if (this.wet(c)) { return 0; }
      const about = grid.neighbours(c).filter(n => !this.wet(n)).map(n => raw[n]!);
      const mean = about.length ? about.reduce((a, b) => a + b, 0) / about.length : raw[c]!;
      return raw[c]! * 0.55 + mean * 0.45 - (wet.has(c) ? 0.08 : 0);
    });
    this.levels = grid.cells.map(c => this.wet(c) ? 0.05
      : 0.1 + Math.round(MathUtils.clamp((eased[c]! - 0.12) / 0.75, 0,
        1) * 5) / 5 * 0.22 + (land.cover[c] === 'p' ? 0.04 : 0));
  }
  wet(c: number): boolean { const k = this.land.cover[c]; return k === '~' || k === 'o'; }
  cover(c: number): string { return this.land.cover[c] ?? '.'; }
  // How much a point of a hex's top stands above its terrace (or below it, in a river's bed).
  swell(c: number, x: number, z: number): number { return this.point(c, x, z).y; }
  // A point of a hex's top: how much it stands above its terrace, how far it is cut into a river's bed, and how thick
  // a wood's canopy is over it there.
  point(c: number, x: number, z: number): { y: number; bed: number; crown: number } {
    if (this.wet(c)) { return { y: 0, bed: 0, crown: 0 }; }
    const p = this.grid.centres[c]!, d = Math.min(1, HexGrid.outward(x - p.x, z - p.y, 0.5 * BoardGround.GAP)),
      cover = this.cover(c), settled = this.settled.has(c), bed = this.bed(x, z);
    const grain = (Noise.fbm(x * 3.1 + 5, z * 3.1) - 0.42) * (BoardGround.grains[cover] ?? 0) * 2,
      swell = settled ? 0 : this.humps(c, x - p.x, z - p.y) * (BoardGround.swells[cover] ?? 0),
      crown = cover === 'w' && !settled ? this.canopy(x, z) : 0;
    return { y: (grain + swell) * (1 - d * d) + crown * BoardGround.CANOPY * (1 - d ** 8) - bed, bed, crown };
  }
  // How thick a wood's canopy is at a point, from nothing to all of it: broken into crowns, and opening where a river
  // or a road goes through.
  canopy(x: number, z: number): number {
    const w = this.ways, open = w ? Math.min(w.rivers.distance(x, z, 0.15), w.roads.distance(x, z, 0.15)) : 0.15;
    return (0.4 + Noise.value(x * 5.3 + 11, z * 5.3 + 3) * 0.6) * MathUtils.smoothstep(open, 0.05, 0.15);
  }
  // How far a point is cut down into a river's bed.
  bed(x: number, z: number): number {
    if (!this.ways) { return 0; }
    const [near, far] = BoardGround.banks, d = this.ways.rivers.distance(x, z, far);
    return d >= far ? 0 : BoardGround.BED * (1 - MathUtils.smoothstep(d, near, far));
  }
  // A hex's own swells, two or three rounded rises off its middle, each of its own breadth and height.
  private humps(c: number, dx: number, dz: number): number {
    let h = 0;
    for (let i = 0; i < 3; i++) {
      const a = Noise.hash(c, 40 + i) * 6.283, r = 0.1 + Noise.hash(c, 50 + i) * 0.18,
        s = 0.12 + Noise.hash(c, 60 + i) * 0.08, e = (dx - Math.cos(a) * r) ** 2 + (dz - Math.sin(a) * r) ** 2;
      h += Math.exp(-e / (2 * s * s)) * (0.5 + Noise.hash(c, 70 + i) * 0.5);
    }
    return h;
  }
  // The height of the land at a point, as it stands when known.
  at(x: number, z: number): number {
    const c = this.grid.cellAt(x, z);
    return c === undefined ? 0 : this.levels[c]! + this.swell(c, x, z);
  }
  // How long a step from one hex to the next takes, near enough as the game reckons it: along a road, by the land it
  // goes over at half an hour to the road's hour, a little the quicker so that the way keeps to it; across country,
  // by the harder land, and longer into a river or out of one.
  minutes(a: number, b: number): number {
    if (this.roads.has(`${a}:${b}`)) { return (BoardGround.road[this.cover(b)] ?? 1.2) * 30 * 0.9; }
    const m = BoardGround.going, over = this.river.has(a) !== this.river.has(b) ? 20 : 0;
    return Math.max(m[this.cover(a)] ?? 60, m[this.cover(b)] ?? 60) + over;
  }
}
