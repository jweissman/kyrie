#!/usr/bin/env bun
// The marks a client derives for itself instead of reading the frame (the owner, 26 November: "we definitely need to
// move everything to scanning one tree"; AGENTS.md, one projection; OR-1071). Every mark a client draws (a likeness and
// the company's faces, an Atlas pip, the gold, a lens's mark, the map's lead) should be a node of the engine's frame,
// read as it is; each place in a client (web/reader, src/cli) that composes one from its own inputs is a parallel
// derivation: leaves made from the client's own lookups (Fold's constructors), witnesses or indicators read directly
// (Attest, Indicator, Emphasis), and faces chosen from the paintings (the portrait readers). Counted by file; each
// count may only fall. Held by test/small/frame-marks against doc/architecture/mission-22-beta/frame-marks.json.
//   bun scripts/frame-marks.ts [--write]
import { readFileSync, writeFileSync } from 'node:fs';
import { Glob } from 'bun';

export class FrameMarks {
  static readonly file = 'doc/architecture/mission-22-beta/frame-marks.json';
  static readonly scope = ['web/reader/**/*.{ts,tsx}', 'src/cli/**/*.ts'];
  static readonly derived = new RegExp(['\\bFold\\.(of|leaf|likeness|step|led)\\(', '\\bAttest\\.\\w+\\(',
    '\\bIndicator\\.(of|tells|words)\\(', '\\bEmphasis\\.\\w+\\(',
    '\\b(CompanyPortraits|CreaturePortraits|Portraits|Likeness|Sittings)\\.\\w+\\('].join('|'), 'g');
  static count(root = '.'): Record<string, number> {
    const out: Record<string, number> = {};
    const files = this.scope.flatMap(g => [...new Glob(g).scanSync(root)]).filter(f => !/\.test\.tsx?$/.test(f));
    for (const f of [...new Set(files)].sort()) {
      const n = readFileSync(`${root}/${f}`, 'utf8').split('\n').filter(l => !l.trim().startsWith('//'))
        .reduce((a, l) => a + [...l.matchAll(this.derived)].length, 0);
      if (n) { out[f] = n; }
    }
    return out;
  }
  static total(counts: Record<string, number>): number { return Object.values(counts).reduce((a, n) => a + n, 0); }
  static main(args: string[]): number {
    const counts = this.count();
    for (const [f, n] of Object.entries(counts)) { console.log(`${String(n).padStart(3)}  ${f}`); }
    console.log(`total ${this.total(counts)}`);
    if (args.includes('--write')) {
      writeFileSync(this.file, `${JSON.stringify({ about: 'Marks a client derives for itself instead of reading the '
        + 'frame, by file (scripts/frame-marks.ts); each may only fall (test/small/frame-marks).', counts }, null, 1)}\n`);
      console.log(`written: ${this.file}`);
    }
    return 0;
  }
}

if (import.meta.main) { process.exit(FrameMarks.main(process.argv.slice(2))); }
