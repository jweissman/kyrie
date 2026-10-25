import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Two adventures written apart, in one world: The Long Man's Merrowdale to the north of a crossroads, Low Water's Bowl
// of Ammerlin to the south. Neither names the other. What passes between them is what passes between any two places:
// a thing carried. The bell-teeth prised out of the Long Man's wheels are, to Teodor Halm of the Collegium, teeth from
// a counting wheel, the same family of machine as the one under the Mere.
describe('Merrowdale and Ammerlin', () => {
  it('installs both, each its own, and carries the Long Man\'s bell-teeth to Halm, who knows them', async () => {
    const j = await Journey.start('test/fixtures/merrow-to-ammerlin/merrow-to-ammerlin.campaign.json', 'between');
    const ids = j.campaign.module.entities.map(e => e.id);
    expect(ids).toContain('longman__undercroft');
    expect(ids).toContain('lowwater__undercroft');
    await j.play('^To the end of the south road', '^To Merrow green', '^To the Hall yard', '=118', '^Into the Hall cellar', '^Take from',
      '^Out to the Hall yard', '^To Merrow green', 'end of the south road', 'the crossroads',
      'north road, at the Rim', '^To the head of the Stair', '^To Measures Square', '^Into the Full Measure', '=218');
    expect(j.holds('carries', 'party', 'longman__teeth')).toBe(true);
    await j.play('Sell .*bell-teeth');
    expect(j.taken.at(-1)!.told + ' ' + j.taken.at(-1)!.page).toContain('Teeth from a counting wheel');
    expect(j.holds('lowwater__halmHasTeeth', 'lowwater__halm')).toBe(true);
  }, 300000);
});
