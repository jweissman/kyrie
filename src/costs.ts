import { ParseCache } from './lang/parse-cache';

// What an operation cost, stage by stage, so that a small one which draws in much of the setting is seen doing it (the
// owner, 14 November: the cost of parsing Kyr, installing modules, invoking Deem, instantiating a world or starting a
// session made explicit, measurable, and incurred only where the operation needs it). Each boundary notes itself
// here as it is crossed: how many times, how long, and how much it read. A stage's time includes the stages within
// it (an install includes its parses). Counting is all it does: nothing is cached or skipped by it.
//   const before = Costs.mark(); …; Costs.since(before)   or   bun scripts/load-costs.ts
export type Stage =
  // Kyr text parsed, and parses taken from the cache (in the process or on disk) instead.
  | 'parse' | 'parse kept'
  // A parse by its parts (the review of generated parsing, 20 November, §4): the grammar's match, the lowering into a
  // module (the semantics), the cache's copy of it, and what keeping it where the process keeps parses cost; bytes
  // the text's UTF-8 size. 'parse' is match and lowering together, as it always was.
  | 'parse match' | 'parse lower' | 'parse clone' | 'parse store'
  // A module's own files compiled before (joined and shadowed), taken from where its parses are kept.
  | 'compiled kept'
  // A module bundle loaded and compiled, by its id (the canon, data/imbar, is `canon`).
  | 'install'
  // Deem: a creature generated; a country drawn; a whole world composed around it; a campaign's kits composed into
  // its modules as it loads (a town's kit against its country: within the campaign's load, AX-09).
  | 'creature' | 'region' | 'world' | 'kits'
  // A campaign loaded and a session started; a screen built; what is told and led with (the glance). A session's
  // start is its campaign's load and the record begun beside it, so the two are nearly one figure: the session's own
  // share is what it is less the campaign's.
  | 'campaign' | 'session' | 'screen' | 'leaf'
  // Within a turn: what the company perceives worked out (PlayerView.observe, not taken from what it kept), the glance
  // (within the leaf), the ways set out on (Itineraries.shown, within the screen), and a command done (the engine's own
  // act, a fight's waits on its controller within it); and what the player may do worked out (Campaign.offered): with the act, the decision the owner's budget is for (BRIEF.md §4: under 15 ms).
  | 'observe' | 'glance' | 'itinerary' | 'act' | 'legal';
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
// The language's parses counted here too (see ParseCache.costs).
ParseCache.costs = Costs;
