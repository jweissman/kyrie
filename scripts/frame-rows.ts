#!/usr/bin/env bun
// The player's rows asked for outside the frame (platform-separation.md, the trust thread, adopted by the owner on 25
// November): one row set per player revision, built by the frame (src/presentation/player-frame.ts) and read by every
// consumer, so that player-facing meaning is derived once. Each other place that asks PlayerView.choices for itself
// derives its own; they are counted by file, product code (src, web) and tools (scripts) apart, and each count may
// only fall. Held by test/small/frame-rows against doc/architecture/mission-22-beta/frame-rows.json.
//   bun scripts/frame-rows.ts [--write]
import { readFileSync, writeFileSync } from 'node:fs';
import { Glob } from 'bun';

export class FrameRows {
  static readonly file = 'doc/architecture/mission-22-beta/frame-rows.json';
  // The one builder: where the rows are asked for, once per revision.
  static readonly builder = 'src/presentation/player-frame.ts';
  static readonly asked = /\bPlayerView\.choices\(/g;
  // Each file's asks, outside comments: "src/presentation/glance.ts" → 2.
  static count(root = '.'): Record<string, number> {
    const out: Record<string, number> = {};
    const files = ['src/**/*.ts', 'web/**/*.{ts,tsx}', 'scripts/**/*.ts'].flatMap(g => [...new Glob(g).scanSync(root)]);
    for (const f of files.sort()) {
      if (f === this.builder) { continue; }
      const n = readFileSync(`${root}/${f}`, 'utf8').split('\n').filter(l => !l.trim().startsWith('//'))
        .reduce((a, l) => a + [...l.matchAll(this.asked)].length, 0);
      if (n) { out[f] = n; }
    }
    return out;
  }
  static total(counts: Record<string, number>, product: boolean): number {
    return Object.entries(counts).filter(([f]) => f.startsWith('scripts/') !== product).reduce((a, [, n]) => a + n, 0);
  }
  static main(args: string[]): number {
    const counts = this.count();
    for (const [f, n] of Object.entries(counts)) { console.log(`${String(n).padStart(3)}  ${f}`); }
    console.log(`product ${this.total(counts, true)}, tools ${this.total(counts, false)}`);
    if (args.includes('--write')) {
      writeFileSync(this.file, `${JSON.stringify({ about: 'PlayerView.choices asked outside the frame builder, by '
        + 'file (scripts/frame-rows.ts); each may only fall (test/small/frame-rows).', counts }, null, 1)}\n`);
      console.log(`written: ${this.file}`);
    }
    return 0;
  }
}

if (import.meta.main) { process.exit(FrameRows.main(process.argv.slice(2))); }
