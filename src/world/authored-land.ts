import type { Call, Entity, LandChart, Module } from '../lang/module';
import { Draw } from './land/draw';

type Pt = [number, number];
// Where the author's grid lies on the land: its first column and row, and the land's width and height in cells.
interface Frame { x0: number; y0: number; width: number; height: number }

// The land of an authored region, for its map (Mission 18, the owner's review: an adventure's map was five icons
// joined by dashed lines, with no river under a fair held on one). Its author set each of its stretches of country,
// settlements and sites at a place on a grid, said of some what land they are (a river, a lake, a wood, a peak, a
// pass) and of the region what country it is (frost, hills, marsh, forest, mountain); that is enough to draw it. Each
// square of the author's grid is a block of the land; a river runs through the stretches that are river, from one
// edge of the map to the other, two cells wide; a lake, a wood, a peak lies where it is said to; the rest is the
// region's own country, higher toward its edges; and the ways between its places run over the land as roads.
export class AuthoredLand {
  static readonly block = 6;
  static readonly margin = 3;
  // What each region's country mostly is, low ground to high, as a chart writes covers (see Atlas.covers).
  static readonly country: Record<string, string[]> = { frost: ['.', 'h', 'h', 'f'], hills: ['.', '.', 'h', 'f'],
    marsh: [',', ',', '.', 'w'], forest: ['.', 'w', 'w', 'h'], mountain: ['.', 'h', 'f', 'p'], desert: ['.', 'h', 'h', 'f'] };
  // A region's land: its own, where it was drawn with it (a generated country's), else drawn from where its author
  // set its places, once for the world as assembled (a region holds the places other modules set in it too).
  private static readonly drawn = new WeakMap<Module, Map<string, LandChart | undefined>>();
  static of(module: Module, region: string): LandChart | undefined {
    if (module.charts?.[region]) { return module.charts[region]; }
    const known = this.drawn.get(module) ?? this.drawn.set(module, new Map()).get(module)!;
    if (!known.has(region)) { known.set(region, this.chart(module, region)); }
    return known.get(region);
  }
  static chart(module: Module, region: string): LandChart | undefined {
    const areas = module.entities.filter(e => e.space?.parent === region && e.space.grid
      && ['settlement', 'site', 'wilderness'].includes(e.space.kind));
    if (areas.length < 2) { return undefined; }
    const xs = areas.map(a => a.space!.grid![0]), ys = areas.map(a => a.space!.grid![1]), B = this.block;
    const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
    const f: Frame = { x0, y0, width: (Math.max(...xs) - x0 + 1) * B + 2 * this.margin,
      height: (Math.max(...ys) - y0 + 1) * B + 2 * this.margin };
    const forms = this.forms(module), draw = new Draw(`land:${region}`);
    const cover = this.ground(f, this.terrain(module, region), draw);
    for (const a of areas) { this.lay(cover, a, { form: forms.get(a.id), f, draw }); }
    const rivers = this.rivers(areas.filter(a => forms.get(a.id) === 'river').map(a => this.xy(this.centre(a, f), f)), f, draw);
    // A river an author names is a great one, the country's own (a fair is held on it): its water is a band four cells
    // wide, the width of a stretch of it less its banks.
    for (const cells of rivers) { for (const c of this.band(cells, f)) { cover[c] = 'o'; } }
    const parts = Object.fromEntries(areas.filter(a => a.space!.kind === 'wilderness').flatMap(a => {
      const rooms = module.entities.filter(e => e.space?.parent === a.id);
      return rooms.length ? [[rooms[0]!.id, this.cells(a, f)]] : [];
    }));
    return { width: f.width, height: f.height, cover: cover.join(''), rivers, roads: this.roads(module, areas, f),
      parts, places: Object.fromEntries(areas.map(a => [a.id, this.centre(a, f)])),
      blocks: Object.fromEntries(areas.map(a => [a.id, this.cells(a, f)])) };
  }
  // What an area's own land makes of its block: a lake, a wood, a peak or a pass; a settlement's open ground.
  private static lay(cover: string[], a: Entity, at: { form?: string; f: Frame; draw: Draw }) {
    const { form, f, draw } = at, mid = this.centre(a, f), B = this.block;
    if (form === 'lake') { for (const c of this.blob(mid, f.width, B / 2 - 0.5)) { cover[c] = 'o'; } }
    if (form === 'wood') { for (const c of this.cells(a, f)) { if (draw.chance(0.8)) { cover[c] = 'w'; } } }
    if (form === 'peak' || form === 'pass') { for (const c of this.blob(mid, f.width, B / 2)) { cover[c] = form === 'peak' ? 'p' : 'f'; } }
    if (a.space!.kind === 'settlement') { for (const c of this.blob(mid, f.width, 1.6)) { cover[c] = '.'; } }
  }
  // The cells of a river's water, to either side of its course: above and below where it runs across, else beside.
  private static band(cells: number[], f: Frame): number[] {
    const across = cells.length > 1 && Math.abs(cells.at(-1)! % f.width - cells[0]! % f.width)
      >= Math.abs(Math.floor(cells.at(-1)! / f.width) - Math.floor(cells[0]! / f.width));
    const step = across ? f.width : 1;
    return cells.flatMap(c => [-2, -1, 0, 1].map(d => c + d * step)).filter(c => c >= 0 && c < f.width * f.height);
  }
  private static calls(module: Module, name: string): Call[] {
    return module.initial.flatMap(c => {
      const call = (c as { call?: Call }).call;
      return call?.name === name ? [call] : [];
    });
  }
  private static forms(module: Module): Map<string, string> {
    return new Map(this.calls(module, 'landform').filter(c => c.args[1])
      .map(c => [c.args[0]!, c.args[1]!.replace(/^.*__/, '').replace(/^land_/, '')]));
  }
  private static terrain(module: Module, region: string): string {
    return this.calls(module, 'terrain').find(c => c.args[0] === region)?.args[1]?.replace(/^.*__/, '') ?? 'forest';
  }
  // The region's own country: low in the middle, rising to its edges, with a little drawn unevenness.
  private static ground(f: Frame, terrain: string, draw: Draw): string[] {
    const bands = this.country[terrain] ?? this.country.forest!;
    return Array.from({ length: f.width * f.height }, (_, c) => {
      const [x, y] = this.xy(c, f);
      const edge = Math.max(Math.abs(x - f.width / 2) / (f.width / 2), Math.abs(y - f.height / 2) / (f.height / 2));
      const h = Math.min(0.999, Math.max(0, edge * 0.85 + (draw.next() - 0.5) * 0.35));
      return bands[Math.floor(h * bands.length)]!;
    });
  }
  private static xy(c: number, f: Frame): Pt { return [c % f.width, Math.floor(c / f.width)]; }
  // The cell at the middle of an area's block, and every cell of it.
  private static centre(a: Entity, f: Frame): number {
    const [gx, gy] = this.corner(a, f);
    return (gy + this.block / 2) * f.width + gx + this.block / 2;
  }
  private static cells(a: Entity, f: Frame): number[] {
    const B = this.block, [gx, gy] = this.corner(a, f);
    return Array.from({ length: B * B }, (_, i) => (gy + Math.floor(i / B)) * f.width + gx + i % B);
  }
  private static corner(a: Entity, f: Frame): Pt {
    const [gx, gy] = a.space!.grid!;
    return [this.margin + (gx - f.x0) * this.block, this.margin + (gy - f.y0) * this.block];
  }
  private static blob(c: number, width: number, r: number): number[] {
    const x = c % width, y = Math.floor(c / width), out: number[] = [], k = Math.ceil(r);
    for (let dy = -k; dy <= k; dy++) {
      for (let dx = -k; dx <= k; dx++) { if (dx * dx + dy * dy <= r * r) { out.push((y + dy) * width + x + dx); } }
    }
    return out;
  }
  // A river through the stretches that are river, in the order they lie (along whichever way they spread more),
  // carried on to the edges of the map, wandering a little between.
  private static rivers(pts: Pt[], f: Frame, draw: Draw): number[][] {
    if (!pts.length) { return []; }
    const across = this.spread(pts, 0) >= this.spread(pts, 1);
    pts.sort((a, b) => across ? a[0] - b[0] : a[1] - b[1]);
    const first = pts[0]!, last = pts.at(-1)!;
    const line: Pt[] = [across ? [0, first[1]] : [first[0], 0], ...pts,
      across ? [f.width - 1, last[1]] : [last[0], f.height - 1]];
    const cells: number[] = [];
    for (let i = 0; i < line.length - 1; i++) {
      for (const [x, y] of this.walk(line[i]!, line[i + 1]!, draw)) {
        const c = y * f.width + x;
        if (cells.at(-1) !== c) { cells.push(c); }
      }
    }
    return [cells];
  }
  private static spread(pts: Pt[], i: 0 | 1): number {
    return Math.max(...pts.map(p => p[i])) - Math.min(...pts.map(p => p[i]));
  }
  // The cells from one point to another, a step at a time, now and then sideways.
  private static walk(a: Pt, b: Pt, draw: Draw): Pt[] {
    const out: Pt[] = [[...a]];
    let [x, y] = a;
    while (x !== b[0] || y !== b[1]) {
      const dx = Math.sign(b[0] - x), dy = Math.sign(b[1] - y);
      if (dx && (!dy || Math.abs(b[0] - x) > Math.abs(b[1] - y) || draw.chance(0.3))) { x += dx; } else { y += dy; }
      out.push([x, y]);
    }
    return out;
  }
  // The cells on a straight line from one point to another.
  private static line(a: Pt, b: Pt): Pt[] {
    const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), 1), out: Pt[] = [];
    for (let i = 0; i <= n; i++) {
      const p: Pt = [Math.round(a[0] + (b[0] - a[0]) * i / n), Math.round(a[1] + (b[1] - a[1]) * i / n)];
      if (!out.length || out.at(-1)![0] !== p[0] || out.at(-1)![1] !== p[1]) { out.push(p); }
    }
    return out;
  }
  // The area of the region a place is in.
  private static area(id: string, byId: Map<string, Entity>, ids: Set<string>): Entity | undefined {
    for (let e = byId.get(id); e; e = e.space?.parent ? byId.get(e.space.parent) : undefined) {
      if (ids.has(e.id)) { return e; }
    }
    return undefined;
  }
  // Each way between places in two different stretches of the region, run over the land from one to the other by a
  // point a little off the straight.
  private static roads(module: Module, areas: Entity[], f: Frame): Record<string, number[]> {
    const ids = new Set(areas.map(a => a.id)), byId = new Map(module.entities.map(e => [e.id, e]));
    const out: Record<string, number[]> = {}, draw = new Draw('roads');
    for (const call of this.calls(module, 'connects')) {
      const a = this.area(call.args[1]!, byId, ids), b = this.area(call.args[2]!, byId, ids);
      if (!a || !b || a === b || out[call.args[0]!]) { continue; }
      const p = this.xy(this.centre(a, f), f), q = this.xy(this.centre(b, f), f);
      const mid: Pt = [Math.round((p[0] + q[0]) / 2 + (draw.next() - 0.5) * 2),
        Math.round((p[1] + q[1]) / 2 + (draw.next() - 0.5) * 2)];
      out[call.args[0]!] = [...this.line(p, mid), ...this.line(mid, q).slice(1)].map(([x, y]) => y * f.width + x);
    }
    return out;
  }
}
