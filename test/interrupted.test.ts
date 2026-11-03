import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// A watch kept in the dark is broken off by what comes to it, told as it is heard there, not as a light giving out:
// sitting with Agnes in the dark, the moth's coming was told "Your light gives out" (Half the Hive's friction 15).
describe('an activity broken off', () => {
  it('in the dark, by what comes, is told as what is heard of it', async () => {
    const j = await Journey.start('test/fixtures/probes/interrupted/probe.campaign.json', 'k');
    await j.play('Sit in the dark');
    expect(j.taken.at(-1)!.page).toBe('Something pats along the wall in the dark, and stops close by.');
    expect(j.watch()).toBe(2);
  }, 60000);
});
