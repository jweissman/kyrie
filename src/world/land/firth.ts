import { Borders, type Side } from './borders';
import { Terrain, type Land } from './terrain';

// An arm of the sea run into a country from one side to a cell inside it, where the country's land has no coast of
// its own on that side: Tolleth, the Dorothea's harbour, stands at the head of one cut in from the first country's
// eastern edge, where the Eastern Ocean is (see WorldShape). The first country's land is its seed's and is never
// redrawn for the ocean (its descents and traces play on it), so the sea comes in by as few cells as will reach the
// harbour, and only over open land: never where anything stands or runs (a town, a site, a road, a river, a
// march-stone), so that nothing drawn on the land before it moves.
export class Firth {
  // The cells from beside a cell straight out to the edge of a side, nearest first.
  static line(land: Land, cell: number, side: Side): number[] {
    const [dx, dy] = Borders.steps[side], out: number[] = [];
    let x = Terrain.x(land, cell) + dx, y = Terrain.y(land, cell) + dy;
    while (x >= 0 && y >= 0 && x < land.width && y < land.height) {
      out.push(Terrain.cell(land, x, y));
      x += dx; y += dy;
    }
    return out;
  }
  // The line the sea would come in by to a cell, if it is clear of everything kept: open land or sea all the way.
  static clear(land: Land, cell: number, side: Side, keep: Set<number>): number[] | undefined {
    const line = this.line(land, cell, side);
    return line.length && line.every(c => !keep.has(c) && land.cover[c] !== 'lake') ? line : undefined;
  }
  // The sea let in over a firth's cells: they are sea from then on, to the land's cover and its water.
  static carve(land: Land, cells: number[]): void {
    for (const c of cells) { land.cover[c] = 'sea'; land.water.sea[c] = true; }
  }
}
