import { Expressions } from '../../expressions';

// A fast seeded stream of draws for generating land, where Deem's dice would be too slow for thousands of draws:
// Chris Doty-Humphrey's sfc32, seeded from the key's hashes. The same key always gives the same stream.
export class Draw {
  private a: number; private b: number; private c: number; private d: number;
  static seed(key: string): number { return Expressions.seed(key); }
  constructor(key: string) {
    this.a = Draw.seed(`${key}:a`); this.b = Draw.seed(`${key}:b`);
    this.c = Draw.seed(`${key}:c`); this.d = Draw.seed(`${key}:d`);
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
  // The stretches (or any numbered things) in the order of a draw of each one's own, by key and number, so that one
  // added to or taken from the list moves no other (AR-17: a province added re-seeded every world's wild, because the
  // whole list was shuffled). The order of the list given does not matter.
  static ranked(key: string, list: readonly number[]): number[] {
    const rank = new Map(list.map(n => [n, Draw.mix(Draw.seed(`${key}:${n}`))]));
    return [...list].sort((a, b) => rank.get(a)! - rank.get(b)! || a - b);
  }
  // murmur3's finaliser, so that keys alike but for their last characters are ranked far apart.
  private static mix(h: number): number {
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b); h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    return (h ^ (h >>> 16)) >>> 0;
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
