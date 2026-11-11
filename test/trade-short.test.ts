import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';

// What a trader would buy and has not the coin for is said, not left out (round 6: a dead man's box, a string of rings
// and thieves' tools dropped off a trader's list after four sales, still in the pack, and nothing said why).
describe('a trader short of coin', () => {
  it('keeps what they would buy on the counter, with what they would give, until they have it', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign, member = c.world.related('memberOf').find(r => r.args[1] === 'party')!.args[0]!;
    const mirror = 'region__w9_barrow_recess2_casket_gift', dealer = 'region__s1_merchant';
    const gold = ModuleWriter.call('quantity', dealer, 'gold');
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__s1_shop') },
      { kind: 'assert', call: ModuleWriter.call('ownedItem', mirror, member) },
      { kind: 'set', call: gold, value: ModuleWriter.number(0) }]));
    const counter = () => ScreenModel.build(c).trade.find(t => t.id === dealer)!;
    expect(counter().short).toEqual([expect.objectContaining({ pays: 12 })]);
    c.commitWorld(c.world.apply([{ kind: 'set', call: gold, value: ModuleWriter.number(100) }]));
    expect(counter().short).toBeUndefined();
  }, 120000);
});
