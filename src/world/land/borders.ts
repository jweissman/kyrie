import { Roads, type Road } from './roads';
import { Terrain, type Land } from './terrain';
import type { Seat } from './settling';

export type Side = 'north' | 'east' | 'south' | 'west';
// Where the land goes on past a region's edge: on each side, the cell nearest that edge which the settlement nearest
// it can best reach, and the old road out to it.
export interface Border { side: Side; seat: number; cell: number; road: Road }

// The roads out of a region. Every side has one, so that whatever lies beyond can be reached from it and it from
// there: where the sea comes to the edge, the road goes to the last of the land on that side.
export class Borders {
  static readonly sides: Side[] = ['north', 'east', 'south', 'west'];
  static readonly steps: Record<Side, [number, number]> = { north: [0, -1], east: [1, 0], south: [0, 1],
    west: [-1, 0] };
  static readonly opposite: Record<Side, Side> = { north: 'south', east: 'west', south: 'north', west: 'east' };
  static make(land: Land, seats: Seat[], built: Set<number>): Border[] {
    return this.sides.flatMap(side => {
      const seat = seats.map((s, i) => ({ i, d: this.depth(land, side, s.cell) })).sort((a, b) => a.d - b.d)[0];
      if (!seat) { return []; }
      const from = seats[seat.i]!.cell;
      for (const cell of this.edge(land, side, from)) {
        const { cells } = Roads.route(land, from, cell, built);
        if (cells.length) { return [{ side, seat: seat.i, cell, road: Roads.road(land, from, cell, cells) }]; }
      }
      return [];
    });
  }
  // How far a cell lies from a side of the land.
  static depth(land: Land, side: Side, c: number): number {
    const x = Terrain.x(land, c), y = Terrain.y(land, c);
    return { north: y, south: land.height - 1 - y, west: x, east: land.width - 1 - x }[side];
  }
  // The dry cells nearest a side, the one nearest the settlement first.
  private static edge(land: Land, side: Side, from: number): number[] {
    const dry = land.cover.map((cover, c) => ({ c, dry: cover !== 'sea' && cover !== 'lake' })).filter(x => x.dry)
      .map(x => x.c);
    const least = Math.min(...dry.map(c => this.depth(land, side, c)));
    return dry.filter(c => this.depth(land, side, c) <= least + 1)
      .sort((a, b) => this.depth(land, side, a) - this.depth(land, side, b)
        || Terrain.distance(land, a, from) - Terrain.distance(land, b, from));
  }
}
