import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Liberty of the Ice's 22 (ICE-21): a territorial band put where the company stood warned it at once, before the
// module could say how it came. One who comes where the company stands is said to come, in their own words
// (`Arrives`), as they come, and warns after; the company coming to them is not their coming.
describe('one who comes where the company stands', () => {
  const probe = 'test/fixtures/probes/arrives/probe.campaign.json';
  it('is said to come in their own words, before they warn', async () => {
    const j = await Journey.start(probe);
    await j.play('Wait › An hour', 'Wait › An hour');
    expect(j.taken[0]!.page).toBe('Four grey shapes come down off the downs onto the ice, one behind another, and sit'
      + ' across the road.');
    expect(j.taken[1]!.page).toMatch(/^The wolves get up, without hurry/);
  }, 30000);
  it('is not said to come where the company goes to them', async () => {
    const j = await Journey.start(probe);
    await j.play('the downs');
    expect(j.page).not.toMatch(/come down off the downs/);
  }, 30000);
});
