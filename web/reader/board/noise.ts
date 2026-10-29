import { DataTexture, LinearFilter, RepeatWrapping } from 'three';

// The board's chance: a hash of two numbers, smooth noise from it, and a small tile of noise drawn once for the mist
// and the water to read from instead of working it out at every point of the screen.
export class Noise {
  static hash(x: number, y: number): number {
    let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
  static value(x: number, y: number, period = 0): number {
    const xi = Math.floor(x), yi = Math.floor(y), u = Noise.ease(x - xi), v = Noise.ease(y - yi);
    const a = Noise.lattice(xi, yi, period), b = Noise.lattice(xi + 1, yi, period);
    const c = Noise.lattice(xi, yi + 1, period), d = Noise.lattice(xi + 1, yi + 1, period);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  static fbm(x: number, y: number): number {
    return Noise.value(x, y) * 0.55 + Noise.value(x * 2.3, y * 2.3) * 0.28 + Noise.value(x * 5.1, y * 5.1) * 0.17;
  }
  private static ease(t: number): number { return t * t * (3 - 2 * t); }
  private static lattice(x: number, y: number, period: number): number {
    return period ? Noise.hash(((x % period) + period) % period, ((y % period) + period) % period) : Noise.hash(x, y);
  }
  static texture(): DataTexture {
    const N = 128, data = new Uint8Array(N * N * 4);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        let f = 0, amp = 0.5, total = 0;
        for (const p of [4, 8, 16, 32]) { f += Noise.value((x / N) * p, (y / N) * p,
          p) * amp; total += amp; amp *= 0.5; }
        const v = Math.round((f / total) * 255), i = (y * N + x) * 4;
        data[i] = data[i + 1] = data[i + 2] = v; data[i + 3] = 255;
      }
    }
    const t = new DataTexture(data, N, N);
    t.wrapS = t.wrapT = RepeatWrapping; t.magFilter = t.minFilter = LinearFilter; t.needsUpdate = true;
    return t;
  }
}
