// Review probe: some seeds assemble a generated country that then fails to load.
// Run from the repository root: bun doc/architecture/next-phase-independent-review/evidence/unloadable-seeds.ts
import { WorldAssembler } from '../../../../src/world/world-assembler';
import { Campaign } from '../../../../src/campaign/campaign';
import { NodeBundleSource } from '../../../../src/campaign/node-bundle-source';
const seeds = process.argv.slice(2).length ? process.argv.slice(2) : [...Array(40).keys()].map(i => `s${i}`).concat('alpha');
let failed = 0;
for (const seed of seeds) {
  const world = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
  const unsituated = world.report.region.sites.filter(s => s.cell === undefined).map(s => s.id);
  try { await Campaign.load(world.path, seed, world.source); console.log(`${seed}: loads`); }
  catch (e) { failed++; console.log(`${seed}: FAILS (${(e as Error).message}); sites without a cell: ${unsituated.join(',')}`); }
}
console.log(`${failed} of ${seeds.length} seeds fail to load`);
