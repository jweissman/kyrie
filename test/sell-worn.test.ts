import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';

// Selling what someone of the company has on or in hand is asked about first: a bard's only crossbow had gone at one
// key, and a companion's armour sat on the counter with the rest (round 7).
describe('a sale of what is in hand', () => {
  it('asks first, saying who would go without it', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign, shop = c.world.one('at', 'region__s2_merchant')!;
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', shop) }]));
    const text = JSON.stringify(ScreenModel.build(c));
    expect(text).toContain('sell_ware(region__party_1__longsword');
    expect(text).toContain('"grave":"Ralf would go without it"');
  }, 120000);
});
