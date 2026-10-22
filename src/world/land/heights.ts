import { Draw } from './draw';

export type Side = 'north' | 'south' | 'east' | 'west';
// The shape of a region's country, before water and cover: how high each cell stands (0 to 1), and which side, if
// any, falls to the sea.
export interface Relief { width: number; height: number; heights: number[]; coast?: Side }

// Heights from layered value noise, shaped by the region's terrain: a mountain region has a range across it, a frost
// region stands high, a marsh region lies low and flat; a coast drops away to the sea on one side.
export class Heights {
  static readonly coastChance: Record<string, number> = { forest: 0.4, marsh: 0.7, mountain: 0.3, frost: 0.5 };
  static make(key: string, terrain: string, size: { width: number; height: number }): Relief {
    const draw = new Draw(`${key}:heights`), { width, height } = size;
    const layers = [[6, 0.55], [3, 0.3], [1.4, 0.15]] as const;
    let heights = new Array<number>(width * height).fill(0);
    for (const [scale, weight] of layers) {
      const layer = this.noise(draw, size, scale);
      heights = heights.map((h, i) => h + weight * layer[i]!);
    }
    heights = this.normal(this.shape(draw, terrain, heights, size));
    const coast = draw.chance(this.coastChance[terrain] ?? 0.4) ? draw.pick(['north', 'south', 'east', 'west'] as const)
      : undefined;
    if (coast) { heights = this.fall(heights, size, coast).map(h => Math.max(0, h)); }
    return { width, height, heights, ...coast ? { coast } : {} };
  }
  // Value noise: random heights on a coarse lattice, smoothly blended between.
  static noise(draw: Draw, size: { width: number; height: number }, scale: number): number[] {
    const lw = Math.ceil(size.width / scale) + 2, lh = Math.ceil(size.height / scale) + 2;
    const lattice = Array.from({ length: lw * lh }, () => draw.next());
    const ox = draw.next(), oy = draw.next();
    return Array.from({ length: size.width * size.height }, (_, i) => {
      const fx = (i % size.width) / scale + ox, fy = Math.floor(i / size.width) / scale + oy;
      const x0 = Math.floor(fx), y0 = Math.floor(fy), tx = this.smooth(fx - x0), ty = this.smooth(fy - y0);
      const top = this.mix(lattice[y0 * lw + x0]!, lattice[y0 * lw + x0 + 1]!, tx);
      const bottom = this.mix(lattice[(y0 + 1) * lw + x0]!, lattice[(y0 + 1) * lw + x0 + 1]!, tx);
      return this.mix(top, bottom, ty);
    });
  }
  private static smooth(t: number): number { return t * t * (3 - 2 * t); }
  private static mix(a: number, b: number, t: number): number { return a + (b - a) * t; }
  // A mountain region has a range across it, uneven along its crest so that it has saddles; a frost region is a
  // high plateau with a lesser range; a marsh region is low and flat; a forest region rolls.
  private static shape(draw: Draw, terrain: string, heights: number[], size: { width: number; height: number }) {
    if (terrain === 'mountain') {
      const ridge = this.range(draw, size, 1);
      return heights.map((h, i) => 0.4 * h + 0.6 * ridge[i]! * (0.65 + 0.35 * h));
    }
    if (terrain === 'frost') {
      const ridge = this.range(draw, size, 0.6);
      return heights.map((h, i) => 0.35 + 0.4 * h + 0.25 * ridge[i]!);
    }
    if (terrain === 'marsh') { return heights.map(h => 0.7 * h ** 1.6); }
    return heights;
  }
  // A ridge along a line across the region: highest on the line, falling away within a few cells of it.
  private static range(draw: Draw, size: { width: number; height: number }, strength: number): number[] {
    const angle = draw.next() * Math.PI, cx = size.width * (0.3 + 0.4 * draw.next());
    const cy = size.height * (0.3 + 0.4 * draw.next()), nx = -Math.sin(angle), ny = Math.cos(angle);
    const reach = 2.2 + draw.next() * 1.6;
    return Array.from({ length: size.width * size.height }, (_, i) => {
      const d = Math.abs((i % size.width - cx) * nx + (Math.floor(i / size.width) - cy) * ny);
      return strength * Math.exp(-((d / reach) ** 2));
    });
  }
  // The land falls toward the coast side, steeply in its last few cells.
  private static fall(heights: number[], size: { width: number; height: number }, side: Side): number[] {
    const reach = Math.max(3, Math.round((side === 'north' || side === 'south' ? size.height : size.width) * 0.24));
    return heights.map((h, i) => {
      const x = i % size.width, y = Math.floor(i / size.width);
      const d = side === 'north' ? y : side === 'south' ? size.height - 1 - y : side === 'west' ? x : size.width - 1 - x;
      const near = Math.max(0, 1 - d / reach);
      return h - 0.7 * near ** 1.6;
    });
  }
  private static normal(heights: number[]): number[] {
    const low = Math.min(...heights), high = Math.max(...heights);
    return heights.map(h => (h - low) / Math.max(1e-9, high - low));
  }
}
