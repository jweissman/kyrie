// The laboratory (M21's consolidated priority 3): the first town's undertown, rendered from its template
// (data/generation/town/undertown.kyrt) for Lowmouth on its host (test/fixtures/laboratory/host.kyr), written whole to
// test/fixtures/laboratory/lowmouth.kyr, which `bin/kyrie run` and `bin/kyrie play` play as a module alone. The same
// render every time; test/small/laboratory holds the file to it. Regenerate with
//   bun scripts/laboratory.ts [--company 1]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { KyrTemplates } from '../src/world/kyr-template';
import { RegionUndertown } from '../src/world/region-undertown';

export class Laboratory {
  static readonly dir = join(import.meta.dir, '../test/fixtures/laboratory');
  static readonly file = join(this.dir, 'lowmouth.kyr');
  static text(company = 1): string {
    const values = RegionUndertown.values('low', 'Lowmouth', company,
      { merchant: 'low_shop', priest: 'low_chapel', innkeeper: 'low_taproom' });
    const sections = KyrTemplates.choose(RegionUndertown.template, 'laboratory:low:undertown');
    const host = readFileSync(join(this.dir, 'host.kyr'), 'utf8').split('\n').filter(l => !l.startsWith('//'));
    return ['// Written by scripts/laboratory.ts from test/fixtures/laboratory/host.kyr and',
      '// data/generation/town/undertown.kyrt: edit those, not this.',
      'Module lab "The undercroft at Lowmouth" {', ...host.filter(l => l.trim()),
      ...sections.flatMap(x => KyrTemplates.fill(x.lines, values)), ...RegionUndertown.notice('low', sections, values),
      '}', ''].join('\n');
  }
  static main() {
    const i = process.argv.indexOf('--company'), company = i >= 0 ? Number(process.argv[i + 1]) : 1;
    writeFileSync(this.file, this.text(company));
    console.error(`wrote ${this.file}`);
  }
}
if (import.meta.main) { Laboratory.main(); }
