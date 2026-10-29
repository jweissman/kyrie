import { CanvasTexture, LinearFilter, MathUtils, NoColorSpace, Vector2 } from 'three';
import type { HexGrid } from './hex-grid';

// What the company knows of the country, hex by hex (1 known, a third glimpsed at its edge, 0 not), drawn as a soft
// mask for the mist to thin over; and how newly known country arrives, the hexes nearest first, the mist going off
// them and the tiles standing up out of it.
export class BoardKnowing {
  static readonly GLIMPSE = 0.34;
  static readonly MARGIN = 9;
  private static readonly PX = 20;
  // What each country was known to be the last time its map was open, so that what is new can arrive.
  private static readonly last = new Map<string, number[]>();
  readonly now: Float32Array;
  readonly texture: CanvasTexture;
  readonly origin = new Vector2(-BoardKnowing.MARGIN, -BoardKnowing.MARGIN);
  readonly size: Vector2;
  private from: number[];
  private readonly to: number[];
  private readonly delay: number[];
  private readonly canvas = document.createElement('canvas');
  constructor(private readonly grid: HexGrid, known: number[], key: string, here?: number) {
    const before = new Set(BoardKnowing.last.get(key) ?? known), after = new Set(known);
    BoardKnowing.last.set(key, known);
    this.from = this.levels(before); this.to = this.levels(after);
    const at = here !== undefined ? grid.centres[here]! : new Vector2(grid.across / 2, grid.down / 2);
    this.delay = grid.cells.map(c => 0.3 + grid.centres[c]!.distanceTo(at) * 0.2);
    this.now = Float32Array.from(this.from);
    this.size = new Vector2(grid.across + 2 * BoardKnowing.MARGIN, grid.down + 2 * BoardKnowing.MARGIN);
    this.canvas.width = Math.round(this.size.x * BoardKnowing.PX);
    this.canvas.height = Math.round(this.size.y * BoardKnowing.PX);
    this.texture = new CanvasTexture(this.canvas);
    this.texture.colorSpace = NoColorSpace; this.texture.minFilter = this.texture.magFilter = LinearFilter;
    this.draw();
  }
  get arriving(): boolean { return this.from.some((v, c) => v !== this.to[c]); }
  // Knowledge as it stands t seconds into its arrival; whether it is still arriving.
  arrive(t: number): boolean {
    let moving = false;
    for (const c of this.grid.cells) {
      if (this.from[c] === this.to[c]) { continue; }
      const p = MathUtils.clamp((t - this.delay[c]!) / 1.1, 0, 1);
      this.now[c] = this.from[c]! + (this.to[c]! - this.from[c]!) * (1 - (1 - p) ** 3);
      if (p < 1) { moving = true; }
    }
    if (!moving) { this.from = [...this.to]; }
    this.draw();
    return moving;
  }
  // At once, for whoever has asked for less motion.
  settle(): void { this.now.set(this.to); this.from = [...this.to]; this.draw(); }
  known(c: number): boolean { return this.now[c]! > 0.5; }
  private levels(known: Set<number>): number[] {
    return this.grid.cells.map(c => known.has(c) ? 1
      : this.grid.neighbours(c).some(n => known.has(n)) ? BoardKnowing.GLIMPSE : 0);
  }
  private draw(): void {
    const g = this.canvas.getContext('2d')!, px = BoardKnowing.PX, m = BoardKnowing.MARGIN;
    g.fillStyle = '#000'; g.fillRect(0, 0, this.canvas.width, this.canvas.height); g.filter = 'blur(4px)';
    for (const c of this.grid.cells) {
      const k = this.now[c]!, p = this.grid.centres[c]!, v = Math.round(k * 255);
      if (k <= 0.001) { continue; }
      g.fillStyle = `rgb(${v},${v},${v})`; g.beginPath(); g.arc((p.x + m) * px, (p.y + m) * px, 0.6 * px, 0, Math.PI * 2); g.fill();
    }
    g.filter = 'none'; this.texture.needsUpdate = true;
  }
}
