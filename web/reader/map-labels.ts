import type { Pt } from './cartography';

export interface Box { x0: number; y0: number; x1: number; y1: number }
export type Anchor = 'middle' | 'start' | 'end';
// A name the map would write: where its mark is, how big it is written and in what face, how far from the mark it
// sits, and how much it matters. A name across a stretch of country is centred on one of its points, in order.
export interface Wanted { id: string; text: string; at: Pt[]; size: number; face: 'caps' | 'roman' | 'italic' | 'spaced';
  gap: number }
interface Size { width: number; size: number; lines: number; leading: number }
// A name written: its lines (a long one is broken in two), where the first line's baseline starts, and its box.
export interface Placed { id: string; lines: string[]; x: number; y: number; anchor: Anchor; box: Box; leading: number }

// Where each name on a map goes. They are written in the order given, the one that matters most first: each under
// its mark if there is room, else over it, beside it or at a slant from it, and if nowhere is free of the names and
// marks already set down, not written at all (its mark still says it on a long look).
export class MapLabels {
  // The breadth of a face's letters, as a share of its size.
  static readonly breadth: Record<Wanted['face'], number> = { caps: 0.64, roman: 0.5, italic: 0.46, spaced: 1.02 };
  static place(wanted: Wanted[], taken: Box[]): Placed[] {
    const placed: Placed[] = [];
    for (const w of wanted) {
      const lines = w.face === 'spaced' ? [w.text] : this.wrap(w.text), leading = w.size * 1.05;
      const width = Math.max(...lines.map(l => l.length)) * w.size * this.breadth[w.face] + 6;
      const size = { width, size: w.size, lines: lines.length, leading };
      const spot = w.at.flatMap(p => this.spots(p, w, size)).find(s => this.free(taken, this.box(s, size)));
      if (!spot) { continue; }
      const box = this.box(spot, size);
      taken.push(box);
      placed.push({ id: w.id, lines, x: spot.x, y: spot.y, anchor: spot.anchor, box, leading });
    }
    return placed;
  }
  // A long name is broken at the space nearest its middle.
  static wrap(text: string): string[] {
    if (text.length <= 20) { return [text]; }
    const spaces = [...text.matchAll(/ /g)].map(m => m.index!), mid = text.length / 2;
    const at = spaces.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid))[0];
    return at === undefined ? [text] : [text.slice(0, at), text.slice(at + 1)];
  }
  // The places a name may go about its mark: under it, over it, to the right, to the left, at the four slants, and
  // then all of those again a little further off.
  private static spots(p: Pt, w: Wanted, t: Size): { x: number; y: number; anchor: Anchor }[] {
    const more = (t.lines - 1) * t.leading;
    if (!w.gap) { return [{ x: p.x, y: p.y + w.size * 0.35 - more / 2, anchor: 'middle' }]; }
    return [w.gap, w.gap * 1.9].flatMap(g => {
      const down = p.y + g + w.size * 0.75, up = p.y - g - w.size * 0.2 - more, level = p.y + w.size * 0.33 - more / 2;
      return [{ x: p.x, y: down, anchor: 'middle' as const }, { x: p.x, y: up, anchor: 'middle' as const },
        { x: p.x + g, y: level, anchor: 'start' as const }, { x: p.x - g, y: level, anchor: 'end' as const },
        { x: p.x + g * 0.7, y: down, anchor: 'start' as const }, { x: p.x + g * 0.7, y: up, anchor: 'start' as const },
        { x: p.x - g * 0.7, y: down, anchor: 'end' as const }, { x: p.x - g * 0.7, y: up, anchor: 'end' as const }];
    });
  }
  // The box a name takes, written at a spot (its first baseline, anchored at the start, middle or end).
  static box(s: { x: number; y: number; anchor: Anchor }, t: Size): Box {
    const x0 = s.anchor === 'start' ? s.x : s.anchor === 'end' ? s.x - t.width : s.x - t.width / 2;
    return { x0, y0: s.y - t.size * 0.85, x1: x0 + t.width, y1: s.y + (t.lines - 1) * t.leading + t.size * 0.25 };
  }
  static around(p: Pt, r: number): Box { return { x0: p.x - r, y0: p.y - r, x1: p.x + r, y1: p.y + r }; }
  static free(taken: Box[], b: Box): boolean {
    return taken.every(t => b.x1 <= t.x0 || b.x0 >= t.x1 || b.y1 <= t.y0 || b.y0 >= t.y1);
  }
  static inside(b: Box, p: Pt, margin = 0): boolean {
    return p.x >= b.x0 - margin && p.x <= b.x1 + margin && p.y >= b.y0 - margin && p.y <= b.y1 + margin;
  }
}
