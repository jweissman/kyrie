#!/usr/bin/env bun
// The experience gate (the owner, 23 November): six numbers, read every night, each held by a ratchet so that a week
// of work can be judged by whether it moved one. None of them is the experience; each is the cheapest honest reading of
// a part of it, and human acceptance stays apart (BRIEF.md §2).
//   slice:     the supported slice's live P0/P1 defects (scripts/planning-instruments.ts)
//   first:     a new life started and its first act answered, headless, in ms (the browser's Play-to-act is the
//              page's to measure; this is the engine's share of it)
//   turn:      the median turn of the warrior's golden walk through the runner, headless, in ms
//   decision:  the median decision on that walk: the engine's act and what the company may do after it worked out
//              (src/costs.ts: act and legal), over the turns of one act; the owner's budget is 15 ms (BRIEF.md §4).
//              A journey's turns, an act a leg, are said beside it by the leg (their budget is 5 ms)
//   heap:      what a turn of that walk keeps, in KB: the heap after its last turn less the heap after its first, each
//              after a full collection, over the turns between (25 November: a walk had kept 1.5 MB a step, readings
//              kept with the worlds they were made in; test/small/kept-holds-no-world)
//   breaches:  the continuity census's opportunity and undertaking breaches over its three walks
//   ci:        main's last successful CI run on a push, wall-clock minutes (from GitHub; skipped without gh)
// Each is compared with scripts/quality/baseline.json, kept apart for CI and for a local machine (times differ): a
// count may not rise, a time (or the heap kept) may not pass its baseline by more than half again (runners vary).
// --update writes what was measured as the new baseline; lower it when a number falls, so the ratchet holds the gain.
//   bun scripts/quality/quality.ts [--update] [--only slice,turn,…]
import { heapStats } from 'bun:jsc';
import { execSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Campaign } from '../../src/campaign/campaign';
import { Costs } from '../../src/costs';
import { PlayTool } from '../../src/cli/play-tool';
import { Runner } from '../../src/cli/runner';
import { AsMeant } from '../../test/support/as-meant';
import { ContinuityCensus } from '../continuity-census';
import { PlanningInstruments } from '../planning-instruments';
import { GoldenWalk } from '../../test/support/golden-walk';

type Measure = 'slice' | 'first' | 'turn' | 'decision' | 'heap' | 'breaches' | 'ci';
interface Reading { value: number | null; note: string }
type Baseline = Record<'ci' | 'local', Partial<Record<Measure, number>>>;

export class Quality {
  static readonly file = join(import.meta.dir, 'baseline.json');
  static readonly walk = 'doc/architecture/mission-22/golden/warrior-walk.txt';
  // Times may drift this far over their baseline before the gate fails; counts may not rise at all.
  static readonly slack = 1.5;
  static readonly timed = new Set<Measure>(['first', 'turn', 'decision', 'heap', 'ci']);
  static readonly labels: Record<Measure, string> = { slice: 'Supported slice P0/P1 defects',
    first: 'New life to first act answered (headless ms)', turn: 'Median turn, warrior walk (headless ms)',
    decision: 'Median decision, act and legal actions (headless ms)', heap: 'Heap kept a turn, warrior walk (KB)',
    breaches: 'Continuity census breaches', ci: 'Main CI on a push (minutes)' };

  static slice(): Reading {
    const rows = PlanningInstruments.placed().filter(r => r.instrument === 'defects' && r.slice
      && PlanningInstruments.high(r));
    return { value: rows.length, note: `of ${PlanningInstruments.placed().filter(r => r.slice).length} live in the slice` };
  }
  static lines(): string[] {
    return readFileSync(this.walk, 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#'));
  }
  // One walk serves both: the start and first act timed, then every turn.
  static async played(): Promise<{ first: Reading; turn: Reading; decision: Reading; heap: Reading }> {
    const lines = this.lines(), t0 = performance.now();
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const begun = performance.now() - t0, r = new Runner(journey.session), turns: number[] = [], decided: number[] = [];
    const legs: number[] = [], held: number[] = [];
    this.timing(journey.session.campaign);
    for (const line of lines) {
      const t = performance.now(), mark = Costs.mark();
      await AsMeant.ask(r, line);
      turns.push(performance.now() - t);
      const { act, legal } = Costs.since(mark);
      const ms = (act?.ms ?? 0) + (legal?.ms ?? 0);
      if (act?.n === 1) { decided.push(ms); } else if (act) { legs.push(ms / act.n); }
      if (turns.length === 1) { held.push(this.heap()); }
    }
    held.push(this.heap());
    const sorted = this.sorted(turns), decisions = this.sorted(decided), legged = this.sorted(legs);
    return { first: { value: Math.round(begun + turns[0]!), note: `the start ${Math.round(begun)} ms, the first line ${Math.round(turns[0]!)}` },
      turn: { value: Math.round(this.at(sorted, 0.5)), note: `p90 ${Math.round(this.at(sorted, 0.9))} ms over ${turns.length} turns` },
      decision: { value: Math.round(this.at(decisions, 0.5)),
        note: `p90 ${Math.round(this.at(decisions, 0.9))} ms over ${decisions.length} acts, target 15; a journey's leg `
          + `${Math.round(this.at(legged, 0.5))} ms at the median over ${legged.length} journeys, target 5` },
      heap: { value: Math.round((held[1]! - held[0]!) / 1024 / Math.max(1, turns.length - 1)),
        note: `${Math.round(held[0]! / 1048576)} → ${Math.round(held[1]! / 1048576)} MB over ${turns.length - 1} turns, `
          + `rss ${Math.round(process.memoryUsage().rss / 1048576)} MB` } };
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
  static sorted(xs: number[]): number[] { return [...xs].sort((a, b) => a - b); }
  static at(sorted: number[], q: number): number { return sorted[Math.floor(q * (sorted.length - 1))]!; }
  static async breaches(): Promise<Reading> {
    const counts: string[] = [];
    let total = 0;
    for (const w of ContinuityCensus.walks) {
      const { breaches } = await ContinuityCensus.walk(w);
      total += breaches.length;
      counts.push(`${w.name} ${breaches.length}`);
    }
    return { value: total, note: counts.join(', ') };
  }
  static ci(): Reading {
    try {
      const out = execSync('gh run list --workflow CI --branch main --event push --status success --limit 1 '
        + '--json startedAt,updatedAt,databaseId', { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
      const [run] = JSON.parse(out) as { startedAt: string; updatedAt: string; databaseId: number }[];
      if (!run) { return { value: null, note: 'no run found' }; }
      const minutes = (Date.parse(run.updatedAt) - Date.parse(run.startedAt)) / 60000;
      return { value: Math.round(minutes * 10) / 10, note: `run ${run.databaseId}` };
    } catch { return { value: null, note: 'gh unavailable' }; }
  }
  // Whether a reading holds against its baseline: a count may not rise; a time may not pass it by the slack.
  static holds(m: Measure, value: number | null, base: number | undefined): boolean {
    if (value === null || base === undefined) { return true; }
    return this.timed.has(m) ? value <= base * this.slack : value <= base;
  }
  static want(only: Measure[] | undefined, m: Measure): boolean { return !only || only.includes(m); }
  static async run(args: string[]): Promise<number> {
    const only = args.find(a => a.startsWith('--only='))?.slice(7).split(',') as Measure[] | undefined;
    const env = process.env.CI ? 'ci' : 'local';
    const read: Partial<Record<Measure, Reading>> = {};
    if (this.want(only, 'slice')) { read.slice = this.slice(); }
    if (['first', 'turn', 'decision', 'heap'].some(m => this.want(only, m as Measure))) { Object.assign(read, await this.played()); }
    if (this.want(only, 'breaches')) { read.breaches = await this.breaches(); }
    if (this.want(only, 'ci')) { read.ci = this.ci(); }
    const baseline: Baseline = existsSync(this.file) ? JSON.parse(readFileSync(this.file, 'utf8')) as Baseline
      : { ci: {}, local: {} };
    const rows = ['| Measure | Now | Baseline | Holds | Note |', '|---|---|---|---|---|'];
    let failed = 0;
    for (const [m, r] of Object.entries(read) as [Measure, Reading][]) {
      const base = baseline[env][m], ok = this.holds(m, r.value, base);
      if (!ok) { failed++; }
      rows.push(`| ${this.labels[m]} | ${r.value ?? '—'} | ${base ?? '—'} | ${ok ? 'yes' : '**no**'} | ${r.note} |`);
      if (args.includes('--update') && r.value !== null) { baseline[env][m] = r.value; }
    }
    console.log(rows.join('\n'));
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Quality (${env})\n\n${rows.join('\n')}\n`);
    }
    if (args.includes('--update')) { writeFileSync(this.file, `${JSON.stringify(baseline, null, 1)}\n`); }
    return failed && !args.includes('--update') ? 1 : 0;
  }
}

if (import.meta.main) { process.exit(await Quality.run(process.argv.slice(2))); }
