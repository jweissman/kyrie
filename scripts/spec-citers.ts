#!/usr/bin/env bun
// The rows that cite a changed spec, for reopening (MT-19; mission-22/closure-review-method.md, pattern 4: a spec
// rewritten under a later ruling while the row it closed stayed closed, as R11-01's talk-numbers came to pin the
// opposite). From the files changed since a base (`git diff --name-only <base>`, and what is not yet committed), each
// spec by its own name (foo for test/foo.test.ts, test/small/foo.test.ts, test/features/x/foo.pin.test.ts), and every
// row of the register and its archive whose what or status cell names it: the author of the change reads each again.
//   bun scripts/spec-citers.ts [base]        base defaults to HEAD (what is changed and not committed)
import { execSync } from 'node:child_process';
import { basename } from 'node:path';
import { RegisterTickets, type Row } from './register-tickets';

export interface Citer { spec: string; name: string; rows: Pick<Row, 'id' | 'state'>[] }

export class SpecCiters {
  // A spec's own name, or nothing for a file that is not a spec.
  static name(file: string): string | undefined {
    return /\.test\.ts$/.test(file) ? basename(file).replace(/(\.pin)?\.test\.ts$/, '') : undefined;
  }
  // A row names a spec where the name stands as its own word: not inside a longer hyphenated name or a path's stem.
  static cites(row: Pick<Row, 'what' | 'status'>, name: string): boolean {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?<![\\w-])${escaped}(?![\\w]|-[a-z0-9])`).test(`${row.what} ${row.status}`);
  }
  static citers(files: string[], rows: Row[]): Citer[] {
    return files.flatMap(spec => {
      const name = this.name(spec);
      if (!name) { return []; }
      return [{ spec, name, rows: rows.filter(r => this.cites(r, name)).map(r => ({ id: r.id, state: r.state })) }];
    });
  }
  static changed(base: string): string[] {
    const out = execSync(`git diff --name-only ${base}`, { cwd: RegisterTickets.root, encoding: 'utf8' });
    return [...new Set(out.split('\n').map(l => l.trim()).filter(Boolean))];
  }
  static main(argv: string[]): number {
    const base = argv[0] ?? 'HEAD', found = this.citers(this.changed(base), RegisterTickets.rows(RegisterTickets.text()));
    if (!found.length) { console.log(`no spec changed since ${base}`); return 0; }
    for (const c of found) {
      const closed = c.rows.filter(r => r.state === 'closed').length;
      console.log(`${c.spec}: ${c.rows.length} rows cite ${c.name} (${closed} closed)`);
      for (const r of c.rows) { console.log(`  ${r.id}\t${r.state}`); }
    }
    return 0;
  }
}

if (import.meta.main) { process.exit(SpecCiters.main(process.argv.slice(2))); }
