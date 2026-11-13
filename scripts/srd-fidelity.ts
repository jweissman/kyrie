import { readFileSync, writeFileSync } from 'node:fs';
import { SrdEncounters } from '../src/cli/srd-encounters';
import { SrdFidelityReport } from '../src/cli/srd-fidelity-report';
import type { Encounters } from '../src/cli/srd-encounters';

// The SRD fidelity census (doc/architecture/mission-21/rules/srd-fidelity.md): bun scripts/srd-fidelity.ts, from the
// catalog and the kept encounters; with --encounters, where a player meets each kind is measured again first (a
// world assembled for a1 and each of six countries: minutes, not seconds).
const kept = 'data/sources/srd35/encounters.json', out = 'doc/architecture/mission-21/rules/srd-fidelity.md';
if (process.argv.includes('--encounters')) {
  writeFileSync(kept, JSON.stringify({ about: 'Where a player meets each kind: a1\'s hostile groups as real play writes '
    + 'them, and the dens of six generated countries (scripts/srd-fidelity.ts --encounters).',
  ...await SrdEncounters.measure() }, null, 1) + '\n');
}
const encounters = JSON.parse(readFileSync(kept, 'utf8')) as Encounters;
writeFileSync(out, SrdFidelityReport.markdown(encounters));
console.log(SrdFidelityReport.headline(encounters));
