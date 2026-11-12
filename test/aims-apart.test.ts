import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Undertakings } from '../src/presentation/undertakings';
import { ScreenModel } from '../src/ui/screen-model';

// A job asked after in the town is an aim of its own, not told under another aim for naming the same town: in the
// Notes, under "Lay the dead in the crypt … and find out who raised them", followed, stood "Ask Peren about the old
// quarry: its gate is locked", the spiders' job (round 9, Q).
describe('the notice\'s jobs', () => {
  it('stand apart from the crypt\'s aim followed', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'X', raceId: 'human', classId: 'warrior' }] },
      NodeBundleSource.shared);
    const c = s.campaign, id = (suf: string) => c.module.entities.find(e => e.id.endsWith(suf))!.id;
    const given = id('_u_dead_job').replace(/_u_dead_job$/, '_u_given');
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call(given, id('_u_dead_job')) },
      { kind: 'assert', call: ModuleWriter.call('knows', 'party', id('_u_notice')) }]));
    Undertakings.follow(c, c.module.objectives!.find(o => o.id.endsWith('_u_dead_job_aim'))!.id);
    const aims = ScreenModel.build(c).aims!, crypt = aims.find(a => a.id.endsWith('_u_dead_job_aim'))!;
    expect((crypt.about ?? []).join(' ')).not.toMatch(/quarry|corn-store/);
    expect(aims.some(a => a.id.endsWith('_u_spiders_job_sought'))).toBe(true);
  }, 90000);
});
