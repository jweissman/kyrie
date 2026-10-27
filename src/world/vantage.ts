import type { Land } from './land/terrain';

// What can be seen from somewhere high (Mission 17's vantage points): each place of a region on the land in sight of
// it, by the lie of the land between, near or far. The eye stands a little above the land where it is (on a crag, a
// cairn, a tree climbed), a place a little above its own (roofs, a tower, a stone on its rise); between them, any cell
// that stands above the line from the one to the other hides it. Near is within a few hours' walk; far, at the edge of
// sight, and lost in haze; past it, only through a spyglass. Worked out from the land as it was made, before anyone
// looks.
export interface Sighting { id: string; cell: number; bearing: string; far: boolean; glass: boolean; distance: number }
export class Vantage {
  static readonly near = 4.5;
  static readonly far = 8;
  static readonly glass = 12;
  // How far above the land the eye stands from what is climbed: the crown of an old tree stands higher over its
  // ground than a cairn over its rise; a crag is high already.
  static readonly heights: Record<string, number> = { oak: 0.2, alders: 0.16, cairn: 0.1, crag: 0.12, tower: 0.24 };
  static readonly eye = 0.1;
  static readonly top = 0.04;
  // Land that stands only a little above the line is rolling country, seen over.
  static readonly rolling = 0.03;
  static readonly bearings = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'];
  // Those of the places that can be seen from a cell, nearest first, as many as are told (most): by eye, or through a
  // spyglass those past the edge of sight (glass).
  static seen(land: Land, from: number, places: { id: string; cell: number }[],
    at: { most?: number; kind?: string; glass?: boolean } = {}): Sighting[] {
    const W = land.width, x0 = from % W, y0 = Math.floor(from / W), most = at.most ?? 6;
    const eye = land.heights[from]! + (this.heights[at.kind ?? ''] ?? this.eye);
    const [beyond, reach] = at.glass ? [this.far, this.glass] : [0, this.far];
    return places.flatMap(p => {
      if (p.cell === from) { return []; }
      const dx = p.cell % W - x0, dy = Math.floor(p.cell / W) - y0, d = Math.hypot(dx, dy);
      if (d <= beyond || d > reach || !this.clear(land, from, p.cell, eye)) { return []; }
      const bearing = this.bearing(dx, dy);
      return [{ id: p.id, cell: p.cell, bearing, far: d > this.near, glass: d > this.far, distance: d }];
    }).sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id)).slice(0, most);
  }
  // Whether the land between stands below the line from the eye to the top of the place seen.
  private static clear(land: Land, from: number, to: number, eye: number): boolean {
    const W = land.width, [x0, y0, x1, y1] = [from % W, Math.floor(from / W), to % W, Math.floor(to / W)];
    const top = land.heights[to]! + this.top, steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
    for (let i = 1; i < steps; i++) {
      const t = i / steps, c = Math.round(y0 + (y1 - y0) * t) * W + Math.round(x0 + (x1 - x0) * t);
      if (c !== from && c !== to && land.heights[c]! > eye + (top - eye) * t + this.rolling) { return false; }
    }
    return true;
  }
  // A direction as it is said, from where the eye stands (north up, as the map has it).
  static bearing(dx: number, dy: number): string {
    return this.bearings[(Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8]!;
  }
  static said(s: Sighting): string {
    return s.glass ? 'far off, through the glass' : s.distance <= 2.5 ? 'not far off' : s.far ? 'a long way off' : 'some way off';
  }
}
