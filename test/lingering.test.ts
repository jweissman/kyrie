import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Third Night's friction 15 (TTN-15): nothing could be said "after a while" at a place without keeping by hand
// when the company came. lingered(party) is how many watches it has stood where it is (test/fixtures/probes/lingering).
describe('after a while at a place', () => {
  it('counts the watches stood there, from naught on coming', async () => {
    const j = await Journey.start('test/fixtures/probes/lingering/probe.campaign.json', 'l');
    await j.play('Wait › A while', 'Wait › A while');
    expect(j.measure('lingered', 'party')).toBeGreaterThanOrEqual(2);
    await j.play('To the platform under the rail');
    expect(j.measure('lingered', 'party')).toBe(0);
    let told = '';
    for (let i = 0; i < 4 && !/looks down at you/.test(told); i++) { told = await j.play('Wait › A while'); }
    expect(told).toMatch(/looks down at you/);
    expect(j.measure('lingered', 'party')).toBe(3);
  }, 30000);
});
