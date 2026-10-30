import { Draw } from './draw';
import { Drainage, type Water } from './drainage';
import { Heights, type Relief } from './heights';

export type Cover = 'sea' | 'lake' | 'fen' | 'meadow' | 'wood' | 'heath' | 'fell' | 'peak';
// How a terrain's land divides by height: the share of its land that is peak, fell and heath from the top down, and
// the share at the bottom low enough to lie wet; and how wet ground must be to be fen, to stay heath, to grow wood.
interface Profile { peak: number; fell: number; heath: number; low: number; fen: number; dry: number; wood: number;
  moisture: number }

// What covers each cell. The sea and the lakes are water; land is peak, fell, heath, wood, fen or open meadow by how
// high it stands among the region's land and how wet it is. Wetness is the region's own (a marsh is wet, a frost
// region dry), with more of it by rivers and standing water and less on the heights. A lone cell unlike all its
// neighbours takes theirs.
export class LandCover {
  static readonly profiles: Record<string, Profile> = {
    mountain: { peak: 0.07, fell: 0.22, heath: 0.12, low: 0.15, fen: 0.72, dry: 0.52, wood: 0.5, moisture: 0.46 },
    frost: { peak: 0.04, fell: 0.16, heath: 0.4, low: 0.15, fen: 0.72, dry: 0.66, wood: 0.6, moisture: 0.4 },
    forest: { peak: 0.01, fell: 0.05, heath: 0.06, low: 0.2, fen: 0.72, dry: 0.5, wood: 0.47, moisture: 0.52 },
    marsh: { peak: 0, fell: 0.02, heath: 0.04, low: 0.5, fen: 0.55, dry: 0.5, wood: 0.56, moisture: 0.62 },
    // A desert: dunes (its heath) over half its land, rock (its fell) and a few mesas above them, stony waste (its
    // meadow) below; palms (its wood) and salt pans or oases (its fen) only where water stands or runs.
    desert: { peak: 0.02, fell: 0.08, heath: 0.45, low: 0.12, fen: 0.62, dry: 0.6, wood: 0.5, moisture: 0.12 },
  };
  static make(key: string, terrain: string, relief: Relief, water: Water): Cover[] {
    const profile = this.profiles[terrain] ?? this.profiles.forest!, lakes = new Set(water.lakes.flat());
    const wet = this.wetness(key, profile, relief, water);
    const land = relief.heights.filter((_, c) => !water.sea[c] && !lakes.has(c)).sort((a, b) => b - a);
    const cut = { peak: profile.peak ? this.at(land, profile.peak) : Infinity,
      fell: this.at(land, profile.peak + profile.fell),
      heath: this.at(land, profile.peak + profile.fell + profile.heath), low: this.at(land, 1 - profile.low) };
    const cover = relief.heights.map((h, c): Cover => {
      if (water.sea[c]) { return 'sea'; }
      if (lakes.has(c)) { return 'lake'; }
      const w = wet[c]!;
      return h >= cut.peak ? 'peak' : h >= cut.fell ? 'fell' : h <= cut.low && w >= profile.fen ? 'fen'
        : h >= cut.heath && w < profile.dry ? 'heath' : w >= profile.wood ? 'wood' : 'meadow';
    });
    return this.settle(cover, relief);
  }
  // The height a share of the land (highest first) stands above.
  private static at(land: number[], share: number): number {
    return land[Math.min(land.length - 1, Math.floor(share * land.length))] ?? 1;
  }
  private static wetness(key: string, profile: Profile, relief: Relief, water: Water): number[] {
    const { width, height, heights } = relief;
    const noise = Heights.noise(new Draw(`${key}:wet`), { width, height }, 3);
    const rivers = new Set(water.rivers.flatMap(r => r.cells)), lakes = new Set(water.lakes.flat());
    return heights.map((h, c) => {
      const near = [c, ...Drainage.neighbours(c, width, height)];
      const river = near.some(n => rivers.has(n)) ? 0.2 : 0;
      const standing = near.some(n => lakes.has(n) || water.sea[n]) ? 0.12 : 0;
      return profile.moisture + river + standing + 0.45 * (noise[c]! - 0.5) - 0.25 * Math.max(0, h - 0.65);
    });
  }
  // A cell unlike every neighbour (but water, peak or fen, which stand alone) takes the cover most of them share.
  private static settle(cover: Cover[], relief: Relief): Cover[] {
    const { width, height } = relief;
    return cover.map((own, c) => {
      if (['sea', 'lake', 'peak', 'fen'].includes(own)) { return own; }
      const around: Cover[] = Drainage.neighbours(c, width, height).map(n => cover[n]!)
        .filter(k => k !== 'sea' && k !== 'lake');
      if (!around.length || around.includes(own)) { return own; }
      const counts = new Map<Cover, number>();
      for (const k of around) { counts.set(k, (counts.get(k) ?? 0) + 1); }
      return [...counts].sort((a, b) => b[1] - a[1])[0]![0];
    });
  }
}
