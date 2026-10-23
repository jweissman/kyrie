import { Cartography, type Field, type Ground, type Pt } from './cartography';

export interface Mark { x: number; y: number; cover: string; s: number }
// What marks keep clear of, in map units: spots with a reach each (the places), lines (roads and rivers), and boxes
// (the names written on the map).
export interface Clear { spots: { x: number; y: number; r: number }[]; lines: Pt[][] }

// The marks a land is drawn with: trees in a wood, hills on the fells and peaks above them, reeds in the fen, tufts on
// the heath, a little grass in the meadows. Scattered as a hand scatters them rather than set out cell by cell: each
// falls where the land's own noise puts it, inside the outline of its cover, no nearer another than its kind allows,
// and clear of the roads, the rivers and the places on them.
export class MapMarks {
  // How many to try in a cell, how far apart they keep (in cells), and how far inside their cover's outline.
  static readonly kinds: Record<string, { tries: number; apart: number; inside: number }> = {
    w: { tries: 11, apart: 0.21, inside: 0.62 }, ',': { tries: 5, apart: 0.33, inside: 0.6 },
    h: { tries: 3, apart: 0.42, inside: 0.58 }, f: { tries: 3, apart: 0.47, inside: 0.6 },
    p: { tries: 2, apart: 0.5, inside: 0.6 }, '.': { tries: 1, apart: 0.8, inside: 0.6 } };
  static scatter(ground: Ground, cells: number[], fields: Record<string, Field>, clear: Clear): Mark[] {
    const S = Cartography.cell, marks: Mark[] = [], grid = new Map<number, Mark[]>();
    for (const c of cells) {
      const cover = ground.cover[c]!, kind = this.kinds[cover], field = fields[cover];
      if (!kind || !field) { continue; }
      const cx = c % ground.width, cy = Math.floor(c / ground.width);
      for (let n = 0; n < kind.tries; n++) {
        const u = cx + Cartography.hash(c, n * 3 + 1), w = cy + Cartography.hash(c, n * 3 + 2);
        if (Cartography.value(field, u, w) < kind.inside) { continue; }
        const mark = { x: u * S, y: w * S, cover, s: 0.95 + 0.34 * Cartography.hash(c, n * 3 + 3) };
        if (!this.room(grid, mark, kind.apart * S) || !this.free(clear, mark)) { continue; }
        marks.push(mark);
        const key = this.bucket(mark.x, mark.y);
        grid.set(key, [...grid.get(key) ?? [], mark]);
      }
    }
    return marks.sort((a, b) => a.y - b.y);
  }
  private static bucket(x: number, y: number): number {
    return Math.floor(y / Cartography.cell) * 4096 + Math.floor(x / Cartography.cell);
  }
  // No other mark nearer than the kind allows (looked for in the cells around).
  private static room(grid: Map<number, Mark[]>, m: Mark, apart: number): boolean {
    const S = Cartography.cell;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const near = grid.get(this.bucket(m.x + dx * S, m.y + dy * S)) ?? [];
        if (near.some(o => Math.hypot(o.x - m.x, o.y - m.y) < apart)) { return false; }
      }
    }
    return true;
  }
  private static free(clear: Clear, m: Pt): boolean {
    return clear.spots.every(s => Math.hypot(s.x - m.x, s.y - m.y) > s.r)
      && clear.lines.every(line => this.distance(line, m) > 15);
  }
  // How far a point is from a line through points.
  static distance(line: Pt[], p: Pt): number {
    let best = Infinity;
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1]!, b = line[i]!, dx = b.x - a.x, dy = b.y - a.y, len = dx * dx + dy * dy;
      const t = len ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len)) : 0;
      best = Math.min(best, Math.hypot(a.x + t * dx - p.x, a.y + t * dy - p.y));
    }
    return best;
  }
}
