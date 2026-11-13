#!/usr/bin/env bun
// Which rows of the register are held by a spec: of the rows whose status says fixed (or held, or mended), those that
// name a spec that exists (test/…, or a test/small spec by its bare name in a cell), and those that name none. A fix
// with no spec is a promise kept once (Mission 21: obligations made into fast regressions).
//   bun scripts/register-held.ts [--list]
import { existsSync, readFileSync } from 'node:fs';

class RegisterHeld {
  static run(args: string[]): number {
    const rows = readFileSync('doc/architecture/open-register.md', 'utf8').split('\n')
      .filter(l => /^\| [A-Z][A-Z0-9]*-[0-9A-Z]+ \|/.test(l));
    const fixed = rows.filter(r => /\b(fixed|held|mended)\b/i.test(r.split(' | ').slice(2).join(' | ')));
    const held = fixed.filter(r => this.specs(r).length), bare = fixed.filter(r => !this.specs(r).length);
    console.log(`${rows.length} rows; ${fixed.length} say fixed; ${held.length} name a spec that exists, ${bare.length} name none`);
    if (args.includes('--list')) { for (const r of bare) { console.log(`  ${r.split(' | ')[0]!.replace('| ', '')}`); } }
    return 0;
  }
  // The specs a row names: test/x(.test.ts), and test/small's by the name they are given in the row.
  private static specs(row: string): string[] {
    const named = [...row.matchAll(/\btest\/([a-z0-9/-]+?)(?:\.test\.ts)?\b/g)].map(m => `test/${m[1]}.test.ts`);
    const small = [...row.matchAll(/\b(small\/[a-z0-9-]+)\b/g)].map(m => `test/${m[1]}.test.ts`);
    return [...named, ...small].filter(f => existsSync(f));
  }
}
process.exit(RegisterHeld.run(process.argv.slice(2)));
