// A seeded draw for the autoplay laboratory, so that a run made again from its seed is the same run.
export class Draw {
  private state: number;
  constructor(seed: string) {
    let hash = 2166136261;
    for (const ch of seed) { hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619); }
    this.state = hash >>> 0;
  }
  next(): number {
    this.state = (this.state + 0x6D2B79F5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  pick<T>(items: readonly T[]): T | undefined {
    return items.length ? items[Math.floor(this.next() * items.length)] : undefined;
  }
  chance(p: number): boolean { return this.next() < p; }
}
