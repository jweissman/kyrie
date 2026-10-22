import { Expressions } from '../../expressions';

// A fast seeded stream of draws for generating land, where Deem's dice would be too slow for thousands of draws:
// Chris Doty-Humphrey's sfc32, seeded from the key's hashes. The same key always gives the same stream.
export class Draw {
  private a: number; private b: number; private c: number; private d: number;
  constructor(key: string) {
    this.a = Expressions.seed(`${key}:a`); this.b = Expressions.seed(`${key}:b`);
    this.c = Expressions.seed(`${key}:c`); this.d = Expressions.seed(`${key}:d`);
    for (let i = 0; i < 12; i++) { this.next(); }
  }
  // A number from 0 up to (not including) 1.
  next(): number {
    const t = (((this.a + this.b) | 0) + this.d) | 0;
    this.d = (this.d + 1) | 0;
    this.a = this.b ^ (this.b >>> 9);
    this.b = (this.c + (this.c << 3)) | 0;
    this.c = (this.c << 21) | (this.c >>> 11);
    this.c = (this.c + t) | 0;
    return (t >>> 0) / 4294967296;
  }
  // A whole number from 0 up to (not including) n.
  int(n: number): number { return Math.floor(this.next() * n); }
  chance(p: number): boolean { return this.next() < p; }
  pick<T>(list: readonly T[]): T {
    if (!list.length) { throw new Error('Nothing to draw from'); }
    return list[this.int(list.length)]!;
  }
  // One of the entries, each as likely as its weight.
  weighted<T>(entries: readonly (readonly [T, number])[]): T {
    const total = entries.reduce((sum, [, w]) => sum + Math.max(0, w), 0);
    let roll = this.next() * total;
    for (const [value, weight] of entries) {
      roll -= Math.max(0, weight);
      if (roll < 0) { return value; }
    }
    return entries.at(-1)![0];
  }
  shuffle<T>(list: readonly T[]): T[] {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [out[i], out[j]] = [out[j]!, out[i]!];
    }
    return out;
  }
}
