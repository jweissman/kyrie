import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// An ending is of a module the company has come into: a company that never left Wending Cross was ended by Pentrice's
// verdict, from a city it had never entered (Gosse's Company's friction, GOS-06).
describe('an ending of a place the company never came to', () => {
  const probe = 'test/fixtures/probes/never-there/probe.campaign.json';
  it('is not reached while the company is elsewhere', async () => {
    const j = await Journey.start(probe, 'k');
    await j.play('=4');
    expect(j.campaign.running).toBe(true);
    expect(j.page).not.toContain('The Bench gives its verdict');
  }, 60000);
  it('is reached once the company comes there', async () => {
    const j = await Journey.start(probe, 'k');
    await j.play('>city__road_end');
    expect(j.campaign.running).toBe(false);
    expect(j.taken.at(-1)!.page).toContain('The Bench gives its verdict.');
  }, 60000);
});
