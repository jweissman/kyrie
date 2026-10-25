import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// A way under the ground is told as it is there: no sun, no dew, no shadows lengthening, whatever the hour above. A
// way out of the ground into the open is told by the hour and the sky as any other.
describe('a journey under the ground', () => {
  it('is told without the hour or the sky, and the way out into the field with them', async () => {
    const j = await Journey.start('test/fixtures/probes/underground-way/probe.campaign.json', 'under');
    await j.play('=60', '^To the lower gallery');
    const below = j.taken.at(-1)!.page;
    expect(below).not.toMatch(/sun|dew|shadow|light already|sky|rain|dust/i);
    expect(below).toMatch(/dark|stone|lamplight|no hour/i);
    await j.play('^Out to the field above|^To the field above');
    expect(j.taken.at(-1)!.page).not.toMatch(/no hour and no weather|by lamplight|dark closes behind you/);
  }, 60000);
});
