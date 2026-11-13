import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SrdPages } from '../src/cli/srd-pages';

// The Revised (v.3.5) SRD's monsters and spells as reference values (src/cli/srd-pages.ts reads them): bun
// scripts/srd-extract.ts <a directory holding github.com/olimot/srd-v3.5's monsters and spells pages>.
const dir = process.argv[2]!, out = process.argv[3] ?? 'data/sources/srd35';
const files = readdirSync(dir).filter(f => f.endsWith('.html'));
const provenance = { url: 'https://github.com/olimot/srd-v3.5', commit: 'faab739130921026db42b96e6adff6d3661bffbd',
  licence: 'Open Game License v1.0a (System Reference Document, Wizards of the Coast)' };
const monsters = Object.fromEntries(files.filter(f => f.startsWith('monsters-')).sort()
  .flatMap(f => SrdPages.monsters(f, readFileSync(join(dir, f), 'utf8'))));
const spells = Object.fromEntries(files.filter(f => /^spells-/.test(f)).sort()
  .flatMap(f => SrdPages.spells(f, readFileSync(join(dir, f), 'utf8'))));
writeFileSync(join(out, 'monsters.json'), JSON.stringify({ about: 'Revised (v.3.5) SRD monster stat blocks as '
  + 'reference values (scripts/srd-extract.ts); never read by play.', source: provenance, monsters }, null, 1) + '\n');
writeFileSync(join(out, 'spells.json'), JSON.stringify({ about: 'Revised (v.3.5) SRD spells as reference values '
  + '(scripts/srd-extract.ts); never read by play.', source: provenance, spells }, null, 1) + '\n');
console.log(Object.keys(monsters).length, 'monsters;', Object.keys(spells).length, 'spells');
