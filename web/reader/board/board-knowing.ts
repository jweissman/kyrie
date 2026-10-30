import { CanvasTexture, LinearFilter, MathUtils, NoColorSpace, Vector2 } from 'three';
import type { HexGrid } from './hex-grid';

// What the company knows of the country, hex by hex (1 known, a third glimpsed at its edge, 0 not), drawn as a soft
// mask for the mist to thin over; and how newly known country arrives, the hexes nearest first, the mist going off
// them and the tiles standing up out of it. The mask is drawn again only when some hex has changed in it, and while
// country arrives no more often than the eye needs (it is soft, and every drawing is sent whole to be drawn with).
export class BoardKnowing {
  static readonly GLIMPSE = 0.34;
  static readonly MARGIN = 9;
  private static readonly PX = 10;
  private static readonly EVERY = 1 / 30;
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
  // Each hex drawn hard, then softened onto the mask at once; and the grey each was last drawn in.
  private readonly hard = document.createElement('canvas');
  private readonly drawn: Int16Array;
  private drawnAt = -Infinity;
  constructor(private readonly grid: HexGrid, known: number[], key: string, here?: number) {
    const before = new Set(BoardKnowing.last.get(key) ?? known), after = new Set(known);
    BoardKnowing.last.set(key, known);
    this.from = this.levels(before); this.to = this.levels(after);
    const at = here !== undefined ? grid.centres[here]! : new Vector2(grid.across / 2, grid.down / 2);
    this.delay = grid.cells.map(c => 0.3 + grid.centres[c]!.distanceTo(at) * 0.2);
    this.now = Float32Array.from(this.from);
    this.size = new Vector2(grid.across + 2 * BoardKnowing.MARGIN, grid.down + 2 * BoardKnowing.MARGIN);
    this.canvas.width = this.hard.width = Math.round(this.size.x * BoardKnowing.PX);
    this.canvas.height = this.hard.height = Math.round(this.size.y * BoardKnowing.PX);
    this.drawn = new Int16Array(grid.cells.length).fill(-1);
    // Sent as it is drawn, its first row the land's north as the mist reads it, not turned over as pictures are.
    this.texture = new CanvasTexture(this.canvas); this.texture.flipY = false;
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
    if (!moving || t - this.drawnAt >= BoardKnowing.EVERY) { this.draw(); this.drawnAt = t; }
    return moving;
  }
  // At once, for whoever has asked for less motion.
  settle(): void { this.now.set(this.to); this.from = [...this.to]; this.draw(); }
  known(c: number): boolean { return this.now[c]! > 0.5; }
  // Whether a hex is known once what is arriving has come: the way you are bound goes over these.
  will(c: number): boolean { return this.to[c]! > 0.5; }
  // Whether a hex stands as it will once what is arriving has come (it was not to change, or it has).
  still(c: number): boolean { return Math.abs(this.now[c]! - this.to[c]!) < 1e-4; }
  private levels(known: Set<number>): number[] {
    return this.grid.cells.map(c => known.has(c) ? 1
      : this.grid.neighbours(c).some(n => known.has(n)) ? BoardKnowing.GLIMPSE : 0);
  }
  private draw(): void {
    if (!this.changed()) { return; }
    const h = this.hard.getContext('2d')!, g = this.canvas.getContext('2d')!, px = BoardKnowing.PX,
      m = BoardKnowing.MARGIN, { width, height } = this.canvas;
    h.fillStyle = '#000'; h.fillRect(0, 0, width, height);
    for (const c of this.grid.cells) {
      const v = this.drawn[c]!, p = this.grid.centres[c]!;
      if (!v) { continue; }
      h.fillStyle = `rgb(${v},${v},${v})`; h.beginPath();
      h.arc((p.x + m) * px, (p.y + m) * px, 0.6 * px, 0, Math.PI * 2); h.fill();
    }
    g.fillStyle = '#000'; g.fillRect(0, 0, width, height);
    g.filter = `blur(${0.2 * px}px)`; g.drawImage(this.hard, 0, 0); g.filter = 'none';
    this.texture.needsUpdate = true;
  }
  // Whether any hex is to be drawn in another grey than it last was, each one's grey kept for the drawing.
  private changed(): boolean {
    let changed = false;
    for (let c = 0; c < this.drawn.length; c++) {
      const v = Math.round(this.now[c]! * 255);
      if (v !== this.drawn[c]) { this.drawn[c] = v; changed = true; }
    }
    return changed;
  }
}
