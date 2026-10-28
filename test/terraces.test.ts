import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Low Water's 16 (AUT-11): a level had to sit in a site or a building, so Ammerlin's terraces were written as steps,
// and a site's name would have labelled every way in. A level of a town is a terrace: walked onto from the town's
// gate ("To the quay", not "Into the Dyers' Terrace by the gate road"), open to the sky, and a stair joins it to the
// terrace above.
describe('a town on terraces', () => {
  it('is walked onto and up, its ways named by where they come', async () => {
    const j = await Journey.start('test/fixtures/probes/terraces/probe.campaign.json');
    const ways = () => j.choices().filter(c => c.full.startsWith('Ways on')).map(c => c.label);
    expect(ways()).toEqual(['To the quay']);
    await j.play('To the quay', "To the Dyers' Walk");
    expect(ways()).toEqual(['To the quay', 'To the market']);
    expect(j.holds('indoors', 'p__walk')).toBe(false);
    expect(j.holds('settled', 'p__walk')).toBe(true);
    await j.play('To the market');
    expect(j.at('party')).toBe('p__market');
  }, 30000);
});
