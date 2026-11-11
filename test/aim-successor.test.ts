import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Undertakings } from '../src/presentation/undertakings';
import { Glanced } from './support/glanced';

// The aim chosen goes on into its own next part, whatever else arises beside it (the owner's play of 11 November: the
// rats chosen and killed, two aims arose, the nest and the old ways beyond, and the page had fallen back to the
// errand, the father, with no way gold): the nest is followed, still the player's choice, and something leads to it.
describe('a chosen aim, its part done', () => {
  it('is followed on into the same job’s next part, not given up for the errand', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'home', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign, call = ModuleWriter.call, t = 'region__s1_u';
    c.commitWorld(c.world.apply([{ kind: 'assert', call: call(`${t}_given`, `${t}_rats_job`) },
      { kind: 'retract', call: call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: call('at', 'party', `${t}_cellar`) }]));
    Undertakings.follow(c, `${t}_rats_job_aim`);
    // What the fight won brings, as a command's end reads it: the job's part done, the run seen.
    const before = Undertakings.held(c).map(o => o.id);
    c.commitWorld(c.world.apply([{ kind: 'assert', call: call('knows', 'party', `${t}_rats_source`) },
      { kind: 'assert', call: call(`${t}_done`, `${t}_rats_job`) },
      { kind: 'assert', call: call(`${t}_done`, `${t}_onward`) }]));
    expect(Undertakings.held(c).map(o => o.id))
      .toEqual(expect.arrayContaining([`${t}_rats_job_run`, `${t}_onward_sought`]));
    Undertakings.after(c, before);
    expect(Undertakings.followed(c)?.id).toBe(`${t}_rats_job_run`);
    expect(Undertakings.chosen(c)).toBe(true);
    // In the dark of the cellar, a light first; then the way down the run is the aim's, and carries it on.
    const light = Glanced.of(s).glance.acts.find(a => a.why === 'dark')!;
    await s.perform(light.command ?? light.choice);
    const g = Glanced.of(s);
    expect(g.glance.following ?? []).toContain('exit:region__s1_u_warren');
    expect(g.glance.acts.some(a => a.continues)).toBe(true);
  }, 120000);
});
