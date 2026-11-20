import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { ModuleWriter } from '../src/lang/module-writer';
import { Undertakings } from '../src/presentation/undertakings';

// Finished things leave (FH-05, HP-01): a job paid is gone from the aims, and the notice it was read on stays a lead
// only while a job on it is still to be had. It had stayed in the Notes after every job on it was paid.
describe('the notice on the well-post, its jobs paid', () => {
  it('keeps the aims few, and is let go once nothing on it is left', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse(['--world', 'a1', '--as', 'human/warrior/Aud']));
    const c = j.campaign, held = () => Undertakings.held(c).map(o => o.id);
    const notes = () => j.screen().knowledge.map(k => k.text).filter(t => /^A notice on the post by the well/.test(t));
    const leads = () => (j.screen().leads ?? []).map(l => l.id);
    for (const step of ['To the landing at Lowmouth', 'Read the notice', 'To Mik\'s salt-house', 'Talk to Mik',
      'Ask Mik about the rats', 'Take your leave', 'To the landing at Lowmouth', 'To the old corn-store',
      'a torch: Light', 'Down to the corn-store cellar', 'To the rat-runs']) { await j.step(step); }
    await j.step('Attack');
    await j.step('To the nest');
    await j.step('Attack');
    for (const step of ['To the rat-runs', 'To the corn-store cellar', 'Up to the old corn-store',
      'To the landing at Lowmouth', 'To Mik\'s salt-house', 'Talk to Mik', 'Tell Mik the rats']) { await j.step(step); }
    // Paid: nothing of the rats is held, the aims are few, and the notice is still a lead for its other jobs.
    expect(held().filter(id => /_u_rats_/.test(id))).toEqual([]);
    expect(held().length).toBeLessThanOrEqual(3);
    expect(notes()).toHaveLength(1);
    expect(leads()).toContain('region__s1_u_notice');
    // Every other job on it paid as well (as if done), and the notice leaves the Notes and the leads.
    const jobs = c.module.actions.map(a => /^(region__s1_u_\w+_job)_ask$/.exec(a.id)?.[1]).filter(x => !!x);
    expect(jobs.length).toBeGreaterThanOrEqual(3);
    c.commitWorld(c.world.apply(jobs.map(id => ({ kind: 'assert' as const,
      call: ModuleWriter.call('region__s1_u_paid', id!) }))));
    await j.step('Take your leave');
    expect(notes()).toEqual([]);
    expect(leads()).not.toContain('region__s1_u_notice');
  }, 180000);
});
