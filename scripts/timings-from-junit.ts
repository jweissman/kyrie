#!/usr/bin/env bun
// The suite's kept times, as a whole run's JUnit reports measured them: each file's time, summed over its cases, for
// the shards to be balanced by (bun test --timings). The kept times had grown stale: one file kept at 45 minutes
// that a run took 19 for, and the shards no longer balanced. Run on the reports of a full run, downloaded with
// `gh run download <run> -D <dir>`.
//   bun scripts/timings-from-junit.ts <dir> [test/timings.json]
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export class TimingsFromJunit {
  static main(args: string[]): number {
    const [dir, out = 'test/timings.json'] = args;
    if (!dir) { console.error('usage: bun scripts/timings-from-junit.ts <dir> [test/timings.json]'); return 1; }
    const files: Record<string, number> = {};
    for (const report of this.reports(dir)) {
      const xml = readFileSync(report, 'utf8');
      // A file's own suite only (its name is its path): the describes within it carry the file too.
      for (const m of xml.matchAll(/<testsuite name="([^"]+)" file="([^"]+)"[^>]*\btime="([\d.]+)"/g)) {
        if (m[1] === m[2]) { files[m[2]!] = Math.round((files[m[2]!] ?? 0) + Number(m[3]) * 1000); }
      }
    }
    const sorted = Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b)));
    writeFileSync(out, `${JSON.stringify({ version: 1, files: sorted }, null, 2)}\n`);
    console.log(`${Object.keys(sorted).length} files kept in ${out}`);
    return 0;
  }
  private static reports(dir: string): string[] {
    return readdirSync(dir).flatMap(name => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? this.reports(path) : name.endsWith('.xml') ? [path] : [];
    });
  }
}
if (import.meta.main) { process.exit(TimingsFromJunit.main(process.argv.slice(2))); }
