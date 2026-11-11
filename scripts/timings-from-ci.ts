// The time each spec file took in a CI run, kept in test/timings.json, by which the suite's shards are balanced (bun
// test --shard --timings). A file with no time kept falls with every other such file to one shard, which then runs
// long: forty files added in Mission 20 had none, and shard 4 ran to forty-three minutes against twenty-four (the
// consolidated register's TC-01). Each shard keeps its JUnit report as an artifact (junit-shard-N, see ci.yml); this
// reads them all from a run and writes each file's time, its whole time with its setup, in milliseconds.
//   bun scripts/timings-from-ci.ts <run id>          only files with no time kept
//   bun scripts/timings-from-ci.ts <run id> --all    every file the run timed
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

interface Timings { version: number; files: Record<string, number> }
export class TimingsFromCi {
  static readonly path = 'test/timings.json';
  // Each file's whole time, from its file-level suite (bun names it by the file).
  static times(xml: string): Map<string, number> {
    const out = new Map<string, number>();
    for (const m of xml.matchAll(/<testsuite\b([^>]*)>/g)) {
      const name = /\bname="([^"]*)"/.exec(m[1]!)?.[1], file = /\bfile="([^"]*)"/.exec(m[1]!)?.[1];
      const time = Number(/\btime="([^"]*)"/.exec(m[1]!)?.[1]);
      if (name && name === file && Number.isFinite(time)) { out.set(file, Math.round(time * 1000)); }
    }
    return out;
  }
  static merge(kept: Timings, times: Map<string, number>, all: boolean): { timings: Timings; changed: number } {
    const files = { ...kept.files };
    let changed = 0;
    for (const [file, ms] of times) {
      if (all || files[file] === undefined) { files[file] = ms; changed++; }
    }
    return { timings: { ...kept, files }, changed };
  }
  static main(args: string[]): number {
    const run = args.find(a => /^\d+$/.test(a));
    if (!run) { console.error('usage: bun scripts/timings-from-ci.ts <run id> [--all]'); return 2; }
    const dir = mkdtempSync(join(tmpdir(), 'kyrie-junit-'));
    try {
      const got = Bun.spawnSync(['gh', 'run', 'download', run, '--pattern', 'junit-shard-*', '--dir', dir]);
      if (got.exitCode !== 0) { console.error(got.stderr.toString()); return 1; }
      const times = new Map<string, number>();
      for (const shard of readdirSync(dir)) {
        for (const [file, ms] of this.times(readFileSync(join(dir, shard, 'junit.xml'), 'utf8'))) { times.set(file, ms); }
      }
      const kept = JSON.parse(readFileSync(this.path, 'utf8')) as Timings;
      const { timings, changed } = this.merge(kept, times, args.includes('--all'));
      writeFileSync(this.path, `${JSON.stringify(timings, null, 2)}\n`);
      console.log(`${times.size} files timed in run ${run}; ${changed} written to ${this.path}`);
      return 0;
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
}
if (import.meta.main) { process.exit(TimingsFromCi.main(process.argv.slice(2))); }
