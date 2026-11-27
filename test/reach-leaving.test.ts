import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

describe('The Leaving Supper, under the count', () => {
  it('finds the eel-weir coin before the war and returns Drey’s false colours to Gannick', async () => {
    const quiet = await Journey.start('data/campaigns/leaving.campaign.json', 'reach-leaving');
    Placed.at(quiet, 'leaving__weir');
    await quiet.play('Pull the reversed nail from the eel-smokehouse plank');
    expect(quiet.holds('leaving__leaCoinFound', 'party')).toBe(true);

    const j = await Journey.start('data/campaigns/leaving.campaign.json', 'reach-leaving-war');
    j.assert('befell', 'ash_count_begun');
    Placed.at(j, 'leaving__camp');
    await j.play('=+1');
    expect(j.holds('at', 'lea_drey', 'leaving__camp')).toBe(true);
    expect(j.holds('at', 'lea_drey_guards', 'leaving__camp')).toBe(true);
    Placed.at(j, 'leaving__kitchen');
    await j.play('Search under the Bell and Barrow’s old table for the real colours');
    Placed.at(j, 'leaving__camp');
    await j.play('Show Captain Gannick the colours Drey sold');
    expect(j.holds('befell', 'turncoat_broken')).toBe(true);
  }, 20000);
});
