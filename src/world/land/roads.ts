import { MinHeap } from './min-heap';
import { Terrain, type Land } from './terrain';
import type { Cover } from './land-cover';
import type { Seat } from './settling';

// Where a road crosses a river: a ford, or a bridge where the river is too big to wade.
export interface Crossing { cell: number; river: number; kind: 'ford' | 'bridge' }
// A road between two settlements: the cells it runs through, how long it takes on foot, where it crosses rivers, and
// the highest cell it climbs to over the fells, if it does.
export interface Road { from: number; to: number; cells: number[]; hours: number; crossings: Crossing[]; pass?: number }

// The roads people have made: between every settlement and the next by the easiest going (open ground, not too
// steep, rivers crossed where they must be), joined into one network the way a region's roads grow, from the town
// outward, each new road following the old ones where it can; and one more where it saves a long way round.
export class Roads {
  // How hard each kind of ground is to build a road over, and how long a made road across it takes to walk.
  static readonly cost: Record<Cover, number> = { meadow: 1, heath: 1.2, wood: 1.5, fen: 2.2, fell: 2, peak: 4,
    lake: Infinity, sea: Infinity };
  static readonly hours: Record<Cover, number> = { meadow: 1, heath: 1.1, wood: 1.2, fen: 1.4, fell: 1.6, peak: 2.5,
    lake: Infinity, sea: Infinity };
  static make(land: Land, seats: Seat[]): Road[] {
    if (seats.length < 2) { return []; }
    const direct = seats.map(a => seats.map(b => a === b ? 0 : this.route(land, a.cell, b.cell, new Set()).cost));
    const joined = [0], links: [number, number][] = [];
    while (joined.length < seats.length) {
      let best: [number, number] | undefined;
      for (const i of joined) {
        for (let j = 0; j < seats.length; j++) {
          if (!joined.includes(j) && (!best || direct[i]![j]! < direct[best[0]]![best[1]]!)) { best = [i, j]; }
        }
      }
      links.push(best!); joined.push(best![1]);
    }
    const shortcut = this.shortcut(direct, links);
    if (shortcut) { links.push(shortcut); }
    const built = new Set<number>();
    return links.map(([i, j]) => {
      const { cells } = this.route(land, seats[i]!.cell, seats[j]!.cell, built);
      for (const c of cells) { built.add(c); }
      return this.road(land, seats[i]!.cell, seats[j]!.cell, cells);
    });
  }
  // The pair of settlements the network joins only the long way round, when a road of their own would save half of it.
  private static shortcut(direct: number[][], links: [number, number][]): [number, number] | undefined {
    const n = direct.length, far = direct.map((_, i) => direct.map((_, j) => i === j ? 0 : Infinity));
    for (const [i, j] of links) { far[i]![j] = far[j]![i] = direct[i]![j]!; }
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) { far[i]![j] = Math.min(far[i]![j]!, far[i]![k]! + far[k]![j]!); }
      }
    }
    let best: [number, number] | undefined, saving = 1.5;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const ratio = far[i]![j]! / direct[i]![j]!;
        if (ratio > saving) { saving = ratio; best = [i, j]; }
      }
    }
    return best;
  }
  // The easiest way between two cells (A*): open ground is quick, steep ground and river crossings slow, water
  // impassable; ground a road already crosses is quicker still.
  static route(land: Land, from: number, to: number, built: Set<number>): { cells: number[]; cost: number } {
    const cost = new Map<number, number>([[from, 0]]), came = new Map<number, number>(), heap = new MinHeap();
    heap.push(from, 0);
    for (let top = heap.pop(); top; top = heap.pop()) {
      const c = top.cell;
      if (c === to) { break; }
      for (const n of Terrain.neighbours(land, c)) {
        const step = this.step(land, c, n, built);
        if (!Number.isFinite(step)) { continue; }
        const next = cost.get(c)! + step;
        if (next < (cost.get(n) ?? Infinity)) {
          cost.set(n, next); came.set(n, c);
          heap.push(n, next + Terrain.distance(land, n, to) * 0.6);
        }
      }
    }
    const cells = [to];
    while (cells[0] !== from && came.has(cells[0]!)) { cells.unshift(came.get(cells[0]!)!); }
    return { cells: cells[0] === from ? cells : [], cost: cost.get(to) ?? Infinity };
  }
  private static step(land: Land, from: number, to: number, built: Set<number>): number {
    const hours = this.cost[land.cover[to]!], climb = Math.abs(land.heights[to]! - land.heights[from]!) * 4;
    const river = Terrain.river(land, to) !== undefined && Terrain.river(land, from) === undefined ? 0.8 : 0;
    return (hours + climb + river) * (built.has(to) ? 0.6 : 1);
  }
  static road(land: Land, from: number, to: number, cells: number[]): Road {
    const crossings: Crossing[] = [], biggest = Math.max(1, ...land.water.rivers.map(r => r.flow));
    for (let i = 1; i < cells.length - 1; i++) {
      const river = Terrain.river(land, cells[i]!);
      if (river === undefined || Terrain.river(land, cells[i - 1]!) === river) { continue; }
      const flow = land.water.flow[cells[i]!]!;
      crossings.push({ cell: cells[i]!, river, kind: flow > biggest * 0.5 ? 'bridge' : 'ford' });
    }
    const high = cells.filter(c => ['fell', 'peak'].includes(land.cover[c]!))
      .sort((a, b) => land.heights[b]! - land.heights[a]!)[0];
    const hours = cells.slice(1).reduce((sum, c) => sum + this.hours[land.cover[c]!], 0) + crossings.length * 0.5;
    return { from, to, cells, hours: Math.round(hours * 2) / 2, crossings,
      ...high !== undefined ? { pass: high } : {} };
  }
}
