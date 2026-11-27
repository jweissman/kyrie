import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

describe('The Liberty of the Ice, under the count', () => {
  it('finds the cellar coin before the war and reads Pellow’s letters before the Court', async () => {
    const quiet = await Journey.start('data/campaigns/the-liberty-of-the-ice.campaign.json', 'reach-ice');
    Placed.at(quiet, 'pellam__starling_cellar');
    await quiet.play('Lift the loose brick behind the Starling cellar shelf');
    expect(quiet.holds('pellam__iceCoinFound', 'party')).toBe(true);

    const j = await Journey.start('data/campaigns/the-liberty-of-the-ice.campaign.json', 'reach-ice-war');
    j.assert('befell', 'ash_count_begun');
    Placed.at(j, 'pellam__exchange_floor');
    await j.play('=+1');
    expect(j.holds('at', 'ice_pellow', 'pellam__exchange_floor')).toBe(true);
    expect(j.holds('at', 'ice_pellow_guards', 'pellam__exchange_floor')).toBe(true);
    Placed.at(j, 'pellam__counting_house');
    await j.play('Search Pellow’s counting-house for the second wool ledger');
    await j.play('Show Master Harker Pellow’s second wool ledger');
    expect(j.holds('befell', 'councillor_broken')).toBe(true);
  }, 20000);
});
