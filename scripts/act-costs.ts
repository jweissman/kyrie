#!/usr/bin/env bun
// What each act costs headless, part by part (OR-91, OR-114, AX-05): a kept play's own lines replayed through the
// runner as its specs replay them (test/support/before-rooms), or the page's own host (EngineHost, in this process),
// each act timed whole and by what it crossed (src/costs.ts): the engine's act, the screen and, within it, the ways
// set out on (Itineraries.shown); the narrator's leaf and, within it, the glance; and how often what the company
// perceives was worked out afresh (PlayerView.observe, not taken from what it kept). Then the medians, the worst act,
// and the stages that cost most over the whole play.
//   bun scripts/act-costs.ts runner <lines.txt> <world> <as> [acts]      a kept play by the runner, each line as meant
//                                                                       (AsMeant); the golden walk in its opening
//   bun scripts/act-costs.ts page <lines.txt> <world> <as> [acts]        the same lines by the page's host
//   bun scripts/act-costs.ts eogan [acts]                                a1's order cleric, the brothers' letter given
//   [--json out.jsonl] writes each act's row
//   [--fresh] keeps nothing from one world to the next (see WorldReads), to compare each act's answer against;
//   FRAMES=out.jsonl writes each frame the page's host answered with (page)
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Costs, type Stage, type Tally } from '../src/costs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { EngineHost } from '../web/engine/engine-host';
import type { Message } from '../src/creation/protocol';
import type { PlaySession } from '../src/session/play-session';
import { BeforeRooms } from '../test/support/before-rooms';
import { AsMeant } from '../test/support/as-meant';
import { GoldenWalk } from '../test/support/golden-walk';
import { WorldReads } from '../src/lang/world-reads';

// cpu: the process's own time over the act (every thread's: the collector's and the compiler's too), less swayed than
// the clock's by whatever else the machine is running.
interface Row { n: number; act: string; moment: string; ms: number; cpu: number; stages: Tally; said: string;
  fight?: number }
type Inner = { session?: PlaySession; saving: () => void };
const shown: Stage[] = ['act', 'screen', 'itinerary', 'observe', 'leaf', 'glance'];
export class ActCosts {
  private readonly rows: Row[] = [];
  constructor(private readonly out: string) { if (out) { writeFileSync(out, ''); } }
  static never() { /* the profile keeps nothing */ }
  static fresh<T>(read: () => T): { value: T; reads?: string[] } { return { value: read() }; }
  // The engine's own act timed as the session does it (each leg of a journey its own).
  static timing(s: PlaySession): PlaySession {
    s.perform = ActCosts.perform.bind(ActCosts, s.perform.bind(s));
    return s;
  }
  private static perform(perform: PlaySession['perform'], ...a: Parameters<PlaySession['perform']>) {
    return Costs.timed('act', () => perform(...a));
  }
  // What each act was answered with, as a hash: the same with anything kept from one world to the next as without.
  private said = '';
  async timed(n: number, act: string, f: () => Promise<string>): Promise<void> {
    ActCosts.fought = undefined;
    const mark = Costs.mark(), began = performance.now(), used = ActCosts.cpu(), moment = await f();
    const fight = ActCosts.fought === undefined ? {} : { fight: ActCosts.fought - began };
    const row = { n, act, moment, ms: performance.now() - began, cpu: ActCosts.cpu() - used, stages: Costs.since(mark),
      said: this.said, ...fight };
    this.rows.push(row);
    if (this.out) { appendFileSync(this.out, JSON.stringify(row) + '\n'); }
    console.log(`${String(n).padStart(3)} ${Math.round(row.ms).toString().padStart(5)} ms ${moment.padEnd(7)} `
      + `${shown.map(s => `${s} ${ActCosts.of(row, s)}`).join(' · ')}`
      + `${row.fight === undefined ? '' : ` · first fight frame ${Math.round(row.fight)} ms`}  ${act.slice(0, 60)}`);
  }
  private static cpu(): number { const u = process.cpuUsage(); return (u.user + u.system) / 1000; }
  private static of(row: Row, s: Stage): string {
    const c = row.stages[s];
    return c ? `${c.n}/${Math.round(c.ms)}` : '0';
  }
  static median(xs: number[]): number {
    const s = [...xs].sort((a, b) => a - b);
    return s.length ? s[Math.floor(s.length / 2)]! : 0;
  }
  summary(): void {
    const acts = this.rows.filter(r => r.moment !== 'refused'), ms = acts.map(r => r.ms);
    const worst = acts.reduce<Row | undefined>((w, r) => !w || r.ms > w.ms ? r : w, undefined);
    const fights = acts.flatMap(r => r.fight === undefined ? [] : [r.fight]);
    if (fights.length) { console.log(`\nfights' first frames: ${fights.map(Math.round).join(', ')} ms`); }
    const cpu = Math.round(ActCosts.median(acts.map(r => r.cpu)));
    console.log(`\n${acts.length} acts: median ${Math.round(ActCosts.median(ms))} ms, worst ${Math.round(worst?.ms ?? 0)} ms`
      + ` (${worst?.n} ${worst?.act}); the process's own time a median ${cpu} ms`);
    for (const s of shown) {
      const per = acts.map(r => r.stages[s]?.ms ?? 0), n = acts.map(r => r.stages[s]?.n ?? 0);
      console.log(`  ${s.padEnd(9)} median ${Math.round(ActCosts.median(per)).toString().padStart(4)} ms`
        + `  total ${Math.round(per.reduce((a, b) => a + b, 0)).toString().padStart(6)} ms`
        + `  calls a turn median ${ActCosts.median(n)} max ${Math.max(0, ...n)}`);
    }
  }
  async runner(lines: string[], session: PlaySession): Promise<void> {
    const r = new Runner(ActCosts.timing(session));
    await this.timed(0, '(arrive)', () => Promise.resolve(r.said().moment));
    for (const [i, line] of lines.entries()) {
      await this.timed(i + 1, line, async () => {
        const s = await AsMeant.ask(r, line);
        this.said = Bun.hash(JSON.stringify(s)).toString(16);
        return 'error' in s ? 'refused' : s.moment;
      });
    }
  }
  // The page's host, bound to the session: each line's act done where the page offers it, a fight fought by tactics.
  async page(lines: string[], session: PlaySession): Promise<void> {
    const host: EngineHost = new EngineHost(ActCosts.heard.bind(ActCosts, () => host));
    const inner = host as unknown as Inner;
    inner.saving = ActCosts.never; inner.session = ActCosts.timing(session);
    for (const [i, line] of lines.entries()) {
      const act = (JSON.parse(line) as { act?: string; follow?: string });
      const command = act.follow ? `follow:${act.follow}` : act.act ?? '';
      const offered = /^(follow|travel):/.test(command)
        || PlayerView.choices(session.campaign).some(c => c.choice.id === command);
      if (!offered || !session.campaign.running) { continue; }
      await this.timed(i + 1, command, async () => {
        const to = command.startsWith('travel:') ? command.slice('travel:'.length)
          : command.startsWith('follow:') ? undefined : session.crosses(command);
        const frame = await host.handle(to ? { kind: 'travel', destination: to } : { kind: 'perform', command });
        const text = JSON.stringify({ ...frame as object, timing: undefined }).replaceAll(process.cwd(), '.');
        this.said = Bun.hash(text).toString(16);
        if (process.env.FRAMES) { appendFileSync(process.env.FRAMES, text + '\n'); }
        return to ? 'travel' : 'act';
      });
    }
  }
  // When the page's host first sent a fight's frame in the act under way (OR-114: a fight's first frame).
  private static fought?: number;
  private static heard(host: () => EngineHost, m: Message) {
    if (m.kind === 'frame' && m.frame.combat) { ActCosts.fought ??= performance.now(); }
    if (m.kind === 'frame' && m.frame.combat?.ours) { setTimeout(ActCosts.fightOn.bind(ActCosts, host()), 0); }
  }
  private static fightOn(host: EngineHost) { void host.handle({ kind: 'fight' }); }
  // a1's order cleric, whose first act gives Eogan the brothers' letter (the aim seen through, OR-91's ~470 ms).
  async eogan(n: number): Promise<void> {
    const s = await DrawnWorld.start('a1', { origin: 'order', party: [{ name: 'Hamo', raceId: 'human',
      classId: 'cleric', backgroundId: 'doctor' }] }, NodeBundleSource.shared);
    const r = new Runner(ActCosts.timing(s));
    let said = r.said();
    for (let i = 1; i <= n && s.campaign.running; i++) {
      const o = i === 1 ? [...said.offer.primary, ...said.offer.rest].find(x => /^Give Eogan/.test(x.label))
        : said.offer.primary[0];
      if (!o) { break; }
      await this.timed(i, o.label, async () => {
        const x = await r.ask(JSON.stringify({ act: o.id }));
        this.said = Bun.hash(JSON.stringify(x)).toString(16);
        if (!('error' in x)) { said = x as Said; }
        return 'error' in x ? 'refused' : x.moment;
      });
    }
  }
  static async main(args: string[]): Promise<number> {
    const json = args.indexOf('--json'), out = json >= 0 ? args.splice(json, 2)[1] ?? '' : '';
    // --fresh: nothing kept from one world to the next (every reading said to read everything), to compare against.
    if (args.includes('--fresh')) { args.splice(args.indexOf('--fresh'), 1); WorldReads.of = ActCosts.fresh; }
    const [mode, file, world, as, n] = args, costs = new ActCosts(out);
    if (mode === 'eogan') { await costs.eogan(Number(file ?? 12)); costs.summary(); return 0; }
    if ((mode !== 'runner' && mode !== 'page') || !file || !world || !as) {
      console.log('usage: bun scripts/act-costs.ts runner|page <lines.txt> <world> <as> [acts] | eogan [acts]');
      return 2;
    }
    // A kept play's own lines, not its comments; begun as the golden walk is where it is the golden walk (in its
    // country's stock opening: GoldenWalk.args), else as the play was begun.
    const lines = readFileSync(file, 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#'))
      .slice(0, Number(n ?? 1000));
    const begun = resolve(file) === resolve(GoldenWalk.file) ? GoldenWalk.args(as) : ['--world', world, '--as', as];
    const { journey } = await PlayTool.start(PlayTool.parse(begun));
    await costs[mode](lines, BeforeRooms.set(journey.session));
    costs.summary();
    return 0;
  }
}
if (import.meta.main) { process.exitCode = await ActCosts.main(process.argv.slice(2)); }
