// The ultrafast suite: the spec files that start no world (the census's "none" or a declared horizon,
// scripts/spec-horizons.ts) and that took under a quarter of a second when the timings were last kept
// (test/timings.json), run in the fast mode (--no-isolate: a worker keeps one module registry across the files it
// runs, so the engine is imported once a worker, not once a file; isolated, an empty spec file costs some 300 ms).
// It is meant to be done in under five seconds, a check to run on every save, and says how long it took. A spec that
// leaks state into another shows here first; one it leaves out is not slow or unsafe by that.
//   bun scripts/test-ultrafast.ts [seconds=0.25] [--workers=6]
import { readFileSync } from 'node:fs';
import { SpecHorizons } from './spec-horizons';
import { TestWorkers } from './test-workers';

class UltrafastSuite {
  static run(args: string[]): number {
    const limit = Number(args.find(a => !a.startsWith('--')) ?? 0.25) * 1000;
    const workers = /^--workers=(\d+)$/.exec(args.find(a => a.startsWith('--workers=')) ?? '')?.[1] ?? '6';
    const kept = (JSON.parse(readFileSync('test/timings.json', 'utf8')) as { files: Record<string, number> }).files;
    const specs = SpecHorizons.specs().filter(s => kept[s] !== undefined && kept[s] < limit
      && ['none', 'horizon'].includes(SpecHorizons.of(s)));
    console.log(`${specs.length} spec files under ${limit / 1000} s each that start no world`);
    const began = performance.now();
    const code = Bun.spawnSync(['bun', 'test', `--parallel=${TestWorkers.allowed(Number(workers))}`, '--no-isolate',
      '--timeout=5000', ...specs.map(s => `./${s}`)], { stdout: 'inherit', stderr: 'inherit' }).exitCode ?? 1;
    console.log(`the ultrafast suite: ${((performance.now() - began) / 1000).toFixed(1)} s`);
    return code;
  }
}
process.exit(UltrafastSuite.run(process.argv.slice(2)));
