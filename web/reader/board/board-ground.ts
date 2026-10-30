import { MathUtils } from 'three';
import { HexGrid } from './hex-grid';
import { Noise } from './noise';
import type { BoardLand } from './board-types';

// The ground of the board: each hex a low terrace, as high as its land goes (fen lowest, then fields, woods, heath,
// fells, the heights), eased toward its neighbours and lower where a river runs, in no more than five gentle steps;
// its top swelling a little within itself and level at its rim, so that it meets its sides.
export class BoardGround {
  static readonly GAP = 0.975;
  private static readonly rise: Record<string, number> = { ',': 0.15, '.': 0.25, w: 0.32, h: 0.45, f: 0.62, p: 0.9 };
  private static readonly swells: Record<string,
    number> = { p: 0.05, f: 0.035, h: 0.03, w: 0.02, '.': 0.018, ',': 0.008 };
  // The minutes a step across country takes, by its land, and the hours of a road's own step, as the game has them.
  private static readonly going: Record<string, number> = { '.': 30, h: 40, w: 60, ',': 70, f: 70, p: 120 };
  private static readonly road: Record<string, number> = { '.': 1, h: 1.1, w: 1.2, ',': 1.4, f: 1.6, p: 2.5 };
  readonly levels: number[];
  // The hexes a river runs through, and each step along a known road, either way.
  private readonly river: Set<number>;
  private readonly roads = new Set<string>();
  constructor(readonly grid: HexGrid, readonly land: BoardLand) {
    const wet = this.river = new Set(land.rivers.flat()),
      raw = grid.cells.map(c => this.wet(c) ? 0 : BoardGround.rise[land.cover[c]!] ?? 0.3);
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
        1) * 5) / 5 * 0.26 + (land.cover[c] === 'p' ? 0.06 : 0));
  }
  wet(c: number): boolean { const k = this.land.cover[c]; return k === '~' || k === 'o'; }
  cover(c: number): string { return this.land.cover[c] ?? '.'; }
  // How much a point of a hex's top stands above its terrace.
  swell(c: number, x: number, z: number): number {
    if (this.wet(c)) { return 0; }
    const p = this.grid.centres[c]!, d = Math.min(1, HexGrid.outward(x - p.x, z - p.y, 0.5 * BoardGround.GAP));
    return (Noise.fbm(x * 3.1 + 5, z * 3.1) - 0.42) * (BoardGround.swells[this.cover(c)] ?? 0) * (1 - d * d) * 2;
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
