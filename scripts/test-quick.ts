#!/usr/bin/env bun
// The quick suite: the spec files that took under two seconds each when the suite's timings were last kept
// (test/timings.json, kept by `bun run test:timings`), on six workers. Truly quick, and the same set every time: the
// ordinary units, not the journeys through whole adventures. A spec the timings do not know is left out and said to
// be, so that a slow new spec cannot make the quick suite slow (it had come to twenty minutes, with 268 specs
// untimed); keep the timings again when specs are added. What a change touches is `bun run test:changed`; everything
// is CI's.
//   bun scripts/test-quick.ts [seconds=2] [--workers=6]
import { Glob } from 'bun';
import { readFileSync } from 'node:fs';

class QuickSuite {
  // The small worlds (test/small: a rule on a tiny Kyr world, test/support/tiny.ts) are quick by what they are, and in
  // it whether timed or not: a new one is in the quick suite from its first run.
  private static small(spec: string): boolean { return spec.startsWith('test/small/'); }
  static run(args: string[]): number {
    const limit = Number(args.find(a => !a.startsWith('--')) ?? 2) * 1000;
    const workers = /^--workers=(\d+)$/.exec(args.find(a => a.startsWith('--workers=')) ?? '')?.[1] ?? '6';
    const kept = (JSON.parse(readFileSync('test/timings.json', 'utf8')) as { files: Record<string, number> }).files;
    const specs = [...new Glob('test/**/*.test.ts').scanSync('.')].sort();
    const quick = specs.filter(s => this.small(s) || (kept[s] !== undefined && kept[s] < limit)).map(s => `./${s}`);
    const untimed = specs.filter(s => !this.small(s) && kept[s] === undefined).length;
    console.log(`${quick.length} spec files under ${limit / 1000} s each`
      + (untimed ? `; ${untimed} not yet timed, left out (bun run test:timings keeps them)` : ''));
    // --no-isolate: each worker keeps one module registry across the files it runs, so the engine is imported once a
    // worker, not once a file: 34 s and 321 CPU-s had become 9.6 s, all 663 tests passing in runs at 4, 6 and 10
    // workers (mission-20/test-loop.md, item 1). A spec that leaks state into another shows here first.
    return Bun.spawnSync(['bun', 'test', `--parallel=${workers}`, '--no-isolate', '--timeout=30000', ...quick],
      { stdout: 'inherit', stderr: 'inherit' }).exitCode ?? 1;
  }
}
process.exit(QuickSuite.run(process.argv.slice(2)));
