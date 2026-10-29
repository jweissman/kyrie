import type { RegionChart } from '../../src/ui/screen-types';
import { Typography } from '../../src/presentation/typography';

type Land = NonNullable<RegionChart['land']>;
export interface Pt { x: number; y: number }
export interface Tile extends Pt { i: number; cover: string; points: string; known: boolean }
export interface Mark extends Pt {
  id: string; name: string; sign: string; visited: boolean; town: boolean; here: boolean;
}
export interface Drawn {
  size: { w: number; h: number }; tiles: Tile[]; edge: Tile[];
  glyphs: { id: string; x: number; y: number; s: number }[];
  rivers: string[]; roads: string[]; marks: Mark[]; zones: (Pt & { id: string; name: string })[]; here?: Pt;
  // The part of the land worth opening on: what is known, with a ring about it.
  box: number[];
}

// The land of the map as hexes (Mission 18, the owner's correction: an illustrated, terrain-first hex crawl, chosen
// over an isometric terrain and a painted hybrid by how each looked and read). Every cell the company knows is a hex
// of its land, drawn with what grows or stands on it (trees, fells, a peak, reeds, heath, water); the ring of hexes
// just beyond what is known is the edge of the unknown, glimpsed; past it, nothing. Rivers and roads run through the
// hexes' middles as curves, features of the land and not lines between places. The cells are set out as the open
// country's ways run (see RegionTracts): every other row half a hex to the east.
export class HexLand {
  static readonly R = 30;
  static readonly W = Math.sqrt(3) * HexLand.R;
  static readonly covers: Record<string, string> = { '~': 'sea', o: 'lake', ',': 'fen', '.': 'meadow', w: 'wood',
    h: 'heath', f: 'fell', p: 'peak' };
  // How many marks of its land a hex carries, and how large.
  static readonly scatter: Record<string, [number, number]> = { wood: [5, 15], peak: [1, 30], fell: [2, 22],
    heath: [3, 12], fen: [3, 13], sea: [2, 14], lake: [2, 14], meadow: [3, 10] };
  static centre(i: number, W: number): Pt {
    const col = i % W, row = Math.floor(i / W);
    return { x: col * this.W + (row % 2) * this.W / 2 + this.W / 2, y: row * this.R * 1.5 + this.R };
  }
  static hex(c: Pt, r = this.R * 0.99): string {
    return [0, 1, 2, 3, 4, 5].map(a => {
      const t = Math.PI / 180 * (60 * a - 30);
      return `${(c.x + r * Math.cos(t)).toFixed(1)},${(c.y + r * Math.sin(t)).toFixed(1)}`;
    }).join(' ');
  }
  static readonly odd = [[1, 0], [-1, 0], [0, -1], [1, -1], [0, 1], [1, 1]];
  static readonly even = [[1, 0], [-1, 0], [-1, -1], [0, -1], [-1, 1], [0, 1]];
  static neighbours(i: number, W: number, H: number): number[] {
    const x = i % W, y = Math.floor(i / W);
    return (y % 2 ? this.odd : this.even).map(([dx, dy]) => [x + dx!, y + dy!])
      .filter(([a, b]) => a! >= 0 && b! >= 0 && a! < W && b! < H).map(([a, b]) => b! * W + a!);
  }
  static hash(x: number, y: number): number {
    let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
  private static tile(land: Land, i: number, known: boolean): Tile {
    const c = this.centre(i, land.width);
    return { i, ...c, cover: this.covers[land.cover[i] ?? '.'] ?? 'meadow', points: this.hex(c), known };
  }
  static draw(region: RegionChart): Drawn {
    const land = region.land!, W = land.width, H = land.height, known = new Set(land.known), edge = new Set<number>();
    for (const c of known) { for (const n of this.neighbours(c, W, H)) { if (!known.has(n)) { edge.add(n); } } }
    const tiles = land.known.map(i => this.tile(land, i, true)), shown = new Set([...known, ...edge]);
    return { size: { w: W * this.W + this.W / 2, h: H * this.R * 1.5 + this.R / 2 }, tiles,
      edge: [...edge].map(i => this.tile(land, i, false)), glyphs: tiles.flatMap(t => this.glyphs(t)),
      rivers: land.rivers.map(r => this.line(r, shown, W)).filter(Boolean),
      roads: Object.values(land.roads).map(r => this.line(r, shown, W)).filter(Boolean), marks: this.marks(region),
      zones: land.zones.map(z => this.zone(z, W)), box: this.box([...shown], W, H, land.here),
      ...land.here !== undefined ? { here: this.centre(land.here, W) } : {} };
  }
  // A river or a road through the cells shown, as curves: broken where it runs out of what is shown, so that it never
  // leaps across the unknown from one stretch of it to the next.
  private static line(cells: number[], shown: Set<number>, W: number): string {
    const runs: number[][] = [];
    cells.forEach((c, i) => {
      const prev = cells[i - 1], joined = prev !== undefined && shown.has(prev) && this.touches(prev, c, W);
      if (!shown.has(c)) { return; }
      if (joined && runs.length) { runs.at(-1)!.push(c); } else { runs.push([c]); }
    });
    return runs.filter(r => r.length > 1).map(r => this.curve(r.map(c => this.centre(c, W)))).join(' ');
  }
  // Whether two cells are next to each other (or the same), across a row or along it.
  private static touches(a: number, b: number, W: number): boolean {
    return Math.abs(a % W - b % W) <= 1 && Math.abs(Math.floor(a / W) - Math.floor(b / W)) <= 1;
  }
  // The marks of a hex's land, each placed by the hex and its count, back to front.
  private static glyphs(t: Tile): Drawn['glyphs'] {
    const [n, s] = this.scatter[t.cover] ?? [0, 0];
    return Array.from({ length: n }, (_, k) => ({ id: t.cover === 'wood' && k % 3 === 2 ? 'fir' : t.cover,
      x: t.x + (this.hash(t.i * 7 + k, 3) - 0.5) * this.R * 1.05,
      y: t.y + (this.hash(t.i * 5 + k, 9) - 0.42) * this.R * 0.95, s })).sort((a, b) => a.y - b.y);
  }
  // Each place on the land with its sign: a town; anything else by what it is called (a tower, a cave, a shrine).
  static readonly signs: [RegExp, string][] = [[/tower|keep|spire/i, 'tower'], [/ruin|fallen|walls|arch/i, 'ruin'],
    [/cave|hollow|den|adit|workings|mine|pit/i, 'cave'], [/shrine|chapel|altar|well/i, 'shrine'],
    [/mound|barrow|cairn/i, 'barrow'], [/camp|clearing|burners/i, 'camp'], [/stone|march/i, 'stone'],
    [/tarn|mere|pool|spring/i, 'tarn'], [/crag|rock|scar/i, 'crag'], [/ford|crossing|bridge/i, 'ford'],
    [/grove|oak|thorn|willow|alder/i, 'grove'], [/way into|gate/i, 'gate']];
  private static marks(region: RegionChart): Mark[] {
    const land = region.land!, W = land.width;
    const towns = region.areas.filter(a => a.kind === 'settlement').map(a => ({ id: a.id, name: a.name,
      cell: a.y * W + a.x, sign: 'town', visited: a.visited, town: true, here: a.here }));
    const others = land.marks.map(m => ({ id: m.id, name: Typography.curl(m.name.replace(/^the /, '')), cell: m.cell,
      sign: this.signs.find(([re]) => re.test(m.name))?.[1] ?? (m.kind === 'site' ? 'ruin' : 'stone'),
      visited: m.visited, town: false, here: m.here }));
    return [...towns, ...others].map(m => ({ ...m, ...this.centre(m.cell, W) }));
  }
  private static zone(z: Land['zones'][number], W: number): Pt & { id: string; name: string } {
    const pts = z.cells.map(c => this.centre(c, W));
    return { id: z.id, name: Typography.curl(z.name.replace(/^the /i, '')),
      x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length };
  }
  private static box(cells: number[], W: number, H: number, here?: number): number[] {
    const pts = [...cells, ...here !== undefined ? [here] : []].map(c => this.centre(c, W));
    if (!pts.length) { return [0, 0, W * this.W, H * this.R * 1.5]; }
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y), pad = this.R * 2;
    const [x0, y0] = [Math.min(...xs) - pad, Math.min(...ys) - pad];
    const [x1, y1] = [Math.max(...xs) + pad, Math.max(...ys) + pad];
    return [x0, y0, Math.max(x1 - x0, this.W * 8), Math.max(y1 - y0, this.R * 8)];
  }
  static curve(p: Pt[]): string {
    if (p.length < 2) { return ''; }
    let d = `M${p[0]!.x.toFixed(1)},${p[0]!.y.toFixed(1)}`;
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i - 1] ?? p[i]!, b = p[i]!, c = p[i + 1]!, e = p[i + 2] ?? c;
      d += ` C${(b.x + (c.x - a.x) / 6).toFixed(1)},${(b.y + (c.y - a.y) / 6).toFixed(1)}`
        + ` ${(c.x - (e.x - b.x) / 6).toFixed(1)},${(c.y - (e.y - b.y) / 6).toFixed(1)} ${c.x.toFixed(1)},${c.y.toFixed(1)}`;
    }
    return d;
  }
}
