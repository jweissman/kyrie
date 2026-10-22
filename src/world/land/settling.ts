import { Draw } from './draw';
import { Terrain, type Land } from './terrain';
import type { Cover } from './land-cover';

export type SeatSize = 'town' | 'village' | 'hamlet';
// Why a settlement stands where it does: on a river, where two rivers meet, where a road can ford one, on the coast
// with a sheltered landing, by a lake, under fells with stone and ore, by woods, amid meadows, on heath, by a fen.
export type Lie = 'river' | 'confluence' | 'coast' | 'harbour' | 'lake' | 'fells' | 'woods' | 'meadows' | 'heath'
  | 'fen';
export interface Seat { cell: number; size: SeatSize; lie: Lie[] }

// Where people have settled: the best ground first, and each place far enough from the others to have its own
// fields. Good ground is open and level, with water at hand (a river, better where two meet; a lake; the sea, best
// where a bay gives a landing) and woods, fells or meadows around it for timber, stone and ore, and grazing. The
// best place is the town; villages and hamlets take the next best, further apart for a village than a hamlet.
export class Settling {
  static readonly base: Record<Cover, number> = { meadow: 3, heath: 1.5, wood: 1.2, fell: 0.6, fen: 0, peak: -9,
    lake: -9, sea: -9 };
  static readonly counts: Record<string, Record<SeatSize, number>> = {
    forest: { town: 1, village: 2, hamlet: 2 }, marsh: { town: 1, village: 2, hamlet: 2 },
    mountain: { town: 1, village: 2, hamlet: 2 }, frost: { town: 1, village: 1, hamlet: 3 } };
  static readonly spacing: Record<SeatSize, number> = { town: 0, village: 5, hamlet: 4 };
  static make(key: string, terrain: string, land: Land): Seat[] {
    const draw = new Draw(`${key}:settling`), scores = land.cover.map((_, c) => this.score(land, c) + draw.next() * 0.6);
    const seats: Seat[] = [], counts = this.counts[terrain] ?? this.counts.forest!;
    let reach: Set<number> | undefined;
    for (const size of ['town', 'village', 'hamlet'] as const) {
      for (let n = 0; n < counts[size]; n++) {
        // Every settlement stands on the same land as the town, where a road can reach it.
        const open = scores.map((s, c) => ({ s, c }))
          .filter(({ c }) => this.room(land, seats, c, size) && (!reach || reach.has(c)))
          .sort((a, b) => b.s - a.s || a.c - b.c);
        if (!open[0] || open[0].s < 0.5) { break; }
        seats.push({ cell: open[0].c, size, lie: this.lie(land, open[0].c) });
        reach ??= this.land(land, open[0].c);
      }
    }
    return seats;
  }
  // The dry land joined to a cell: what can be walked to from it without crossing a lake or the sea.
  private static land(land: Land, start: number): Set<number> {
    const reach = new Set([start]), queue = [start];
    for (let i = 0; i < queue.length; i++) {
      for (const n of Terrain.neighbours(land, queue[i]!)) {
        if (!reach.has(n) && !['sea', 'lake'].includes(land.cover[n]!)) { reach.add(n); queue.push(n); }
      }
    }
    return reach;
  }
  // Far enough from every other settlement (a village from a hamlet as from a village), and on dry land.
  private static room(land: Land, seats: Seat[], c: number, size: SeatSize): boolean {
    return this.base[land.cover[c]!] > 0
      && seats.every(s => Terrain.distance(land, s.cell, c) >= Math.max(this.spacing[size], this.spacing[s.size] - 1));
  }
  static score(land: Land, c: number): number {
    const cover = land.cover[c]!, lie = this.lie(land, c);
    if (this.base[cover] <= 0) { return -9; }
    const count = new Map<Cover, number>();
    for (const n of this.around(land, c, 2)) { count.set(land.cover[n]!, (count.get(land.cover[n]!) ?? 0) + 1); }
    const steep = Math.max(...Terrain.neighbours(land, c).map(n => Math.abs(land.heights[n]! - land.heights[c]!)));
    const x = Terrain.x(land, c), y = Terrain.y(land, c);
    const edge = Math.min(x, y, land.width - 1 - x, land.height - 1 - y);
    return this.base[cover] + (lie.includes('river') ? 2.5 : 0) + (lie.includes('confluence') ? 3 : 0)
      + (lie.includes('coast') ? 2.5 : 0) + (lie.includes('harbour') ? 1 : 0) + (lie.includes('lake') ? 2 : 0)
      + Math.min(1.2, 0.3 * (count.get('wood') ?? 0)) + Math.min(1.6, 0.4 * ((count.get('fell') ?? 0)
        + (count.get('peak') ?? 0))) + Math.min(1.5, 0.25 * (count.get('meadow') ?? 0)) - 3 * steep - (edge === 0 ? 1.5 : edge === 1 ? 0.5 : 0);
  }
  // What a settlement on this cell lives by and beside.
  static lie(land: Land, c: number): Lie[] {
    const near = Terrain.neighbours(land, c), rivers = land.water.rivers, lie: Lie[] = [];
    const on = rivers.filter(r => r.cells.includes(c) || near.some(n => r.cells.includes(n)));
    if (on.length) { lie.push('river'); }
    if (on.length > 1) { lie.push('confluence'); }
    const coast = near.filter(n => land.water.sea[n]).length;
    if (coast) { lie.push('coast'); }
    // A landing is sheltered where the sea comes in on one or two sides and the land holds the rest.
    if (coast && coast <= 2 && near.length - coast >= 2) { lie.push('harbour'); }
    if (near.some(n => land.cover[n] === 'lake')) { lie.push('lake'); }
    // What lies within reach: woods to cut, fells to quarry and mine, moor to graze, fen to cut reed in.
    const around = this.around(land, c, 2);
    for (const [cover, said] of [['fell', 'fells'], ['wood', 'woods'], ['meadow', 'meadows'], ['heath', 'heath'],
      ['fen', 'fen']] as const) {
      if (land.cover[c] === cover || around.some(n => land.cover[n] === cover || (cover === 'fell'
        && land.cover[n] === 'peak'))) { lie.push(said); }
    }
    return lie;
  }
  // The cells within a few steps of this one, not counting it.
  static around(land: Land, c: number, reach: number): number[] {
    const out: number[] = [], x = Terrain.x(land, c), y = Terrain.y(land, c);
    for (let dy = -reach; dy <= reach; dy++) {
      for (let dx = -reach; dx <= reach; dx++) {
        const nx = x + dx, ny = y + dy;
        if ((dx || dy) && nx >= 0 && ny >= 0 && nx < land.width && ny < land.height) {
          out.push(Terrain.cell(land, nx, ny));
        }
      }
    }
    return out;
  }
}
