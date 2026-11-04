import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Low Water's LWR-02: someone a rule turned hostile fell on the company at once. Re-examined for the process audit
// (4 November): turned by withdrawing their tolerance, one whose temperament warns first warns, and the company has
// its turn (to fight, to ask to be let by, to warn them off, to go) before they strike; `Assert assails` is still the
// form for one who falls on at once (test/fixtures/probes/turns-on).
describe('someone turned against the company', () => {
  it('warns before they strike, and the company has its turn', async () => {
    const j = await Journey.start('test/fixtures/probes/turns-on/probe.campaign.json', 't');
    const told = await j.play('Tell Ruff his cattle are thin');
    expect(told).toContain("'Say that again,' he says, 'and see.'");
    expect([j.holds('warned', 'ruff', 'party'), j.holds('assails', 'ruff', 'party')]).toEqual([true, false]);
    expect(j.offers('Warn Ruff off')).toBe(true);
    expect(await j.play('Wait')).toContain('Ruff comes at you');
  }, 30000);
});
