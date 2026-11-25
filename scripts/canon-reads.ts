#!/usr/bin/env bun
// Direct reads of Canon outside the setting, by the layer that makes them and what each reads, classed by the owner it
// is meant to have (an external analysis adopted by the lead, 24 November, platform-separation.md: the runtime and the
// player reach for an ambient domain; each read is classified before any is moved, and the count only falls). Held by
// test/small/canon-reads against doc/architecture/mission-22-beta/canon-reads.json.
//   bun scripts/canon-reads.ts [--write]
import { readFileSync, writeFileSync } from 'node:fs';
import { Glob } from 'bun';

type Layer = 'runtime' | 'player' | 'client' | 'tools';
export class CanonReads {
  static readonly file = 'doc/architecture/mission-22-beta/canon-reads.json';
  // What each of Canon's members is, so its readers know where it is meant to come from.
  static readonly owners: Record<string, string> = {
    traits: 'fantasy-rules', classes: 'fantasy-rules', abilities: 'fantasy-rules', conditions: 'fantasy-rules',
    ancestries: 'fantasy-rules', skills: 'fantasy-rules', backgrounds: 'fantasy-rules', species: 'fantasy-rules',
    isSpecies: 'fantasy-rules', creature: 'fantasy-rules', rules: 'fantasy-rules', isBody: 'fantasy-rules',
    items: 'catalog (fantasy-rules data, a runtime item port)', resolve: 'catalog (a runtime id port)',
  };
  static layer(f: string): Layer | undefined {
    if (/^src\/(lang|canon|world)\//.test(f)) { return undefined; }
    if (/^src\/(session|presentation|ui|creation|narrative)\//.test(f)) { return 'player'; }
    if (f.startsWith('web/')) { return 'client'; }
    if (f.startsWith('src/cli/')) { return 'tools'; }
    return 'runtime';
  }
  // Each layer's reads, by member: "runtime traits".
  static count(): Record<string, number> {
    const out: Record<string, number> = {};
    const files = [...new Glob('src/**/*.ts').scanSync('.'), ...new Glob('web/**/*.{ts,tsx}').scanSync('.')];
    for (const f of files) {
      const l = this.layer(f);
      if (!l) { continue; }
      for (const m of readFileSync(f, 'utf8').matchAll(/\bCanon\.(\w+)/g)) {
        const key = `${l} ${m[1]}`;
        out[key] = (out[key] ?? 0) + 1;
      }
    }
    return Object.fromEntries(Object.entries(out).sort((a, b) => b[1] - a[1]));
  }
  static main(args: string[]): number {
    const counts = this.count(), by: Record<string, number> = {};
    for (const [k, n] of Object.entries(counts)) { const l = k.split(' ')[0]!; by[l] = (by[l] ?? 0) + n; }
    for (const [k, n] of Object.entries(counts)) {
      console.log(`${String(n).padStart(4)}  ${k.padEnd(28)} → ${this.owners[k.split(' ')[1]!] ?? 'to classify'}`);
    }
    console.log(Object.entries(by).map(([l, n]) => `${l} ${n}`).join(', '));
    if (args.includes('--write')) {
      writeFileSync(this.file, `${JSON.stringify({ about: 'Direct Canon reads outside the setting, by layer and '
        + 'member (scripts/canon-reads.ts); each may only fall (test/small/canon-reads).', counts }, null, 1)}\n`);
    }
    return 0;
  }
}

if (import.meta.main) { process.exit(CanonReads.main(process.argv.slice(2))); }
