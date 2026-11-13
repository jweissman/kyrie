#!/usr/bin/env bun
// The spec files of a lane of the suite (test/lanes.json), one to a line, for CI's shards to run: `push`, what every
// push runs (the files under its budget by their kept times, test/small, the specs not yet timed, the sentinels), or
// `rest`, everything else. The full suite is every file: CI runs it nightly and on demand.
//   bun scripts/test-lane.ts push|rest [--sum]   (--sum: how many files and kept CI-minutes, instead of the list)
import { Glob } from 'bun';
import { readFileSync } from 'node:fs';

interface Lanes { push: { under: number; sentinels: Record<string, string> } }
class TestLane {
  static run(args: string[]): number {
    const lane = args.find(a => !a.startsWith('--')) ?? 'push';
    const lanes = JSON.parse(readFileSync('test/lanes.json', 'utf8')) as Lanes;
    const kept = (JSON.parse(readFileSync('test/timings.json', 'utf8')) as { files: Record<string, number> }).files;
    // Browser specs are their own job's (KYRIE_BROWSER), and skip without it.
    const specs = [...new Glob('test/**/*.test.ts').scanSync('.')].filter(s => !/-browser\.test\.ts$/.test(s)).sort();
    const missing = Object.keys(lanes.push.sentinels).filter(s => !specs.includes(s));
    if (missing.length) { console.error(`test/lanes.json names specs that are not there: ${missing.join(' ')}`); return 1; }
    const pushed = specs.filter(s => this.pushed(s, kept, lanes));
    const chosen = lane === 'rest' ? specs.filter(s => !pushed.includes(s)) : pushed;
    if (args.includes('--sum')) {
      const minutes = chosen.reduce((n, s) => n + (kept[s] ?? 0), 0) / 60000;
      console.log(`${lane}: ${chosen.length} files, ${minutes.toFixed(0)} kept CI-minutes`);
    } else { console.log(chosen.join('\n')); }
    return 0;
  }
  private static pushed(spec: string, kept: Record<string, number>, lanes: Lanes): boolean {
    const ms = kept[spec];
    return spec.startsWith('test/small/') || ms === undefined || ms < lanes.push.under || spec in lanes.push.sentinels;
  }
}
process.exit(TestLane.run(process.argv.slice(2)));
