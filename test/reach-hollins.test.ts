import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

describe('Hollins, under the count', () => {
  it('finds the Waiting Stone coin and uses Jory’s knowledge to turn aside the scouts', async () => {
    const quiet = await Journey.start('data/campaigns/hollins.campaign.json', 'reach-hollins-coin');
    Placed.at(quiet, 'hollins__waiting_stone');
    await quiet.play('=+1');
    await quiet.play("Feel under the Waiting Stone's bent hand");
    expect(quiet.holds('hollins__hlCoinFound', 'party')).toBe(true);
    expect(quiet.holds('holding', 'party', 'count_coin')).toBe(true);

    const j = await Journey.start('data/campaigns/hollins.campaign.json', 'reach-hollins-ash');
    j.assert('befell', 'ash_count_begun');
    Placed.at(j, 'hollins__mat_tap');
    await j.play('=+1');
    expect(j.holds('at', 'hollins__hl_scout', 'hollins__mat_tap')).toBe(true);
    await j.play('Ask Jory Mudge about the house');
    await j.play('Ask Jory Mudge why Bootscrape is not glad');
    await j.play('Ask Jory Mudge to send the scouts to the empty traps');
    expect(j.holds('hollins__hlJoryDiversion', 'party')).toBe(true);
    expect(j.holds('at', 'hollins__hl_scout', 'hollins__mat_tap')).toBe(false);
  }, 20000);
});
