import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Itineraries } from '../src/ui/itinerary';

// A place the company has been told the way to is somewhere it can set out for, over the open country as it was told:
// the debt's next old place in a1, Marsh Howe, known by name and by its way, had no journey to it, and the gold was
// lost at the creditor's (R10-17).
describe('a way told', () => {
  it('is a journey over the open country it was told of', async () => {
    const s = await DrawnWorld.start('a1', { origin: 'debt', party: [{ name: 'X', raceId: 'human', classId: 'warrior' }] },
      NodeBundleSource.shared);
    const c = s.campaign;
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'region__w10_named') }]));
    expect(Itineraries.plan(c, 'region__w10')).toBeUndefined();
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'region__w10_found') }]));
    expect(Itineraries.plan(c, 'region__w10')?.legs.length).toBeGreaterThan(0);
  }, 120000);
});
