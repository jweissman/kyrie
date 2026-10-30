import { MinHeap } from './min-heap';
import type { Relief } from './heights';

// A river's spring: the brook above where it is a river, up its largest feeder into the hills, where it rises; and its
// fall, the cell of the sea or lake it runs into (none where it leaves the region).
export interface River { cells: number[]; flow: number; outlet: 'sea' | 'lake' | 'edge'; spring: number[]; fall?: number }
// Where the water of a region is: the sea, the cell each cell drains into (-1 where water leaves: the sea, the
// region's edge), how many cells drain through each, the lakes standing in hollows, and the rivers, largest first.
export interface Water { sea: boolean[]; to: number[]; flow: number[]; lakes: number[][]; rivers: River[] }

// Water runs downhill. Every cell drains toward the sea, or in a region without one toward the lowest point of its
// edge, where its river leaves it, by the lowest way out (Barnes' priority flood); a hollow fills until it spills,
// and a deep one is a lake. Where enough country drains through a
// cell, a river runs: traced from each mouth up its largest branch, its other branches tributaries.
export class Drainage {
  static readonly seaLevel = 0.14;
  static make(relief: Relief, terrain: string): Water {
    const sea = this.sea(relief), { to, filled, order } = this.flood(relief, sea);
    const flow = new Array<number>(relief.heights.length).fill(0);
    for (const c of [...order].reverse()) {
      if (!sea[c]) { flow[c]! += 1; }
      if (to[c]! >= 0) { flow[to[c]!]! += flow[c]!; }
    }
    const lakes = this.lakes(relief, filled, sea, terrain === 'marsh' ? 0.015 : 0.03);
    const wet = new Set(lakes.flat());
    return { sea, to, flow, lakes, rivers: this.rivers(relief, { sea, to, flow, wet }) };
  }
  static neighbours(c: number, width: number, height: number): number[] {
    const x = c % width, y = Math.floor(c / width), out: number[] = [];
    if (y > 0) { out.push(c - width); }
    if (x < width - 1) { out.push(c + 1); }
    if (y < height - 1) { out.push(c + width); }
    if (x > 0) { out.push(c - 1); }
    return out;
  }
  static edge(c: number, width: number, height: number): boolean {
    const x = c % width, y = Math.floor(c / width);
    return x === 0 || y === 0 || x === width - 1 || y === height - 1;
  }
  // The sea: low cells reached from the coast side.
  private static sea(relief: Relief): boolean[] {
    const { width, height, heights, coast } = relief, sea = new Array<boolean>(heights.length).fill(false);
    if (!coast) { return sea; }
    const shore = heights.map((_, c) => c).filter(c => {
      const x = c % width, y = Math.floor(c / width);
      return coast === 'north' ? y === 0 : coast === 'south' ? y === height - 1 : coast === 'west' ? x === 0
        : x === width - 1;
    });
    const queue = shore.filter(c => heights[c]! < this.seaLevel);
    for (const c of queue) { sea[c] = true; }
    for (let i = 0; i < queue.length; i++) {
      for (const n of this.neighbours(queue[i]!, width, height)) {
        if (!sea[n] && heights[n]! < this.seaLevel) { sea[n] = true; queue.push(n); }
      }
    }
    return sea;
  }
  private static flood(relief: Relief, sea: boolean[]) {
    const { width, height, heights } = relief, n = heights.length;
    const to = new Array<number>(n).fill(-1), filled = [...heights], seen = new Array<boolean>(n).fill(false);
    const heap = new MinHeap(), order: number[] = [];
    const outlets = sea.some(Boolean) ? heights.map((_, c) => c).filter(c => sea[c])
      : [heights.map((_, c) => c).filter(c => this.edge(c, width, height))
        .reduce((low, c) => heights[c]! < heights[low]! ? c : low)];
    for (const c of outlets) { seen[c] = true; heap.push(c, sea[c] ? -1 : heights[c]!); }
    for (let top = heap.pop(); top; top = heap.pop()) {
      order.push(top.cell);
      for (const next of this.neighbours(top.cell, width, height)) {
        if (seen[next]) { continue; }
        seen[next] = true;
        filled[next] = Math.max(heights[next]!, filled[top.cell]! + 1e-5);
        to[next] = top.cell;
        heap.push(next, filled[next]!);
      }
    }
    return { to, filled, order };
  }
  // Hollows deep enough to hold standing water: in each, the water stands over its deepest cells (no more than a
  // few); the rest of a hollow is low ground the river crosses. The deepest two or three are lakes.
  private static lakes(relief: Relief, filled: number[], sea: boolean[], depth: number): number[][] {
    const { width, height, heights } = relief, hollow = heights.map((h, c) => !sea[c] && filled[c]! - h > depth / 3);
    const seen = new Set<number>(), found: { cells: number[]; deepest: number }[] = [];
    for (let c = 0; c < heights.length; c++) {
      if (!hollow[c] || seen.has(c)) { continue; }
      const cells = [c];
      seen.add(c);
      for (let i = 0; i < cells.length; i++) {
        for (const n of this.neighbours(cells[i]!, width, height)) {
          if (hollow[n] && !seen.has(n)) { seen.add(n); cells.push(n); }
        }
      }
      const deep = new Map(cells.map(x => [x, filled[x]! - heights[x]!])), deepest = Math.max(...deep.values());
      if (deepest < depth) { continue; }
      const water = this.pool(cells.filter(x => deep.get(x)! >= deepest * 0.45)
        .sort((a, b) => deep.get(b)! - deep.get(a)! || a - b),
        { width, height }, 8);
      found.push({ cells: water, deepest });
    }
    return found.sort((a, b) => b.deepest - a.deepest).slice(0, 3).map(l => l.cells.sort((a, b) => a - b));
  }
  // The deepest cell of a hollow and the deep cells joined to it, deepest first, up to a limit.
  private static pool(deepest: number[], size: { width: number; height: number }, limit: number): number[] {
    const deep = new Set(deepest), water = [deepest[0]!];
    for (let i = 0; i < water.length && water.length < limit; i++) {
      for (const n of this.neighbours(water[i]!, size.width, size.height)) {
        if (deep.has(n) && !water.includes(n) && water.length < limit) { water.push(n); }
      }
    }
    return water;
  }
  private static rivers(relief: Relief, water: { sea: boolean[]; to: number[]; flow: number[]; wet: Set<number> }) {
    const { sea, to, flow, wet } = water, land = sea.filter(s => !s).length;
    const threshold = Math.max(5, Math.round(land * 0.035));
    const running = to.map((_, c) => !sea[c] && !wet.has(c) && flow[c]! >= threshold);
    const upstream = new Map<number, number[]>();
    for (let c = 0; c < to.length; c++) {
      if (running[c] && to[c]! >= 0) { upstream.set(to[c]!, [...upstream.get(to[c]!) ?? [], c]); }
    }
    const mouths = to.map((_, c) => c).filter(c => running[c] && (to[c]! < 0 || !running[to[c]!]))
      .sort((a, b) => flow[b]! - flow[a]! || a - b);
    const rivers: River[] = [], queue = [...mouths];
    for (let i = 0; i < queue.length; i++) {
      const cells = [queue[i]!];
      for (let c = queue[i]!; ;) {
        const branches = (upstream.get(c) ?? []).sort((a, b) => flow[b]! - flow[a]! || a - b);
        if (!branches.length) { break; }
        queue.push(...branches.slice(1));
        c = branches[0]!; cells.push(c);
      }
      const mouth = queue[i]!, below = to[mouth]!;
      const outlet = below < 0 ? (sea[mouth] ? 'sea' : 'edge') : sea[below] ? 'sea' : wet.has(below) ? 'lake' : 'edge';
      if (cells.length >= 3) {
        const spring = this.spring(relief, water, cells.at(-1)!);
        rivers.push({ cells: cells.reverse(), flow: flow[mouth]!, outlet, spring, ...outlet !== 'edge' && below >= 0 ? { fall: below } : {} });
      }
    }
    return rivers.sort((a, b) => b.flow - a.flow);
  }
  // Up from a river's head by the feeder that brings it the most water, until the ground is high (the upper third of
  // the region's land) or there is no going higher: a river had seemed to rise in the middle of a town, or a meadow
  // (the owner, OWN-49). Drawn only: the river itself, its crossings and the country it names, are as they were.
  private static spring(relief: Relief, water: { sea: boolean[]; to: number[]; flow: number[]; wet: Set<number> },
    head: number): number[] {
    const { heights, width, height } = relief, { sea, to, flow, wet } = water, out: number[] = [];
    const land = heights.filter((_, c) => !sea[c]).sort((a, b) => a - b);
    const high = land[Math.floor(land.length * 0.67)] ?? 1;
    for (let c = head; out.length < 8 && heights[c]! < high;) {
      const up = this.neighbours(c, width, height).filter(n => to[n] === c && !wet.has(n) && !sea[n])
        .sort((a, b) => flow[b]! - flow[a]! || heights[b]! - heights[a]! || a - b)[0];
      if (up === undefined) { break; }
      out.push(up); c = up;
    }
    return out.reverse();
  }
}
