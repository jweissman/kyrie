import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

describe('Cleave, under the count', () => {
  it('finds the old crossing coin and lets Ned divert the levy', async () => {
    const quiet = await Journey.start('data/campaigns/cleave.campaign.json', 'reach-cleave-coin');
    Placed.at(quiet, 'cleave__stub');
    await quiet.play('=+1');
    await quiet.play('Lift the old anchor-stone at the Stub');
    expect(quiet.holds('cleave__clCoinFound', 'party')).toBe(true);
    expect(quiet.holds('holding', 'party', 'count_coin')).toBe(true);

    const j = await Journey.start('data/campaigns/cleave.campaign.json', 'reach-cleave-ash');
    j.assert('befell', 'ash_count_begun');
    Placed.at(j, 'cleave__shed');
    await j.play('=+1');
    expect(j.holds('at', 'cleave__cl_counter', 'cleave__shed')).toBe(true);
    await j.play('Ask Ned what he makes of the old bridge');
    await j.play("Send Ned's basket under the Ash board");
    expect(j.holds('cleave__clDiversion', 'party')).toBe(true);
    expect(j.holds('at', 'cleave__cl_counter', 'cleave__shed')).toBe(false);
  }, 20000);
});
