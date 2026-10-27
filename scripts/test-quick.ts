#!/usr/bin/env bun
// The quick suite: every spec file that took under twenty seconds when the suite's timings were last kept
// (test/timings.json, kept by `bun run test:timings`), run in parallel. These are the ordinary specs, without the
// journeys through whole adventures; a file the timings do not know yet is new, and is run. About a minute and a half
// on sixteen cores, where the whole suite takes twelve.
//   bun scripts/test-quick.ts [seconds]
import { Glob } from 'bun';
import { readFileSync } from 'node:fs';

const limit = Number(process.argv[2] ?? 20) * 1000;
const kept = (JSON.parse(readFileSync('test/timings.json', 'utf8')) as { files: Record<string, number> }).files;
const files = [...new Glob('test/**/*.test.ts').scanSync('.')].sort()
  .filter(file => (kept[file] ?? 0) < limit).map(file => `./${file}`);
console.log(`${files.length} files under ${limit / 1000} s each`);
const run = Bun.spawnSync(['bun', 'test', '--parallel', '--timings=test/timings.json', ...files],
  { stdout: 'inherit', stderr: 'inherit' });
process.exit(run.exitCode ?? 1);
