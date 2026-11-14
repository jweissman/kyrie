#!/usr/bin/env bun
// A full world's start, like for like and repeatably (the owner, 15 November: a like-for-like full-world startup
// benchmark, including the cold browser path). Each run is a fresh process, three ways:
//   cold: nothing parsed kept on disk (KYRIE_PARSE_STORE=0), as a first start on a new machine;
//   warm: the disk's parse store full, as after one run;
//   again: the same start a second time in that process, as a spec's second case or a second game in one page.
// For each: the import, then the start by stage (parse, compose, each install, validate, project, the first screen:
// see StartupProbes), and medians over the runs. The machine's load is said, since a busy machine is a slow one.
//   bun scripts/startup-bench.ts [full|tiny …] [--runs N] [--md] [--browser [--browser-runs N]] [--json out.json]
import { loadavg } from 'node:os';
import { writeFileSync } from 'node:fs';
import { Costs } from '../src/costs';
import { LoadScales } from './load-scales';
import { StartupProbes } from './startup-probes';
import { StartupReport, type Started, type NodeRun } from './startup-report';

class StartupBench {
  // One scale started in this process: its import, then the start, then the same start again.
  static async one(scale: string, mode: string): Promise<NodeRun> {
    const load = loadavg()[0]!, began = performance.now();
    await LoadScales.load(scale);
    const importMs = performance.now() - began;
    await StartupProbes.install(!process.env.KYRIE_BENCH_NO_CLONES);
    const first = await this.started(scale), again = await this.started(scale);
    return { scale, mode, load, importMs: Math.round(importMs), first, again };
  }
  private static async started(scale: string): Promise<Started> {
    StartupProbes.reset();
    const mark = Costs.mark(), t = performance.now();
    await LoadScales.run(scale);
    const ms = performance.now() - t;
    return { ms: Math.round(ms), stages: StartupProbes.stages(Costs.since(mark)),
      installs: StartupProbes.installs.map(i => ({ id: i.id, ms: Math.round(i.ms),
        stages: Object.fromEntries(Object.entries(i.stages).map(([k, v]) => [k, Math.round(v * 10) / 10])) })),
      parses: [...StartupProbes.parses] };
  }
  // Each run a fresh process; a warm run is primed by one before it whose figures are not kept.
  static node(scales: string[], runs: number): NodeRun[] {
    const out: NodeRun[] = [];
    for (const scale of scales) {
      for (const mode of ['cold', 'prime', ...Array.from({ length: runs - 1 }, () => 'cold'), 'warm',
        ...Array.from({ length: runs - 1 }, () => 'warm')]) {
        const env = { ...process.env, ...mode === 'cold' ? { KYRIE_PARSE_STORE: '0' } : {} };
        const child = Bun.spawnSync(['bun', 'scripts/startup-bench.ts', '--one', scale, mode], { env });
        const line = child.stdout.toString().trim().split('\n').at(-1) ?? '';
        try {
          const run = JSON.parse(line) as NodeRun;
          if (mode !== 'prime') { out.push(run); console.error(StartupReport.brief(run)); }
        } catch { console.error(scale, mode, child.stderr.toString().slice(-600)); }
      }
    }
    return out;
  }
  private static flag(args: string[], name: string, fallback: number): number {
    const i = args.indexOf(name);
    return i >= 0 ? Number(args[i + 1]) : fallback;
  }
  static async main(args: string[]): Promise<number> {
    const one = args.indexOf('--one');
    if (one >= 0) { console.log(JSON.stringify(await this.one(args[one + 1]!, args[one + 2]!))); return 0; }
    const valued = new Set(['--runs', '--browser-runs', '--json']);
    const scales = args.filter((a, i) => !a.startsWith('--') && !valued.has(args[i - 1] ?? ''));
    const node = args.includes('--no-node') ? [] : this.node(scales.length ? scales : ['full', 'tiny'],
      this.flag(args, '--runs', 3));
    const browser = args.includes('--browser')
      ? await (await import('./startup-browser')).StartupBrowser.runs(this.flag(args, '--browser-runs', 3)) : [];
    const json = args.indexOf('--json');
    if (json >= 0) { writeFileSync(args[json + 1]!, JSON.stringify({ node, browser }, null, 1)); }
    console.log(StartupReport.tables(node, browser));
    return 0;
  }
}
if (import.meta.main) { process.exit(await StartupBench.main(process.argv.slice(2))); }
