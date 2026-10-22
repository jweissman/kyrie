import { Drainage, type Water } from './drainage';
import { Heights, type Side } from './heights';
import { LandCover, type Cover } from './land-cover';

// A region's country as cells: how high each stands, what covers it, and where its water runs. A cell is about three
// miles across, an hour's walk by road.
export interface Land {
  width: number; height: number; heights: number[]; cover: Cover[]; water: Water; coast?: Side;
}

export class Terrain {
  static readonly size = { width: 20, height: 14 };
  static make(key: string, terrain: string, size = this.size): Land {
    const relief = Heights.make(key, terrain, size), water = Drainage.make(relief, terrain);
    return { width: relief.width, height: relief.height, heights: relief.heights,
      cover: LandCover.make(key, terrain, relief, water), water, ...relief.coast ? { coast: relief.coast } : {} };
  }
  static x(land: Land, c: number): number { return c % land.width; }
  static y(land: Land, c: number): number { return Math.floor(c / land.width); }
  static cell(land: Land, x: number, y: number): number { return y * land.width + x; }
  static neighbours(land: Land, c: number): number[] { return Drainage.neighbours(c, land.width, land.height); }
  static distance(land: Land, a: number, b: number): number {
    return Math.abs(this.x(land, a) - this.x(land, b)) + Math.abs(this.y(land, a) - this.y(land, b));
  }
  static river(land: Land, c: number): number | undefined {
    const i = land.water.rivers.findIndex(r => r.cells.includes(c));
    return i < 0 ? undefined : i;
  }
}
