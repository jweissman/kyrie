import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { AutoplayRun } from '../src/autoplay/run';

// An autoplay policy keeps an engagement as a player must (OR-166; OR-163): while someone warns the company off where
// it stands, what a policy is offered is what the engaged frame offers (Doable's rows), not the campaign's whole
// offer, which had kept every wait and the search under Ruff's eye; and no journey. Where nothing warns, as it was.
describe('an autoplay policy, engaged', () => {
  it('is offered only the answers to the one warning it off, and no journey', async () => {
    const j = await Journey.start('test/fixtures/probes/turns-on/probe.campaign.json', 't');
    const before = AutoplayRun.situation(j.session, 0).offered.map(o => o.id);
    expect(before.some(id => id.startsWith('wait_'))).toBe(true);
    await j.play('Tell Ruff his cattle are thin');
    expect(j.holds('warned', 'ruff', 'party')).toBe(true);
    const engaged = AutoplayRun.situation(j.session, 1);
    const offered = engaged.offered.map(o => o.id);
    expect(offered.filter(id => /^(wait_|search\(|camp|sleep)/.test(id))).toEqual([]);
    expect(offered.some(id => id.startsWith('attack(') && id.includes('ruff'))).toBe(true);
    expect(offered).toContain('wait');
    expect(engaged.destinations).toEqual([]);
  }, 30000);
});
