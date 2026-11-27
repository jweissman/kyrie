import { ItemCatalog } from '../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import { RunnerOffer } from '../src/cli/runner-offer';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Carriers } from '../src/ui/carriers';
import { Runner, type Said } from '../src/cli/runner';

// The general store at Porthalen (cold play 4, CL-50): its wares had been folded under Marjory Ashby's talk, so that
// only its haggling showed (they are hers, within her talk, since OR-801, and all of them are there); every ware was
// "for Carlin", a hireling carrying a third of what she could, once the one who plays had come up out of a barrow
// with a few things more; and it had not said where food is to be had.
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const act = (id: string) => JSON.stringify({ act: id });

describe('the general store at Porthalen', () => {
  it('offers its wares off the shelf, says where food is, and hands a ware to the one who buys it', async () => {
    const s = await DrawnWorld.start('iscoed', { origin: 'drove',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared);
    const r = new Runner(s);
    const store = said(await r.ask(act('go(region__s1_general_door,region__s1_general)')));
    // That food is not bought here, naming no tradesman a town may lack (a drawn town's descriptions, test/named-held).
    expect(store.scene.lines.join(' ')).toContain('Meal and lamp-oil are not sold here.');
    // Its wares are Marjory Ashby's, bought within her talk (OR-801: a trader's wares are the trader's), all of them
    // there and not its haggling alone.
    const talk = [...store.offer.primary, ...store.offer.rest].find(o => o.id === 'region__s1_general_keeper#talk')!;
    expect(talk).toBeDefined();
    const within = said(await r.ask(act(talk.id)));
    const buys = [...within.offer.primary, ...within.offer.rest]
      .filter(o => RunnerOffer.act(o).startsWith('buy_item('));
    expect(buys.map(o => o.label)).toContainEqual(expect.stringMatching(/^Buy a backpack/));
    for (const line of ['go(region__s1_general_door,region__s1_green)', 'go(region__s1_inn_door,region__s1_taproom)',
      'region__s1_traveller_brings', 'recruit(region__s1_traveller)']) { said(await r.ask(act(line))); }
    // Eight small things than the hireling, as from a barrow: counted, they had handed her everything after.
    const world = s.campaign.world, party = s.campaign.playerActor!, wenna = 'region__member_party_1';
    const small = world.related('forSale').map(f => f.args[0]!)
      .filter(i => /_(candle|flint_and_steel|sack|chalk|soap)_\d+$/.test(i)).slice(0, 8);
    expect(small.length).toBe(8);
    const laden = world.apply(small.flatMap(i => [{ kind: 'retract' as const, call: ModuleWriter.call('forSale', i) },
      { kind: 'assert' as const, call: ModuleWriter.call('ownedItem', i, wenna) }]));
    expect(Carriers.carrier(ItemCatalog.canon, laden, party, 'region__s1_general_keeper_backpack_1')).toBe(wenna);
  }, 180000);
});
