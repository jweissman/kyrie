import { Borders, type Side } from './borders';
import { Roads, type Road } from './roads';
import { Terrain, type Land } from './terrain';
import type { Cover } from './land-cover';
import type { Seat } from './settling';

// Where a province's way in stands: a province is an adventure installed as part of the country (Mission 18's Gate B),
// not a country beyond a march; its way in is a place a little in from the side its folk have always said it lies
// on, on land of the kind it is (fells for a dale under a ridge, fen for a delta), with a road to it from the nearest
// town that can reach it. Found as a march's road is (Borders), but inland, and clear of the towns, the marches and
// the other provinces' ways in.
export interface Gate { id: string; side: Side; seat: number; cell: number; road: Road }
export interface Wanted { id: string; side: Side; covers: Cover[] }
interface Around { seats: Seat[]; built: Set<number>; taken: number[] }
export class Gates {
  // How far in from its side a way in may lie: never on the edge itself, where the march-stone is.
  static readonly depths = [2, 3, 4, 5, 6];
  // around: the country's settlements, the cells its roads cross, and the cells already taken (marches, sites).
  static make(land: Land, around: Around, wanted: Wanted[]): Gate[] {
    const gates: Gate[] = [];
    for (const w of wanted) {
      const gate = this.one(land, { ...around, taken: [...around.taken, ...gates.map(g => g.cell)] }, w);
      if (gate) { gates.push(gate); }
    }
    return gates;
  }
  private static one(land: Land, at: Around, w: Wanted): Gate | undefined {
    const order = at.seats.map((s, i) => ({ i, d: Borders.depth(land, w.side, s.cell) })).sort((a, b) => a.d - b.d);
    for (const covers of [w.covers, ['meadow', 'heath', 'wood', 'fell', 'fen', 'peak'] as Cover[]]) {
      for (const cell of this.cells(land, w.side, covers, [...at.seats.map(s => s.cell), ...at.taken])) {
        for (const { i } of order) {
          const from = at.seats[i]!.cell, { cells } = Roads.route(land, from, cell, at.built);
          if (cells.length) {
            return { id: w.id, side: w.side, seat: i, cell, road: Roads.road(land, from, cell, cells) };
          }
        }
      }
    }
    return undefined;
  }
  // Cells of the kinds wanted, a few in from the side, clear of what is there: the shallowest first, then the kind
  // most wanted, then nearest the middle of the side.
  private static cells(land: Land, side: Side, covers: Cover[], clear: number[]): number[] {
    const middle = side === 'north' || side === 'south' ? (land.width - 1) / 2 : (land.height - 1) / 2;
    return land.cover.map((cover, c) => ({ c, rank: covers.indexOf(cover), depth: Borders.depth(land, side, c) }))
      .filter(x => x.rank >= 0 && this.depths.includes(x.depth)
        && clear.every(o => Terrain.distance(land, o, x.c) >= 2))
      .sort((a, b) => a.depth - b.depth || a.rank - b.rank
        || this.off(land, side, a.c, middle) - this.off(land, side, b.c, middle))
      .map(x => x.c);
  }
  private static off(land: Land, side: Side, c: number, middle: number): number {
    return Math.abs((side === 'north' || side === 'south' ? Terrain.x(land, c) : Terrain.y(land, c)) - middle);
  }
}
