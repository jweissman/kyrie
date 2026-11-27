import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

const campaign = 'data/campaigns/raingourd.campaign.json';

describe('The Rain-Gourd, under the count', () => {
  it('keeps a coin in the lip of the fall, for whoever has been behind it', async () => {
    const j = await Journey.start(campaign, 'reach-raingourd-coin');
    Placed.at(j, 'raingourd__pool');
    await j.play('=+1');
    expect(j.offers('Reach back in behind the fall for the green glint in the lip')).toBe(false);
    j.assert('raingourd__firstWater', 'party');
    await j.play('=+1');
    expect(j.offers('Reach back in behind the fall for the green glint in the lip')).toBe(true);
  }, 9000);

  it('the Ash factor wants the full gourd for his casks, and the rain sends him away', async () => {
    const j = await Journey.start(campaign, 'reach-raingourd-factor');
    j.assert('befell', 'ash_count_begun');
    await j.play('To the waterfront at Palla');
    expect(j.holds('at', 'raingourd__rg_factor', 'raingourd__waterfront')).toBe(true);
    const seized = await j.play("To Oyelle's door", 'Ask Oyelle about the gourd', 'Offer to carry the gourd',
      'To the waterfront at Palla', 'To the long beach', 'To the cane valley', 'To the path through the cane',
      'To the pool under the falls', 'Fill the gourd from the pool', 'To the path through the cane', 'To the cane valley',
      'To the long beach', 'To the waterfront at Palla');
    expect(j.holds('raingourd__rgSeized', 'party')).toBe(true);
    expect(seized).toMatch(/Two coppers, since it is cold.*come at you/s);

    const calm = await Journey.start(campaign, 'reach-raingourd-oyelle');
    calm.assert('befell', 'ash_count_begun');
    await calm.play('To the waterfront at Palla', "To Oyelle's door", 'Ask Oyelle about the gourd', 'Offer to carry the gourd',
      'Ask Oyelle whether she would come down', 'To the waterfront at Palla', 'To the bathing cove', 'Ask Tobi about the ledge',
      'Ask him to come with you', 'To the waterfront at Palla', 'To the long beach', 'To the cane valley',
      'To the path through the cane', 'To the pool under the falls', 'Follow Tobi in along the ledge', 'To the path through the cane',
      'To the cane valley', 'To the long beach', 'To the waterfront at Palla', "To Oyelle's door", 'Help Oyelle down the goat-track');
    expect(calm.holds('raingourd__rgSeized', 'party')).toBe(false);
    await calm.play('Hold the gourd for Oyelle', 'Wait and watch', 'Wait and watch');
    expect(calm.holds('state', 'raingourd__sky', 'raingourd__rain_sky')).toBe(true);
    expect(calm.holds('raingourd__rgFactorGone', 'party')).toBe(true);
    expect(calm.holds('at', 'raingourd__rg_factor', 'raingourd__waterfront')).toBe(false);
  }, 9000);
});
