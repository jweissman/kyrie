import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';

// The PL-07 placements in a1 (the lead's decisions of 13 November, doc/architecture/mission-21/rules/placements.md):
// no work's den holds a single of a kind that dens two or more; the vault under the first town is kept by the barrow
// ghoul alone, not Orsino's ghoul, and the ossuary's brood is Orsino's still; and the spiders of the old workings are
// told at the adit, before the gallery, to anyone with a light (in a quarry that has them).
describe('the first fights of a1, as placed', () => {
  const start = () => PlayTool.start(PlayTool.parse(['--world', 'a1', '--as', 'human/warrior/Wat'])).then(s => s.journey);
  it('places the barrow ghoul in the vault alone, Orsino\'s in the ossuary, and every den at least a pair', async () => {
    const j = await start(), creatures = j.campaign.readout.creatures;
    const of = (group: string) => creatures.filter(c => c.id.replace(/_person(_\d+)?$/, '') === `region__${group}`);
    expect(of('s1_u_keeper').map(c => [c.raceId, c.base.maxHp])).toEqual([['ghoul/barrow', 13]]);
    // As many as the company is one or more (a brood is two for a company, one for one alone), Orsino's each.
    expect(of('s1_u_dead').map(c => c.raceId)).toEqual(['ghoul']);
    const dens = [...new Set(creatures.map(c => c.id.replace(/_person(_\d+)?$/, '')).filter(id => id.endsWith('_denned')))];
    expect(dens.length).toBeGreaterThan(3);
    for (const den of dens) { expect([den, of(den.replace(/^region__/, '')).length >= 2]).toEqual([den, true]); }
  }, 120000);
  // In kahitude, whose quarry has the spiders (a1's has the she-bear since the pit's second cause).
  it('tells the spiders at the adit, before the gallery', async () => {
    const j = await PlayTool.start(PlayTool.parse(['--world', 'kahitude', '--as', 'human/warrior/Wat']))
      .then(s => s.journey);
    // The notice read first: a job is asked after only by one who has heard of it (OR-370).
    for (const step of ['To the landing at Thornhaven', 'Read the notice', 'Into the Stormy Horn', 'Ask .* about the old quarry',
      'To the landing at Thornhaven', 'To the old quarry pit', '^Down to the quarry adit$', 'a candle: Light']) {
      await j.step(step);
    }
    expect(j.latest).toMatch(/Things hang in the web across the cutting ahead/);
  }, 120000);
});
