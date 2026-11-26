#!/usr/bin/env bun
// Where a turn goes (platform-separation.md's immediate queue, step 1: the turn's attribution): the golden walk
// replayed through the runner as the experience gate replays it (scripts/quality), each turn timed whole and each part
// of it by its own time, less the parts within it (self time): the command resolved, the engine's act and what the
// company may do after it, the country beyond, what is told, the aims, the digest, the receipt and the transcript, the
// frame and its rows, the screen and its ways, the narrator's leaf and its glance, what the company perceives, and the
// runner's own answer. What no part holds is the turn's unexplained share, held under a tenth (test/turn-attribution).
//   bun scripts/turn-attribution.ts [--json]
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { AsMeant } from '../test/support/as-meant';
import { GoldenWalk } from '../test/support/golden-walk';
import { Campaign } from '../src/campaign/campaign';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { PlayerView } from '../src/presentation/player-view';
import { PlayerFrame } from '../src/presentation/player-frame';
import { Digest } from '../src/session/digest';
import { Undertakings } from '../src/presentation/undertakings';
import { OpenCommand } from '../src/session/open-command';
import { RuleWords } from '../src/narrative/rule-words';
import { Telling } from '../src/narrative/telling';
import { Glance } from '../src/presentation/glance';
import { Itineraries } from '../src/ui/itinerary';
import { Travel } from '../src/session/travel';

type Part = string;
interface Frame { part: Part; began: number; within: number }
export class TurnAttribution {
  private static readonly stack: Frame[] = [];
  // What it reads the time by (a spec's own clock, to be exact).
  static clock: () => number = performance.now.bind(performance);
  private static self = new Map<Part, number>();
  // How often each part was entered, over the walk.
  static readonly calls = new Map<Part, number>();
  // A part's whole time, the parts within it included (a journey's leg, start to end).
  static readonly whole = new Map<Part, number>();
  // The parts' own times and calls within a journey's legs.
  static readonly onLeg = new Map<Part, number>();
  static readonly legCalls = new Map<Part, number>();
  // A part's own time, less the parts within it.
  static enter(part: Part): Frame {
    this.calls.set(part, (this.calls.get(part) ?? 0) + 1);
    const f = { part, began: this.clock(), within: 0 };
    this.stack.push(f);
    return f;
  }
  static leave(f: Frame) {
    const took = this.clock() - f.began;
    this.stack.pop();
    this.self.set(f.part, (this.self.get(f.part) ?? 0) + took - f.within);
    this.whole.set(f.part, (this.whole.get(f.part) ?? 0) + took);
    if (f.part === 'leg' || this.stack.some(o => o.part === 'leg')) {
      this.onLeg.set(f.part, (this.onLeg.get(f.part) ?? 0) + took - f.within);
      this.legCalls.set(f.part, (this.legCalls.get(f.part) ?? 0) + 1);
    }
    const outer = this.stack.at(-1);
    if (outer) { outer.within += took; }
  }
  // A method timed as a part, sync or async, wherever it is called from.
  static wrap(owner: object, name: string, part: Part) {
    const o = owner as Record<string, (...a: unknown[]) => unknown>, f = o[name]!;
    o[name] = new Proxy(f, { apply: TurnAttribution.applied.bind(TurnAttribution, part) });
  }
  private static applied(part: Part, target: (...a: unknown[]) => unknown, self: unknown, a: unknown[]): unknown {
    return this.timed(part, target.bind(self, ...a));
  }
  // A call timed as a part, sync or async.
  private static timed(part: Part, call: () => unknown): unknown {
    const frame = this.enter(part);
    let out: unknown;
    try { out = call(); } catch (e) { this.leave(frame); throw e; }
    if (out instanceof Promise) { return out.finally(() => this.leave(frame)); }
    this.leave(frame);
    return out;
  }
  // What a run of one call took, whole and by its parts (the parts' own times, and the rest under `turn`).
  static async within(run: () => unknown): Promise<{ total: number; parts: Map<Part, number> }> {
    this.self = new Map();
    const frame = this.enter('turn'), t = this.clock();
    try { await run(); } finally { this.leave(frame); }
    return { total: this.clock() - t, parts: this.self };
  }
  static parts(): void {
    const p = PlaySession.prototype as object, c = Campaign.prototype as object;
    this.wrap(p, 'resolving', 'resolve');
    this.wrap(c, 'executeAsync', 'act');
    this.wrap(c, 'offered', 'legal');
    this.wrap(RuleWords, 'tell', 'tell'); this.wrap(Telling, 'tell', 'tell');
    this.wrap(Undertakings, 'after', 'aims'); this.wrap(Undertakings, 'resume', 'aims');
    this.wrap(Undertakings, 'held', 'aims');
    this.wrap(Digest, 'of', 'digest');
    this.wrap(OpenCommand.prototype, 'receipt', 'receipt');
    this.wrap(c, 'told', 'tell');
    this.wrap(PlayerFrame, 'of', 'frame');
    this.wrap(PlayerView, 'choices', 'rows');
    this.wrap(PlayerView, 'observe', 'observe');
    this.wrap(ScreenModel, 'build', 'screen');
    this.wrap(Itineraries, 'shown', 'itinerary'); this.wrap(Itineraries, 'charted', 'charted');
    // Each journey planned (its calls a turn: what routes on demand lowers).
    this.wrap(Itineraries, 'plan', 'plan');
    this.wrap(Narrator, 'leaf', 'leaf');
    this.wrap(Glance, 'of', 'glance');
    this.wrap(Travel, 'step', 'leg'); this.wrap(Travel, 'interrupted', 'stop');
  }
  // The walk played, each turn timed whole (a turn: the line asked of the runner, as the gate asks it).
  static async walk(): Promise<{ turns: number; total: number; parts: Map<Part, number> }> {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session);
    this.parts();
    this.self = new Map();
    let total = 0, turns = 0;
    for (const line of GoldenWalk.lines()) {
      const frame = this.enter('runner');
      const t = performance.now();
      await AsMeant.ask(r, line);
      total += performance.now() - t; turns++;
      this.leave(frame);
    }
    return { turns, total, parts: this.self };
  }
  static async run(args: string[]): Promise<number> {
    const { turns, total, parts } = await this.walk();
    const rows = [...parts].sort((a, b) => b[1] - a[1]);
    if (args.includes('--json')) {
      console.log(JSON.stringify({ turns, total, parts: Object.fromEntries(rows), calls: Object.fromEntries(this.calls),
        legs: this.legs() }));
      return 0;
    }
    console.log(`${turns} turns, ${Math.round(total / turns)} ms a turn`);
    for (const [part, ms] of rows) {
      const n = ((this.calls.get(part) ?? 0) / turns).toFixed(1);
      console.log(`${part.padEnd(10)} ${(ms / turns).toFixed(1).padStart(7)} ms a turn  ${(100 * ms / total).toFixed(1)}%`
        + `  ${n} a turn`);
    }
    const legs = this.legs();
    console.log(`journey legs: ${legs.n}, ${legs.ms.toFixed(1)} ms a leg whole, ${legs.stop.toFixed(1)} ms of it deciding whether to stop`);
    for (const [part, { ms, calls }] of Object.entries(legs.parts)) {
      console.log(`  ${part.padEnd(10)} ${ms.toFixed(1).padStart(7)} ms a leg  ${calls.toFixed(1)} a leg`);
    }
    return 0;
  }
  // A journey's legs: how many, and what each took whole.
  static legs(): { n: number; ms: number; stop: number; parts: Record<Part, { ms: number; calls: number }> } {
    const n = this.calls.get('leg') ?? 0;
    const parts = Object.fromEntries([...this.onLeg].sort((a, b) => b[1] - a[1])
      .map(([p, ms]) => [p, { ms: n ? ms / n : 0, calls: n ? (this.legCalls.get(p) ?? 0) / n : 0 }]));
    return { n, ms: n ? (this.whole.get('leg') ?? 0) / n : 0, stop: n ? (this.whole.get('stop') ?? 0) / n : 0, parts };
  }
}

if (import.meta.main) { process.exit(await TurnAttribution.run(process.argv.slice(2))); }
