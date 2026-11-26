import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Frontier } from '../src/world/frontier';
import { GeneratedWorld } from './support/generated';

// OR-540 in the world it was found in: kite's life begun in debt is carried (DebtShapes' carry: a purse for the
// creditor, purse_kind), and the Lull, reached by its gate, declares a purse_kind of its own (Haskett's wages). Its
// install had been refused as it was read; now it is installed beside the debt, its purse its installation's own. And
// wren, begun in the same process after kite, reaches the Lull too. The rule is proved small in
// test/small/kinds-two-modules; this is the world's case, for the night.
const party = [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }];
const lull = async (world: string) => {
  const s = await DrawnWorld.start(world, { origin: 'debt', party }, NodeBundleSource.shared);
  await GeneratedWorld.travel(s, 'gate_lull'); await new Frontier(world, NodeBundleSource.shared).expand(s.campaign);
  return s;
};
const purses = (s: Awaited<ReturnType<typeof lull>>) => [...new Set(s.campaign.world.related('itemKind')
  .map(c => c.args[1]!).filter(k => k.endsWith('purse_kind')))].sort();

describe('the Lull reached from a life begun in debt', () => {
  it('installs beside the debt\'s purse in kite, and again in wren after it', async () => {
    const kite = await lull('kite');
    expect(purses(kite)).toEqual(['plull__purse_kind', 'purse_kind']);
    expect(kite.campaign.catalog.definition('plull__purse_kind')?.value).toBe(30);
    expect(kite.campaign.catalog.definition('purse_kind')?.value).toBe(0);
    const wren = await lull('wren');
    expect(wren.campaign.installed).toContain('plull');
  }, 300000);
});
