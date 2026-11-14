import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';

// Rats killed unasked are no job done: no pay is owed, nor "the rest" of one, nor a job said to have ended (round 6:
// I 144, J 38 and 41, told of the rest of the pay from Tuck and the ways past where a job ended, having taken none).
describe('the corn-store rats, unasked', () => {
  it('owes no pay and speaks of no job', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign, rats = c.module.entities.find(e => /^region__s1_u_rats$/.test(e.id))!.id;
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('able', rats) }]));
    await s.perform('wait');
    const aims = (ScreenModel.build(c).aims ?? []).map(a => a.text).join(' | ');
    expect(aims).not.toMatch(/rest of the pay|Ten coin are yours/);
    expect(aims).not.toMatch(/where the job ended/);
  }, 120000);
});
