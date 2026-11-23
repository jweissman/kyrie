#!/usr/bin/env bun
// The spec files of a lane of the suite (test/lanes.json), one to a line, for CI's shards to run: `push`, what every
// push runs (the files under its budget by their kept times, test/small, the specs not yet timed, the sentinels), or
// `rest`, everything else; `all`, the full suite, which CI runs nightly and on demand; `browser`, the browser specs;
// `quarantine`, the specs held out of all of them (test/quarantine.json), run only by the optional quarantine workflow.
//   bun scripts/test-lane.ts push|rest|all|browser|quarantine [--sum]
import { Glob } from 'bun';
import { readFileSync } from 'node:fs';

interface Held { files: Record<string, { since: string; why: string; lower: string }> }
interface Lanes { push: { under: number; sentinels: Record<string, string>; away?: Record<string, string> } }
class TestLane {
  static run(args: string[]): number {
    const lane = args.find(a => !a.startsWith('--')) ?? 'push';
    const lanes = JSON.parse(readFileSync('test/lanes.json', 'utf8')) as Lanes;
    const kept = (JSON.parse(readFileSync('test/timings.json', 'utf8')) as { files: Record<string, number> }).files;
    // Browser specs are their own job's (KYRIE_BROWSER), and skip without it.
    const held = Object.keys((JSON.parse(readFileSync('test/quarantine.json', 'utf8')) as Held).files);
    const every = [...new Glob('test/**/*.test.ts').scanSync('.')].sort();
    const gone = held.filter(s => !every.includes(s));
    if (gone.length) { console.error(`test/quarantine.json names specs that are not there: ${gone.join(' ')}`); return 1; }
    if (lane === 'quarantine' || lane === 'browser') {
      return this.print(lane === 'quarantine' ? held : every.filter(s => this.browser(s) && !held.includes(s)), lane,
        kept, args);
    }
    const specs = every.filter(s => !this.browser(s) && !held.includes(s));
    const missing = Object.keys(lanes.push.sentinels).filter(s => !specs.includes(s));
    if (missing.length) { console.error(`test/lanes.json names specs that are not there: ${missing.join(' ')}`); return 1; }
    const pushed = specs.filter(s => this.pushed(s, kept, lanes));
    const chosen = lane === 'all' ? specs : lane === 'rest' ? specs.filter(s => !pushed.includes(s)) : pushed;
    return this.print(chosen, lane, kept, args);
  }
  private static browser(spec: string): boolean { return /-browser\.test\.ts$/.test(spec); }
  private static print(chosen: string[], lane: string, kept: Record<string, number>, args: string[]): number {
    if (args.includes('--sum')) {
      const minutes = chosen.reduce((n, s) => n + (kept[s] ?? 0), 0) / 60000;
      console.log(`${lane}: ${chosen.length} files, ${minutes.toFixed(0)} kept CI-minutes`);
    } else { console.log(chosen.join('\n')); }
    return 0;
  }
  private static pushed(spec: string, kept: Record<string, number>, lanes: Lanes): boolean {
    const ms = kept[spec];
    // Kept off the push lane by name, with the reason (a measure of time that a loaded runner fails): nightly only.
    if (spec in (lanes.push.away ?? {})) { return false; }
    return spec.startsWith('test/small/') || ms === undefined || ms < lanes.push.under || spec in lanes.push.sentinels;
  }
}
process.exit(TestLane.run(process.argv.slice(2)));
