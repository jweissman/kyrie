#!/usr/bin/env bun
// The cost of each scale of running the game, measured stage by stage (the owner, 14 November: how much of Kyrie can
// be exercised without loading Westernesse, and how much of Westernesse without composing a campaign). Each scale is
// run in a fresh process three ways: cold (no parse kept on disk), warm from the disk's parse store, and again in the
// same process (what a spec's second case pays). For each: the time to import its code, the time to run it, and what
// it crossed (Costs: parses, installs, Deem's creatures and regions, campaigns, sessions, screens, glances).
//   bun scripts/load-costs.ts [scale…] [--md]
import { Costs, type Tally } from '../src/costs';
import { LoadScales } from './load-scales';

interface Run { scale: string; mode: string; importMs: number; runMs: number; tally: Tally }

class LoadCosts {
  static async one(scale: string, mode: string): Promise<Run> {
    const began = performance.now();
    await LoadScales.load(scale);
    const importMs = performance.now() - began;
    if (mode === 'again') { await LoadScales.run(scale); }
    const mark = Costs.mark(), t = performance.now();
    await LoadScales.run(scale);
    return { scale, mode, importMs: mode === 'again' ? 0 : importMs, runMs: performance.now() - t, tally: Costs.since(mark) };
  }
  static async main(args: string[]): Promise<number> {
    const one = args.indexOf('--one');
    if (one >= 0) { console.log(JSON.stringify(await this.one(args[one + 1]!, args[one + 2]!))); return 0; }
    const scales = args.filter(a => !a.startsWith('--'));
    const runs: Run[] = [];
    for (const scale of scales.length ? scales : LoadScales.names) {
      for (const mode of ['cold', 'prime', 'warm', 'again']) {
        const env = { ...process.env, ...mode === 'cold' ? { KYRIE_PARSE_STORE: '0' } : {} };
        const out = Bun.spawnSync(['bun', 'scripts/load-costs.ts', '--one', scale, mode], { env });
        const line = out.stdout.toString().trim().split('\n').at(-1) ?? '';
        try { if (mode !== 'prime') { runs.push(JSON.parse(line) as Run); } } catch { console.error(scale, mode, out.stderr.toString().slice(-400)); }
      }
    }
    for (const r of runs) {
      console.log(`${r.scale.padEnd(9)} ${r.mode.padEnd(6)} import ${Math.round(r.importMs).toString().padStart(5)} ms`
        + `  run ${Math.round(r.runMs).toString().padStart(6)} ms  ${Costs.said(r.tally)}`);
    }
    return 0;
  }
}
if (import.meta.main) { process.exit(await LoadCosts.main(process.argv.slice(2))); }
