import { Terrain, type Land } from './terrain';
import type { Cover } from './land-cover';
import type { Road } from './roads';
import type { Seat } from './settling';

export type Wild = 'wood' | 'fen' | 'heath' | 'fell';
// A stretch of wild country: a wood, a fen, a moor or the fells, as one place with parts a company walks between.
// Its first part is the edge nearest where people come from; the others lie further in.
export interface Zone { id: string; wild: Wild; cells: number[]; parts: number[][]; centres: number[] }

// The wild country of a region: each run of wood, fen, heath or fell big enough to get lost in (settlements stand in
// clearings and are not part of it). The largest few are kept, each divided into parts of a few cells: the edge
// nearest a road or settlement, and the parts beyond it, furthest first.
export class Zones {
  static readonly kinds: Record<Wild, Cover[]> = { wood: ['wood'], fen: ['fen'], heath: ['heath'], fell: ['fell', 'peak'] };
  static readonly most = 6;
  static readonly least = 4;
  static make(land: Land, seats: Seat[], roads: Road[]): Zone[] {
    const settled = new Set(seats.map(s => s.cell)), seen = new Set<number>(), found: Omit<Zone, 'id'>[] = [];
    const reached = new Set([...settled, ...roads.flatMap(r => r.cells)]);
    for (let c = 0; c < land.cover.length; c++) {
      const wild = this.wild(land.cover[c]!);
      if (!wild || seen.has(c) || settled.has(c)) { continue; }
      const cells = this.spread(land, c, wild, { seen, settled });
      if (cells.length >= this.least) { found.push(this.divide(land, wild, cells, reached)); }
    }
    return found.sort((a, b) => b.cells.length - a.cells.length || a.cells[0]! - b.cells[0]!).slice(0, this.most)
      .map((z, i) => ({ id: `z${i + 1}`, ...z }));
  }
  static wild(cover: Cover): Wild | undefined {
    return (Object.keys(this.kinds) as Wild[]).find(w => this.kinds[w].includes(cover));
  }
  private static spread(land: Land, start: number, wild: Wild, at: { seen: Set<number>; settled: Set<number> }) {
    const cells = [start];
    at.seen.add(start);
    for (let i = 0; i < cells.length; i++) {
      for (const n of Terrain.neighbours(land, cells[i]!)) {
        if (!at.seen.has(n) && !at.settled.has(n) && this.wild(land.cover[n]!) === wild) {
          at.seen.add(n); cells.push(n);
        }
      }
    }
    return cells.sort((a, b) => a - b);
  }
  // Parts of about seven cells: the first centred where the zone is nearest a road or settlement, each next as far
  // as can be from those before it; every cell belongs to the part whose centre it is nearest by way of the zone.
  private static divide(land: Land, wild: Wild, cells: number[], reached: Set<number>): Omit<Zone, 'id'> {
    const count = Math.max(1, Math.min(3, Math.round(cells.length / 7)));
    const entry = [...cells].sort((a, b) => this.reach(land, a, reached) - this.reach(land, b, reached) || a - b)[0]!;
    const centres = [entry];
    while (centres.length < count) {
      const far = this.distances(land, cells, centres);
      centres.push([...cells].sort((a, b) => far.get(b)! - far.get(a)! || a - b)[0]!);
    }
    const parts = centres.map(() => [] as number[]), owner = this.owners(land, cells, centres);
    for (const c of cells) { parts[owner.get(c)!]!.push(c); }
    return { wild, cells, parts, centres };
  }
  private static reach(land: Land, c: number, reached: Set<number>): number {
    return Math.min(99, ...[...reached].map(r => Terrain.distance(land, r, c)));
  }
  // How many steps each cell is from the nearest of the centres, walking within the zone.
  private static distances(land: Land, cells: number[], centres: number[]): Map<number, number> {
    return new Map([...this.walk(land, cells, centres)].map(([c, [d]]) => [c, d]));
  }
  private static owners(land: Land, cells: number[], centres: number[]): Map<number, number> {
    return new Map([...this.walk(land, cells, centres)].map(([c, [, owner]]) => [c, owner]));
  }
  private static walk(land: Land, cells: number[], centres: number[]): Map<number, [number, number]> {
    const inside = new Set(cells), out = new Map<number, [number, number]>(centres.map((c, i) => [c, [0, i]]));
    const queue = [...centres];
    for (let i = 0; i < queue.length; i++) {
      const [d, owner] = out.get(queue[i]!)!;
      for (const n of Terrain.neighbours(land, queue[i]!)) {
        if (inside.has(n) && !out.has(n)) { out.set(n, [d + 1, owner]); queue.push(n); }
      }
    }
    return out;
  }
}
