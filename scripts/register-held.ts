#!/usr/bin/env bun
// Which rows of the register are held by a spec: of the rows whose status register-state reads as fixed, those that
// name a spec that exists (test/…, or a test/small spec by its bare name in a cell), and those that name none. A fix
// with no spec is a promise kept once (Mission 21: obligations made into fast regressions).
//   bun scripts/register-held.ts [--list]
import { existsSync, readFileSync } from 'node:fs';
import { RegisterState } from './register-state';

class RegisterHeld {
  static run(args: string[]): number {
    // Fixed as register-state reads a row's own status column (a note's "held by" elsewhere in it is not a status).
    const rows = RegisterState.rows(readFileSync('doc/architecture/open-register.md', 'utf8'));
    const fixed = rows.filter(r => RegisterState.kind(r.status) === 'fixed').map(r => r.line);
    // A fix to how the work is done (a CI timeout, evidence copied out of scratch) holds no behaviour of the game.
    const process = fixed.filter(r => /a process fix/.test(r)), game = fixed.filter(r => !process.includes(r));
    const held = game.filter(r => this.specs(r).length), bare = game.filter(r => !this.specs(r).length);
    console.log(`${rows.length} rows; ${fixed.length} say fixed (${process.length} of the process); of the game's `
      + `${game.length}, ${held.length} name a spec that exists, ${bare.length} name none`);
    if (args.includes('--list')) { for (const r of bare) { console.log(`  ${r.split(' | ')[0]!.replace('| ', '')}`); } }
    return 0;
  }
  // The specs a row names: test/x(.test.ts), small/x, or a spec's name in backquotes (`gold-thread`), in test/ or
  // test/small/: a word that only happens to be a spec's name (voice, follow) is not a spec named.
  private static specs(row: string): string[] {
    const words = [...row.matchAll(/(?:\btest\/|\bsmall\/|`(?:test\/)?)((?:small\/)?[a-z][a-z0-9-]+)(?:\.test\.ts)?/g)]
      .map(m => m[0].startsWith('small/') ? `small/${m[1]}` : m[1]!);
    return [...new Set(words.flatMap(w => [`test/${w}.test.ts`, `test/small/${w}.test.ts`]))].filter(f => existsSync(f));
  }
}
process.exit(RegisterHeld.run(process.argv.slice(2)));
