import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import { GeneratedWorld } from './support/generated';

// The lodger the innkeeper tells of, "out after dark with grave-dirt on his boots", is found: a company told of him
// sees him by night going down the crypt stair, where a night watching the churchyard had said "Nothing comes"
// (round 9, Q: R9-02, E211). In a1's first town, the churchyard after dark.
describe('the innkeeper\'s lodger', () => {
  it('is seen by night crossing the churchyard, once the company has been told of him', async () => {
    const s = await DrawnWorld.start('a1', { origin: 'debt', party: [{ name: 'X', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign, id = (suf: string) => c.module.entities.find(e => e.id.endsWith(suf))!.id;
    const seen = () => ScreenModel.build(c).observed.map(o => o.id).filter(o => o.endsWith('_u_lodger_goes'));
    GeneratedWorld.put(s, id('_u_yard').replace(/^region__/, ''));
    await s.leg('wait_for_dark');
    expect(seen()).toEqual([]);
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', id('_u_dead_lodger')) }]));
    expect(seen()).toHaveLength(1);
  }, 120000);
});
