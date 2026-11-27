import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

describe('Half the Hive, under the count', () => {
  it('finds the swarm coin and takes the Drewes’ way past the Ash tithe', async () => {
    const quiet = await Journey.start('data/campaigns/half-the-hive.campaign.json', 'reach-hive-coin');
    Placed.at(quiet, 'hume__gallow_hollow');
    await quiet.play('=+1');
    await quiet.play('Lift the wax seal in the Gallowtree\'s hollow');
    expect(quiet.holds('hume__hhCoinFound', 'party')).toBe(true);
    expect(quiet.holds('holding', 'party', 'count_coin')).toBe(true);

    const j = await Journey.start('data/campaigns/half-the-hive.campaign.json', 'reach-hive-ash');
    j.assert('befell', 'ash_count_begun');
    Placed.at(j, 'hume__leavers_yard');
    await j.play('=+1');
    expect(j.holds('at', 'hume__hh_factor', 'hume__leavers_yard')).toBe(true);
    await j.play('Pay the Drewes what the candles are worth, six coin');
    expect(j.holds('hume__drewesPaid', 'party')).toBe(true);
    await j.play('Ask the Drewes to hide you among the candle-moulds');
    expect(j.holds('hume__hhSheltered', 'party')).toBe(true);
    expect(j.holds('at', 'hume__hh_factor', 'hume__leavers_yard')).toBe(false);
  }, 20000);
});
