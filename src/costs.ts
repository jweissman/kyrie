// What an operation cost, stage by stage, so that a small one which draws in much of the setting is seen doing it (the
// owner, 14 November: the cost of parsing Kyr, installing modules, invoking Deem, instantiating a world or starting a
// session made explicit, measurable, and incurred only where the operation needs it). Each boundary notes itself
// here as it is crossed: how many times, how long, and how much it read. A stage's time includes the stages within
// it (an install includes its parses). Counting is all it does: nothing is cached or skipped by it.
//   const before = Costs.mark(); …; Costs.since(before)   or   bun scripts/load-costs.ts
export type Stage =
  // Kyr text parsed, and parses taken from the cache (in the process or on disk) instead.
  | 'parse' | 'parse kept'
  // A module bundle loaded and compiled, by its id (the canon, data/imbar, is `canon`).
  | 'install'
  // Deem: a creature generated; a country drawn; a whole world composed around it.
  | 'creature' | 'region' | 'world'
  // A campaign loaded and a session started; a screen built; what is told and led with (the glance).
  | 'campaign' | 'session' | 'screen' | 'leaf';
export interface Cost { n: number; ms: number; bytes: number; ids: string[] }
export type Tally = Partial<Record<Stage, Cost>>;
export class Costs {
  private static readonly tally = new Map<Stage, Cost>();
  static note(stage: Stage, ms: number, o: { bytes?: number; id?: string } = {}): void {
    const c = this.tally.get(stage) ?? { n: 0, ms: 0, bytes: 0, ids: [] };
    c.n++; c.ms += ms; c.bytes += o.bytes ?? 0;
    if (o.id && c.ids.length < 200) { c.ids.push(o.id); }
    this.tally.set(stage, c);
  }
  static time<T>(stage: Stage, f: () => T, o: { bytes?: number; id?: string } = {}): T {
    const began = performance.now();
    try { return f(); } finally { this.note(stage, performance.now() - began, o); }
  }
  static async timed<T>(stage: Stage, f: () => Promise<T>, o: { bytes?: number; id?: string } = {}): Promise<T> {
    const began = performance.now();
    try { return await f(); } finally { this.note(stage, performance.now() - began, o); }
  }
  // The tally now, to be taken from later (see since).
  static mark(): Tally { return Object.fromEntries([...this.tally].map(([s, c]) => [s, { ...c, ids: [...c.ids] }])); }
  // What was spent since a mark.
  static since(mark: Tally = {}): Tally {
    const out: Tally = {};
    for (const [stage, c] of this.tally) {
      const was = mark[stage] ?? { n: 0, ms: 0, bytes: 0, ids: [] };
      if (c.n > was.n) {
        const ids = c.ids.slice(was.ids.length);
        out[stage] = { n: c.n - was.n, ms: c.ms - was.ms, bytes: c.bytes - was.bytes, ids };
      }
    }
    return out;
  }
  // A tally in a line: "parse 3 (12 KB, 40 ms) · install 4 (210 ms) · creature 1 (95 ms)".
  static said(t: Tally): string {
    return Object.entries(t).map(([stage, c]) => `${stage} ${c.n}${c.bytes ? ` (${Math.round(c.bytes / 1024)} KB, `
      : ' ('}${Math.round(c.ms)} ms)`).join(' · ') || 'nothing';
  }
}
