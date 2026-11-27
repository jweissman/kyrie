#!/usr/bin/env bun
// The experience gate (the owner, 23 November): its numbers read every night, each held by a ratchet so that a week of
// work can be judged by whether it moved one. None of them is the experience; each is the cheapest honest reading of a
// part of it, and human acceptance stays apart (BRIEF.md §2).
//   slice:     the supported slice's live P0/P1 defects (scripts/planning-instruments.ts)
//   the walk's times, headless, in ms, from one replay of the warrior's golden walk (scripts/quality/walk-timings.ts):
//     start      a new life begun and its first frame told; first, its first act answered besides (the browser's
//                Play-to-act is the page's to measure; this is the engine's share of it)
//     turn       the median turn; still and still95, a turn that sets out on no journey, median and p95 (budget 30)
//     decision   the engine's act and the legal actions after it, median, and decision95 its p95 (budget 15)
//     leg        one leg of a journey whole, median, and leg95 its p95 (budget 5: BRIEF.md §4)
//   heap:      what a turn of that walk keeps, in KB: the heap after its last turn less the heap after its first, each
//              after a full collection, over the turns between (25 November: a walk had kept 1.5 MB a step, readings
//              kept with the worlds they were made in; test/small/kept-holds-no-world)
//   breaches:  the continuity census's opportunity and undertaking breaches over its three walks
//   ci:        main's last successful CI run on a push, wall-clock minutes (from GitHub; skipped without gh)
// Each is compared with scripts/quality/baseline.json, kept apart for CI and for a local machine (times differ): a
// count may not rise; a time (or the heap kept) may not pass its baseline by more than its slack (Quality.slack: half
// again for a median, more for a p95, which one slow turn moves; runners vary).
// --update writes what was measured as the new baseline; lower it when a number falls, so the ratchet holds the gain.
// --from=<run id> with --update takes the readings a CI run printed (its quality job's log) into the ci baseline, so
// that a night on the runner lowers the runner's ratchet as a local run lowers the local one.
//   bun scripts/quality/quality.ts [--update [--from=<run id>]] [--only=slice,turn,…]
import { execSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ContinuityCensus } from '../continuity-census';
import { PlanningInstruments } from '../planning-instruments';
import { type Reading, type Walked, WalkTimings } from './walk-timings';

type Measure = 'slice' | Walked | 'breaches' | 'ci';
type Baseline = Record<'ci' | 'local', Partial<Record<Measure, number>>>;

export class Quality {
  static readonly file = join(import.meta.dir, 'baseline.json');
  // Times may drift this far over their baseline before the gate fails; counts may not rise at all. Half again for a
  // median (five local runs at load 5 spread 1.14 to 1.22 a median; five CI nights 1.38 the turn, 1.55 the decision
  // across a day's commits). More where the readings spread more: the start, cold on every runner (five CI runs
  // 1.58, a cold local one twice a warm); the leg's median, of about seventeen legs of two kinds (1.76 locally); and a
  // p95, one of the walk's three slowest turns, acts or legs, which one pause moves (1.27 to 1.38 locally, CI's p90s
  // 1.52 and 1.58).
  static readonly slack: Partial<Record<Measure, number>> = { start: 1.75, leg: 2, still95: 2, decision95: 2,
    leg95: 2, page: 2, page95: 2 };
  static readonly slackOf = 1.5;
  static readonly walked: Walked[] = ['start', 'first', 'turn', 'still', 'still95', 'decision', 'decision95', 'leg',
    'leg95', 'page', 'page95', 'heap'];
  static readonly timed = new Set<Measure>([...this.walked, 'ci']);
  // What a run prints its readings after, for --from to find in its log.
  static readonly said = 'quality readings: ';
  static readonly labels: Record<Measure, string> = { slice: 'Supported slice P0/P1 defects',
    start: 'New life to first frame (headless ms)', first: 'New life to first act answered (headless ms)',
    turn: 'Median turn, warrior walk (headless ms)', still: 'Median turn setting out on no journey (headless ms)',
    still95: 'p95 turn setting out on no journey (headless ms)',
    decision: 'Median decision, act and legal actions (headless ms)',
    decision95: 'p95 decision, act and legal actions (headless ms)', leg: 'Median journey leg (headless ms)',
    leg95: 'p95 journey leg (headless ms)', page: 'Median journey leg, the page\'s host (headless ms)',
    page95: 'p95 journey leg, the page\'s host (headless ms)', heap: 'Heap kept a turn, warrior walk (KB)',
    breaches: 'Continuity census breaches', ci: 'Main CI on a push (minutes)' };

  static slice(): Reading {
    const rows = PlanningInstruments.placed().filter(r => r.instrument === 'defects' && r.slice
      && PlanningInstruments.high(r));
    return { value: rows.length, note: `of ${PlanningInstruments.placed().filter(r => r.slice).length} live in the slice` };
  }
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
  // Whether a reading holds against its baseline: a count may not rise; a time may not pass it by its slack.
  static holds(m: Measure, value: number | null, base: number | undefined): boolean {
    if (value === null || base === undefined) { return true; }
    return this.timed.has(m) ? value <= base * (this.slack[m] ?? this.slackOf) : value <= base;
  }
  static want(only: Measure[] | undefined, m: Measure): boolean { return !only || only.includes(m); }
  static async read(only: Measure[] | undefined): Promise<Partial<Record<Measure, Reading>>> {
    const read: Partial<Record<Measure, Reading>> = {};
    if (this.want(only, 'slice')) { read.slice = this.slice(); }
    if (this.walked.some(m => this.want(only, m))) {
      const walked = await WalkTimings.played();
      for (const m of this.walked.filter(w => this.want(only, w))) { read[m] = walked[m]; }
    }
    if (this.want(only, 'breaches')) { read.breaches = await this.breaches(); }
    if (this.want(only, 'ci')) { read.ci = this.ci(); }
    return read;
  }
  // The readings a CI run printed (see said), from its quality job's log.
  static ran(run: string): Partial<Record<Measure, Reading>> {
    const log = execSync(`gh run view ${Number(run)} --log`, { stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 1 << 28 }).toString();
    const line = log.split('\n').find(l => l.includes(this.said));
    if (!line) { throw new Error(`run ${run} printed no quality readings`); }
    const values = JSON.parse(line.slice(line.indexOf(this.said) + this.said.length)) as
      Partial<Record<Measure, number>>;
    return Object.fromEntries(Object.entries(values).map(([m, v]) => [m, { value: v, note: `run ${run}` }]));
  }
  static table(read: Partial<Record<Measure, Reading>>, base: Partial<Record<Measure, number>>): { rows: string[];
    failed: number } {
    const rows = ['| Measure | Now | Baseline | Holds | Note |', '|---|---|---|---|---|'];
    let failed = 0;
    for (const [m, r] of Object.entries(read) as [Measure, Reading][]) {
      const ok = this.holds(m, r.value, base[m]);
      if (!ok) { failed++; }
      rows.push(`| ${this.labels[m]} | ${r.value ?? '—'} | ${base[m] ?? '—'} | ${ok ? 'yes' : '**no**'} | ${r.note} |`);
    }
    return { rows, failed };
  }
  static async run(args: string[]): Promise<number> {
    const only = args.find(a => a.startsWith('--only='))?.slice(7).split(',') as Measure[] | undefined;
    const from = args.find(a => a.startsWith('--from='))?.slice(7), update = args.includes('--update');
    const env = process.env.CI || from ? 'ci' : 'local';
    const read = from ? this.ran(from) : await this.read(only);
    const baseline: Baseline = existsSync(this.file) ? JSON.parse(readFileSync(this.file, 'utf8')) as Baseline
      : { ci: {}, local: {} };
    const { rows, failed } = this.table(read, baseline[env]);
    console.log(rows.join('\n'));
    console.log(`${this.said}${JSON.stringify(Object.fromEntries(Object.entries(read).map(([m, r]) => [m, r.value])))}`);
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Quality (${env})\n\n${rows.join('\n')}\n`);
    }
    if (update) {
      for (const [m, r] of Object.entries(read) as [Measure, Reading][]) {
        if (r.value !== null) { baseline[env][m] = r.value; }
      }
      writeFileSync(this.file, `${JSON.stringify(baseline, null, 1)}\n`);
    }
    return failed && !update ? 1 : 0;
  }
}

if (import.meta.main) { process.exit(await Quality.run(process.argv.slice(2))); }
