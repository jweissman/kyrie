#!/usr/bin/env bun
// The three clients held to one another at every step (OR-1450; doc/architecture/mission-22-beta/engine-focus.md §6):
// the page (its engine and its own step machine), the terminal and the runner, from one checkpoint, given the same
// commands (test/support/three-clients). The world and the place are held equal outright by test/focus-parity; whom
// each attends to and the question's rows and marks are read against the page's, and today's differences kept as a
// baseline that only falls, each step of engine-owned focus (OR-1451 onward) removing its own.
//   bun scripts/focus-parity.ts            the differences
//   bun scripts/focus-parity.ts --write    the baseline written from them
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ThreeClients } from '../test/support/three-clients';

export class FocusParity {
  static readonly root = join(import.meta.dir, '..');
  static readonly baseline = 'doc/architecture/mission-22-beta/focus-parity-baseline.json';
  static kept(): string[] {
    return (JSON.parse(readFileSync(join(this.root, this.baseline), 'utf8')) as { apart: string[] }).apart;
  }
  static async run(args: string[]): Promise<number> {
    const { apart } = await ThreeClients.walk();
    if (args.includes('--write')) {
      writeFileSync(join(this.root, this.baseline), `${JSON.stringify({ apart }, null, 1)}\n`);
      console.log(`${apart.length} differences written`);
      return 0;
    }
    console.log(apart.join('\n'));
    return 0;
  }
}
if (import.meta.main) { process.exit(await FocusParity.run(process.argv.slice(2))); }
