import type { ExitRow, Screen } from './screen-types';

export interface Band { cover: string; label: string; from: number; to: number }
export interface Route { from: ExitRow; to: ExitRow; bands: Band[]; branches: ExitRow[] }

// A road the company is on, as a line across the country: the two places it runs between, the country it crosses in
// order (fen, wood, a ford, fell), as fractions of its length, and the tracks off it. Read from what the company knows
// of the land; a road it has no land for is still its two ends.
export class Routes {
  static readonly names: Record<string, string> = { ',': 'fen', '.': 'open country', w: 'woods', h: 'heath',
    f: 'fell', p: 'high fell', '~': 'shore', o: 'lakeside' };
  static of(screen: Screen): Route | undefined {
    const land = screen.region?.land, cells = land?.roads[screen.place.id];
    const ends = screen.exits.filter(e => e.transition === 'travel' && this.settlement(screen, e.destination.id))
      .sort((a, b) => this.minutes(b) - this.minutes(a)).slice(0, 2);
    if (!cells?.length || ends.length < 2) { return undefined; }
    const [a, b] = this.ordered(screen, ends as [ExitRow, ExitRow], cells);
    return { from: a, to: b, bands: this.bands(screen, cells),
      branches: screen.exits.filter(e => e !== a && e !== b) };
  }
  private static settlement(screen: Screen, id: string): boolean {
    const area = screen.region?.within[id];
    return !!area && screen.region!.areas.some(x => x.id === area && x.kind === 'settlement');
  }
  private static minutes(e: ExitRow): number { return Math.max(0, ...e.acts.map(a => a.minutes ?? 0)); }
  // The end nearer the road's first cell is where it starts.
  private static ordered(screen: Screen, ends: [ExitRow, ExitRow], cells: number[]): [ExitRow, ExitRow] {
    const start = cells[0]!;
    return this.apart(screen, ends[0], start) <= this.apart(screen, ends[1], start) ? ends : [ends[1], ends[0]];
  }
  private static apart(screen: Screen, e: ExitRow, cell: number): number {
    const r = screen.region!, W = r.land!.width, area = r.areas.find(x => x.id === r.within[e.destination.id]);
    return area ? Math.abs(area.x - (cell % W)) + Math.abs(area.y - Math.floor(cell / W)) : 0;
  }
  private static bands(screen: Screen, cells: number[]): Band[] {
    const land = screen.region!.land!, wet = new Set(land.rivers.flat()), out: Band[] = [];
    cells.forEach((cell, i) => {
      const glyph = wet.has(cell) ? 'r' : land.cover[cell] ?? '.', label = glyph === 'r' ? 'a crossing' : this.names[glyph] ?? 'open country';
      const last = out.at(-1), at = i / cells.length;
      if (last && last.cover === glyph) { last.to = (i + 1) / cells.length; } else {
        out.push({ cover: glyph, label, from: at, to: (i + 1) / cells.length });
      }
    });
    return out;
  }
}
