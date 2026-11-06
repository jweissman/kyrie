import { it } from 'bun:test';
import { createHash } from 'crypto';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
it('digest', async () => {
  for (const [seed, terrain] of [['thorn', 'mountain'], ['ash', 'frost']]) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { region: { terrain } });
    const body = JSON.stringify({ r: w.report.region, p: w.report.placements, c: w.report.contacts });
    console.log('DIGEST', seed, createHash('sha256').update(body).digest('hex').slice(0, 16), (w.report.region as any).provinces?.length);
  }
}, 120000);
