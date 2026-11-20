import { describe, expect, it } from 'bun:test';
import { ModuleWriter } from '../src/lang/module-writer';
import { Glanced } from './support/glanced';
import { Undertakings } from '../src/presentation/undertakings';
import { SceneModel } from '../src/ui/scene';

// Whom an open job names, found (the owner's play, 6 November: the merchant who gives the corn-store's key was one of
// many equal faces, and nothing on the green led to him; M19-86). The aim followed that names a person leads the page
// to where they stand, where the company knows the place, and among those there they are met first.
describe('whom an open job names', () => {
  it('leads from the green toward the merchant with the corn-store\'s key, and puts him first where he is', async () => {
    const g = await Glanced.country('kite'), c = g.campaign;
    await g.to('region__s2_green');
    await g.choose(/^region__s2_u_notice_read\(/);
    // The notice's jobs are leads (HP-01): the job taken on and done, its aim names him, to be told and paid.
    const job = 'region__s2_u_rats_job';
    c.commitWorld(c.world.apply(['given', 'done', 'nest_cleared'].map(r => ({ kind: 'assert' as const,
      call: ModuleWriter.call(`region__s2_u_${r}`, job) }))));
    Undertakings.follow(c, 'region__s2_u_rats_job_owed_whole');
    const glance = await g.choose(/^wait$/);
    const shop = c.world.one('at', 'region__s2_merchant')!;
    // The way the page leads with (Go… opens on it) is toward his shop, not out along the road toward the drover (the
    // page had led out).
    const ways = [...glance.acts.map(a => a.choice), ...glance.ways];
    const led = ways.flatMap(id => g.screen.exits.filter(e => id === e.id || id.startsWith(`${e.id}/`)))[0];
    expect(led?.destination.id).toBe(shop);
    await g.to(shop);
    const first = SceneModel.build(g.screen).subjects.find(x => x.kind === 'person');
    expect([first?.id, first?.stake]).toEqual(['region__s2_merchant', true]);
  }, 120000);
});
