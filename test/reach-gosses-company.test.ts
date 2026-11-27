import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

describe('Gosse’s Company, under the count', () => {
  it('finds the press-room coin, and the bailiff who came for the costumes takes the Ash count out of the Soke', async () => {
    const quiet = await Journey.start('data/campaigns/gosses-company.campaign.json', 'reach-gosses-coin');
    Placed.at(quiet, 'pentrice__press_room');
    await quiet.play('=+1', 'Lift the loose screw beside the blank forme');
    expect(quiet.holds('pentrice__gcCoinFound', 'party')).toBe(true);
    expect(quiet.holds('holding', 'party', 'count_coin')).toBe(true);

    const j = await Journey.start('data/campaigns/gosses-company.campaign.json', 'reach-gosses-ash');
    j.assert('befell', 'ash_count_begun');
    j.assert('pentrice__bailiffWarned', 'pentrice__grimsditch');
    Placed.at(j, 'pentrice__westgate');
    await j.play('=+1');
    expect(j.holds('at', 'pentrice__gc_sergeant', 'pentrice__westgate')).toBe(true);
    await j.play('Ask Grimsditch to take the Ash count outside the Soke');
    expect(j.holds('pentrice__gcBailiffWay', 'party')).toBe(true);
    expect(j.holds('at', 'pentrice__gc_sergeant', 'pentrice__westgate')).toBe(false);
  }, 9000);
});
