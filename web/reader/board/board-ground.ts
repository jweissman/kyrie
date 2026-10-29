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
  readonly levels: number[];
  constructor(readonly grid: HexGrid, readonly land: BoardLand) {
    const wet = new Set(land.rivers.flat()),
      raw = grid.cells.map(c => this.wet(c) ? 0 : BoardGround.rise[land.cover[c]!] ?? 0.3);
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
  // How long a step from one hex to the next takes, by the harder land: what the card says of it.
  minutes(a: number, b: number): number {
    const m: Record<string, number> = { '.': 30, h: 40, w: 60, ',': 70, f: 70, p: 120 };
    return Math.max(m[this.cover(a)] ?? 60, m[this.cover(b)] ?? 60);
  }
}
