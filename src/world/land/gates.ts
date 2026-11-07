import { Borders, type Side } from './borders';
import { Roads, type Road } from './roads';
import { Terrain, type Land } from './terrain';
import type { Cover } from './land-cover';
import type { Seat } from './settling';
import { Firth } from './firth';

// Where a province's way in stands: a province is an adventure installed as part of the country (Mission 18's Gate B),
// not a country beyond a march; its way in is a place a little in from the side its folk have always said it lies
// on, on land of the kind it is (fells for a dale under a ridge, fen for a delta), with a road to it from the nearest
// town that can reach it. Found as a march's road is (Borders), but inland, and clear of the towns, the marches and
// the other provinces' ways in. A harbour's stands beside the sea; where the country has no coast on its side, at the
// head of a firth cut in from that side over open land (firth: its cells, let in as sea once the ways in are found).
export interface Gate { id: string; side: Side; seat: number; cell: number; road: Road; firth?: number[] }
// shore: a harbour's way in, which stands beside the sea (Tolleth, M19-101).
export interface Wanted { id: string; side: Side; covers: Cover[]; shore?: boolean }
// keep: the cells no firth may be cut over (whatever stands or runs there: towns, sites, roads, rivers, marches).
interface Around { seats: Seat[]; built: Set<number>; taken: number[]; keep?: number[] }
export class Gates {
  // How far in from its side a way in may lie: never on the edge itself, where the march-stone is.
  static readonly depths = [2, 3, 4, 5, 6];
  // around: the country's settlements, the cells its roads cross, and the cells already taken (marches, sites).
  static make(land: Land, around: Around, wanted: Wanted[]): Gate[] {
    const gates: Gate[] = [];
    for (const w of wanted) {
      const gate = this.one(land, { ...around, taken: [...around.taken, ...gates.map(g => g.cell)],
        keep: [...around.keep ?? [], ...gates.flatMap(g => [g.cell, ...g.road.cells, ...g.firth ?? []])] }, w);
      if (gate) { gates.push(gate); }
    }
    return gates;
  }
  private static one(land: Land, at: Around, w: Wanted): Gate | undefined {
    const order = at.seats.map((s, i) => ({ i, d: Borders.depth(land, w.side, s.cell) })).sort((a, b) => a.d - b.d);
    const any: Cover[] = ['meadow', 'heath', 'wood', 'fell', 'fen', 'peak'], keep = new Set(at.keep ?? []);
    // One wanted beside the sea is looked for there first, on its own kinds of land and then on any; then anywhere.
    const tries: [Cover[], boolean][] = [...w.shore ? [[w.covers, true], [any, true]] as [Cover[], boolean][] : [],
      [w.covers, false], [any, false]];
    for (const [covers, shore] of tries) {
      const clear = [...at.seats.map(s => s.cell), ...at.taken];
      for (const cell of this.cells(land, w.side, { covers, shore, keep }, clear)) {
        const firth = shore ? this.firth(land, cell, w.side, keep) : undefined;
        for (const { i } of order) {
          const from = at.seats[i]!.cell, { cells } = Roads.route(land, from, cell, at.built);
          // Its road does not run where the firth will be.
          if (cells.length && !firth?.some(c => cells.includes(c))) {
            return { id: w.id, side: w.side, seat: i, cell, road: Roads.road(land, from, cell, cells),
              ...firth?.length ? { firth } : {} };
          }
        }
      }
    }
    return undefined;
  }
  // The cells a firth to a harbour's way in must let the sea over: none beside the sea already.
  private static firth(land: Land, cell: number, side: Side, keep: Set<number>): number[] | undefined {
    if (this.shore(land, cell)) { return undefined; }
    return Firth.clear(land, cell, side, keep)?.filter(c => land.cover[c] !== 'sea');
  }
  // Cells of the kinds wanted, a few in from the side, clear of what is there: the shallowest first, then the kind
  // most wanted, then nearest the middle of the side. One wanted beside the sea may be on any cell but the edge that
  // is beside it, or that a firth can be cut to cleanly from the side (the shallowest, the shortest firth).
  private static cells(land: Land, side: Side, { covers, shore, keep }: { covers: Cover[]; shore: boolean;
    keep: Set<number> }, clear: number[]): number[] {
    const middle = side === 'north' || side === 'south' ? (land.width - 1) / 2 : (land.height - 1) / 2;
    return land.cover.map((cover, c) => ({ c, rank: covers.indexOf(cover), depth: Borders.depth(land, side, c) }))
      .filter(x => x.rank >= 0 && (shore ? x.depth >= 1 : this.depths.includes(x.depth))
        && clear.every(o => Terrain.distance(land, o, x.c) >= 2)
        && (!shore || this.shore(land, x.c) || !!Firth.clear(land, x.c, side, keep)))
      .sort((a, b) => a.depth - b.depth || a.rank - b.rank
        || this.off(land, side, a.c, middle) - this.off(land, side, b.c, middle))
      .map(x => x.c);
  }
  static shore(land: Land, c: number): boolean {
    return Terrain.neighbours(land, c).some(n => land.cover[n] === 'sea');
  }
  private static off(land: Land, side: Side, c: number, middle: number): number {
    return Math.abs((side === 'north' || side === 'south' ? Terrain.x(land, c) : Terrain.y(land, c)) - middle);
  }
}
