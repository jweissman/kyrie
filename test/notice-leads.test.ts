import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Undertakings } from '../src/presentation/undertakings';

// A notice gives leads, not aims (HP-01, the maturity track's step L): reading the well-post's notice had made each
// job on it a held aim at once, three new aims from one look. Now the notice is a lead in the Notes, the jobs said on
// it by name, and a job is an aim only when the one who gives it is asked. Each giver's question is offered without
// the notice, so every job can still be found.
describe('the notice on the well-post', () => {
  it('teaches leads, and asking a giver makes that job an aim', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse(['--world', 'a1', '--as', 'human/warrior/Aud']));
    const held = () => Undertakings.held(j.campaign).map(o => o.id);
    await j.step('To the landing at Lowmouth');
    const before = held();
    await j.step('Read the notice');
    expect(held()).toEqual(before);
    expect(j.screen().knowledge.map(k => k.text))
      .toContainEqual(expect.stringMatching(/^A notice on the post by the well/));
    for (const step of ['To Mik\'s salt-house', 'Talk to Mik', 'Ask Mik about the rats']) { await j.step(step); }
    expect(held().filter(id => !before.includes(id))).toEqual(['region__s1_u_rats_job_aim']);
    // Every job's question waits on the notice, or on the trouble seen for oneself (OR-370: the first town's jobs
    // uncovered, not handed out; it had been asked of its giver by anyone who walked in).
    const asks = j.campaign.module.actions.filter(a => /_u_\w+_job_ask$/.test(a.id));
    expect(asks.length).toBeGreaterThanOrEqual(3);
    for (const a of asks) { expect(JSON.stringify(a.requires)).toContain('_u_notice'); }
  }, 120000);
});
