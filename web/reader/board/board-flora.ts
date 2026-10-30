import type { BoardGround } from './board-ground';
import { Noise } from './noise';
import type { PathReach } from './path-reach';
import { Scatter, type Spot } from './scatter';

// Where the country's growing things and furniture stand, hex by hex, by its land: woods in clumps of broadleaf and
// fir, heather and boulders on the fells, reeds and pools in the fens, fields and hedges about the towns, bushes and
// gorse, walls across the open hill, a farmstead by a road, sheep on the grazing, small mountains on the heights.
// Nothing stands on a river, a road, or the middle of a town.
export class BoardFlora {
  readonly spots: Record<string,
    Spot[]> = { broadleaf: [], fir: [], rock: [], heather: [], reed: [], strip: [], peak: [],
    bush: [], sheep: [], wall: [], hedge: [], farm: [], pool: [] };
  private static readonly greens = ['#3b6640', '#2f5534', '#46703f', '#36593a', '#4d6b35'];
  private static readonly fields = ['#7b7a44', '#5c6935', '#8b7c4c', '#6d7a3e', '#857245'];
  private readonly towns: Set<number>;
  private readonly roads: Set<number>;
  constructor(private readonly ground: BoardGround, private readonly keep: { rivers: PathReach; roads: PathReach },
    towns: number[]) {
    this.towns = new Set(towns); this.roads = new Set(Object.values(ground.land.roads).flat());
    for (const c of ground.grid.cells) { this.grow(c); }
  }
  private grow(c: number): void {
    const cover = this.ground.cover(c),
      nearTown = [...this.towns].some(t => this.ground.grid.centres[t]!.distanceTo(this.ground.grid.centres[c]!) < 1.6);
    if (cover === 'w') { this.wood(c); }
    if (cover === '.') {
      if (nearTown) { this.many(c, ['strip', 9, 0.34], i => [1, BoardFlora.fields[i % 5]!]); }
      if (nearTown && !this.towns.has(c)) { this.many(c, ['hedge', 3, 0.28],
        i => [0.8 + Noise.hash(c, i) * 0.5, '#2f4a27']); }
      if (!this.towns.has(c) && this.roads.has(c) && Noise.hash(c, 110) < 0.55) { this.many(c, ['farm', 1, 0.24],
        () => [1, '#ffffff']); }
      this.many(c, ['broadleaf', 3, 0.4],
        i => Noise.hash(c, i + 40) < 0.55 ? [0.75 + Noise.hash(c, i) * 0.4, '#456d40'] : undefined);
    }
    if (cover === 'h' || cover === '.') {
      this.many(c, ['bush', 4, 0.4], i => Noise.hash(c, i + 60) < 0.6
        ? [0.7 + Noise.hash(c, i) * 0.6, cover === 'h' && Noise.hash(c, i) < 0.5 ? '#7d7a3a' : '#43602f'] : undefined);
    }
    if (cover === 'h') { this.many(c, ['heather', 3, 0.4], i => [0.6 + Noise.hash(c, i) * 0.3, '#6a5a3e']); }
    if (cover === 'f') {
      this.many(c, ['heather', 7, 0.4],
        i => [(0.8 + Noise.hash(c, i) * 0.7) * 0.65, Noise.hash(c, i + 2) > 0.5 ? '#5e4752' : '#6b5442']);
      this.many(c, ['rock', 3, 0.4], i => [(0.6 + Noise.hash(c, i) * 0.9) * 0.5, '#85827b']);
    }
    if ((cover === 'f' || cover === 'h') && Noise.hash(c, 95) < 0.5) { this.many(c, ['wall', 1, 0.16],
      () => [0.8 + Noise.hash(c, 96) * 0.5, '#8a8577']); }
    if (cover === 'p') {
      this.many(c, ['peak', 2 + Math.floor(Noise.hash(c, 1) * 2), 0.3],
        i => [0.5 + Noise.hash(c, i + 3) * 0.3 - i * 0.08, '#ffffff']);
      this.many(c, ['rock', 5, 0.4], i => [(0.9 + Noise.hash(c, i) * 1.1) * 0.5, '#8f8b82']);
    }
    if (cover === ',') {
      this.many(c, ['reed', 12, 0.4],
        i => [0.7 + Noise.hash(c, i) * 0.6, Noise.hash(c, i + 1) > 0.5 ? '#8d7c49' : '#6f6a3f']);
      this.many(c, ['pool', 3, 0.32], i => [0.6 + Noise.hash(c, i) * 0.7, '#1f3a48']);
    }
    if ((cover === 'f' || cover === 'h' || cover === '.') && !this.towns.has(c) && Noise.hash(c,
      90) < 0.45) { this.flock(c); }
  }
  private wood(c: number): void {
    const upland = this.ground.levels[c]! > 0.25;
    for (let g = 0; g < 4; g++) {
      const [gx, gz] = this.around(c, g + 90, 0.28);
      for (let k = 0; k < 9; k++) {
        const fir = Noise.hash(c + g, k) < (upland ? 0.7 : 0.25), at = this.around(c, g * 20 + k, 0.2, [gx, gz]);
        this.put(fir ? 'fir' : 'broadleaf', c, at, [(0.8 + Noise.hash(c, k + 9 * g) * 0.55) * 1.1,
          BoardFlora.greens[Math.floor(Noise.hash(c + k, g) * 5)]!]);
      }
    }
    this.many(c, ['bush', 6, 0.4], i => [0.6 + Noise.hash(c, i) * 0.4, '#2f4a26']);
  }
  private flock(c: number): void {
    const [x, z] = this.around(c, 90, 0.24);
    for (let k = 0; k < 3 + Math.floor(Noise.hash(c, 91) * 4); k++) {
      const a = k * 2.1 + Noise.hash(c, k), r = 0.04 + Noise.hash(k, c) * 0.06;
      this.put('sheep', c, [x + Math.cos(a) * r, z + Math.sin(a) * r], [1, '#ffffff']);
    }
  }
  private many(c: number, [kind, n, spread]: [string, number, number],
    what: (i: number) => [number, string] | undefined): void {
    for (let i = 0; i < n; i++) { const w = what(i); if (w) { this.put(kind, c,
      this.around(c, i + kind.length * 13, spread), w); } }
  }
  private around(c: number, k: number, spread: number, centre?: [number, number]): [number, number] {
    const p = this.ground.grid.centres[c]!, a = Noise.hash(c * 3 + k, 11) * 6.28,
      r = Math.sqrt(Noise.hash(c * 5 + k, 13)) * spread;
    return [(centre?.[0] ?? p.x) + Math.cos(a) * r, (centre?.[1] ?? p.y) + Math.sin(a) * r];
  }
  private put(kind: string, c: number, [x, z]: [number, number], [s, color]: [number, string]): void {
    const p = this.ground.grid.centres[c]!,
      clear = kind === 'wall' || kind === 'hedge' || kind === 'farm' ? 0.08 : 0.06;
    if (this.ground.grid.cellAt(x, z) !== c || this.keep.rivers.near(x, z, clear + 0.03)) { return; }
    if (this.keep.roads.near(x, z, clear) || this.towns.has(c) && Math.hypot(x - p.x, z - p.y) < 0.33) { return; }
    this.spots[kind]!.push(Scatter.spot(c, [x, z], s, color));
  }
}
