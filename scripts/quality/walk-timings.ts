import { heapStats } from 'bun:jsc';
import type { Campaign } from '../../src/campaign/campaign';
import { Costs } from '../../src/costs';
import { PlayTool } from '../../src/cli/play-tool';
import { Runner } from '../../src/cli/runner';
import { Travel } from '../../src/session/travel';
import { AsMeant } from '../../test/support/as-meant';
import { GoldenWalk } from '../../test/support/golden-walk';
import { Heard } from '../../test/support/heard';
import { EngineHost } from '../../web/engine/engine-host';
import type { Frame, Message } from '../../src/creation/protocol';
import type { PlaySession } from '../../src/session/play-session';

export interface Reading { value: number | null; note: string }
export type Walked = 'start' | 'first' | 'turn' | 'still' | 'still95' | 'decision' | 'decision95' | 'leg' | 'leg95'
  | 'page' | 'page95' | 'heap';
// What one turn of the walk took: whole, its decision (the engine's act and the legal actions after it, Costs' act and
// legal), and the journey's legs within it (each Travel.step whole, as the page takes a leg).
type Stepped = Record<'step', (...a: unknown[]) => Promise<unknown>>;
interface Turn { ms: number; act?: { n: number; ms: number }; legs: number[] }

// The experience gate's times, read from one replay of the warrior's golden walk through the runner (scripts/quality):
// the world started and its first frame told, then every turn timed whole and by its parts. One walk serves them all,
// so that the gate's times cost one start (on a runner, about seven seconds of the job's minutes).
//   start:      a new life begun and its first frame told (PlayTool.start, then the runner's first account of it)
//   first:      the start, and the first act answered
//   turn:       the median turn, every turn of the walk
//   still:      a turn that sets out on no journey (no leg taken in it), median and p95: the owner's budget is 30 ms
//   decision:   the engine's act and what the company may do after it, on a turn of one act, median and p95: 15 ms
//   leg:        one leg of a journey, whole (Travel.step: the frame read, the way taken, whether to stop), median and
//               p95: 5 ms (BRIEF.md §4)
//   page:       one leg of a journey as the page's host takes it (EngineHost.leg: the way taken, told by its receipt
//               where it can be, else its frame built), median and p95, over the first journeys of a warrior on kite
//               told of every town (as test/journey-receipt sets out): the runner's leg above is not the page's
//               (OR-1361, whose double observe the runner never paid; OR-1435)
//   heap:       what a turn keeps, in KB (the heap after the last turn less the heap after the first, each collected)
export class WalkTimings {
  private static legs: number[] = [];
  static async played(): Promise<Record<Walked, Reading>> {
    const t0 = performance.now();
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session);
    r.said();
    const begun = performance.now() - t0, turns: Turn[] = [], held: number[] = [];
    this.timing(journey.session.campaign);
    const step = this.stepping();
    try {
      for (const line of GoldenWalk.lines()) {
        turns.push(await this.turn(r, line));
        if (turns.length === 1) { held.push(this.heap()); }
      }
    } finally { step.restore(); }
    held.push(this.heap());
    return { ...this.started(begun, turns), ...this.turned(turns), ...this.decided(turns), ...this.legged(turns),
      heap: this.kept(held, turns.length), ...await this.hosted() };
  }
  private static async turn(r: Runner, line: string): Promise<Turn> {
    const t = performance.now(), mark = Costs.mark(), from = this.legs.length;
    await AsMeant.ask(r, line);
    const ms = performance.now() - t, { act, legal } = Costs.since(mark);
    return { ms, legs: this.legs.slice(from), ...act ? { act: { n: act.n, ms: act.ms + (legal?.ms ?? 0) } } : {} };
  }
  private static started(begun: number, turns: Turn[]): Pick<Record<Walked, Reading>, 'start' | 'first'> {
    const once = turns[0]!.ms;
    return { start: { value: Math.round(begun), note: 'PlayTool.start and the runner\'s first frame told' },
      first: { value: Math.round(begun + once), note: `the start ${Math.round(begun)} ms, the first line ${Math.round(once)}` } };
  }
  private static turned(turns: Turn[]): Pick<Record<Walked, Reading>, 'turn' | 'still' | 'still95'> {
    const all = this.sorted(turns.map(t => t.ms));
    const still = this.sorted(turns.filter(t => !t.legs.length).map(t => t.ms));
    return { turn: { value: Math.round(this.at(all, 0.5)),
      note: `p90 ${Math.round(this.at(all, 0.9))} ms over ${all.length} turns` },
      still: { value: Math.round(this.at(still, 0.5)), note: `over ${still.length} turns setting out on no journey, target 30` },
      still95: { value: Math.round(this.at(still, 0.95)), note: `the slowest ${Math.round(still.at(-1)!)} ms` } };
  }
  private static decided(turns: Turn[]): Pick<Record<Walked, Reading>, 'decision' | 'decision95'> {
    const acts = this.sorted(turns.filter(t => t.act?.n === 1 && !t.legs.length).map(t => t.act!.ms));
    return { decision: { value: Math.round(this.at(acts, 0.5)), note: `over ${acts.length} acts, target 15` },
      decision95: { value: Math.round(this.at(acts, 0.95)), note: `p90 ${Math.round(this.at(acts, 0.9))} ms` } };
  }
  private static legged(turns: Turn[]): Pick<Record<Walked, Reading>, 'leg' | 'leg95'> {
    const journeys = turns.filter(t => t.legs.length), legs = this.sorted(journeys.flatMap(t => t.legs));
    return { leg: { value: this.tenth(this.at(legs, 0.5)), note: `over ${legs.length} legs of ${journeys.length} journeys, target 5` },
      leg95: { value: this.tenth(this.at(legs, 0.95)), note: `the slowest ${this.tenth(legs.at(-1) ?? 0)} ms` } };
  }
  // The page's legs: a new life on kite told of every town, set out on its first journeys from where the map offers,
  // each EngineHost leg timed whole (a fight on the way pressed through by the company's tactics, as the page can).
  static readonly journeys = 6;
  private static async hosted(): Promise<Pick<Record<Walked, Reading>, 'page' | 'page95'>> {
    const legs: number[] = [], host = new EngineHost(this.pressing.bind(this));
    this.host = host;
    let frame = await host.handle({ kind: 'begin', campaign: 'world', seed: 'kite', origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }) as Frame;
    Heard.towns((host as unknown as { session: PlaySession }).session.campaign);
    const h = host as unknown as Record<'leg', (...a: unknown[]) => Promise<unknown>>, leg = h.leg.bind(host);
    h.leg = this.into.bind(this, legs, leg);
    for (let n = 0; n < this.journeys && frame.screen.running; n++) {
      const offered = [...frame.screen.roads ?? [], ...frame.screen.destinations ?? [], ...frame.screen.mapped ?? []];
      const to = frame.bound?.id ?? offered[(n * 11) % Math.max(1, offered.length)]?.id;
      if (!to) { break; }
      frame = await host.handle({ kind: 'travel', destination: to }) as Frame;
    }
    const sorted = this.sorted(legs);
    return { page: { value: this.tenth(this.at(sorted, 0.5)), note: `over ${legs.length} of the page's legs` },
      page95: { value: this.tenth(this.at(sorted, 0.95)), note: `the slowest ${this.tenth(sorted.at(-1) ?? 0)} ms` } };
  }
  private static host?: EngineHost;
  private static pressing(m: Message): void {
    if (m.kind === 'frame' && m.frame.combat) { setTimeout(this.through.bind(this), 0); }
  }
  private static through(): void { void this.host?.handle({ kind: 'fight', through: true }); }
  private static kept(held: number[], turns: number): Reading {
    return { value: Math.round((held[1]! - held[0]!) / 1024 / Math.max(1, turns - 1)),
      note: `${Math.round(held[0]! / 1048576)} → ${Math.round(held[1]! / 1048576)} MB over ${turns - 1} turns, `
        + `rss ${Math.round(process.memoryUsage().rss / 1048576)} MB` };
  }
  // The heap after a full collection, in bytes.
  static heap(): number { Bun.gc(true); return heapStats().heapSize; }
  // The engine's own act timed (each leg of a journey its own), and apart from it what the player may do worked out,
  // never within it, so that the two add up without counting anything twice.
  static timing(c: Campaign): void {
    c.executeAsync = this.execute.bind(this, c.executeAsync.bind(c));
    c.offered = this.offered.bind(this, c.offered.bind(c));
  }
  private static execute(execute: Campaign['executeAsync'], ...a: Parameters<Campaign['executeAsync']>) {
    return Costs.timed('act', () => execute(...a));
  }
  private static offered(offered: Campaign['offered']) { return Costs.time('legal', offered); }
  // Each leg of a journey timed whole, for the walk alone: Travel's own step, put back after it.
  private static stepping(): { restore: () => void } {
    const t = Travel as unknown as Stepped, step = t.step;
    this.legs = [];
    t.step = this.step.bind(this, step.bind(Travel));
    return { restore: this.restore.bind(this, t, step) };
  }
  private static restore(t: Stepped, step: Stepped['step']): void { t.step = step; }
  private static async step(step: (...a: unknown[]) => Promise<unknown>, ...a: unknown[]): Promise<unknown> {
    return this.into(this.legs, step, ...a);
  }
  private static async into(legs: number[], step: (...a: unknown[]) => Promise<unknown>, ...a: unknown[]):
    Promise<unknown> {
    const t = performance.now();
    try { return await step(...a); } finally { legs.push(performance.now() - t); }
  }
  static sorted(xs: number[]): number[] { return [...xs].sort((a, b) => a - b); }
  // A quantile of sorted readings (the nearest below it); none read is none.
  static at(sorted: number[], q: number): number {
    return sorted.length ? sorted[Math.floor(q * (sorted.length - 1))]! : 0;
  }
  private static tenth(ms: number): number { return Math.round(ms * 10) / 10; }
}
