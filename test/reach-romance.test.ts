import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

const campaign = 'data/campaigns/romance.campaign.json';
const stripping = async (seed: string) => {
  const j = await Journey.start(campaign, seed);
  j.assert('befell', 'ash_count_begun');
  Placed.at(j, 'romance__bridge');
  await j.play('=+1');
  expect(j.holds('at', 'romance__rl_sergeant', 'romance__bridge')).toBe(true);
  return j;
};

describe('The Rose of Orlane, under the count', () => {
  it('keeps a First Count coin in the hoard, for whoever has killed the dragon', async () => {
    const j = await Journey.start(campaign, 'reach-romance-coin');
    Placed.at(j, 'romance__tower');
    await j.play('=+1');
    expect(j.offers('Pick the green disc out of the pilgrim coin')).toBe(false);
    j.assert('dead', 'romance__avarrax');
    await j.play('Pick the green disc out of the pilgrim coin');
    expect(j.holds('holding', 'party', 'count_coin')).toBe(true);
  }, 9000);

  it('the bell brought home brings Orlane down to stand on the bridge, and the armourers go', async () => {
    const j = await stripping('reach-romance-bell');
    Placed.at(j, 'romance__rose_road');
    j.assert('romance__bellReturned', 'party');
    await j.play('=+1');
    expect(j.holds('romance__rlBridgeKept', 'party')).toBe(true);
    expect(j.holds('at', 'romance__rl_sergeant', 'romance__bridge')).toBe(false);
  }, 9000);

  it('the dragon\'s crown buys the rest of the swords', async () => {
    const j = await stripping('reach-romance-crown');
    j.give('romance__briar_crown', 'party');
    await j.play('Offer Galt the briar crown');
    expect(j.holds('romance__rlBridgeKept', 'party')).toBe(true);
    expect(j.holds('holding', 'party', 'romance__briar_crown')).toBe(false);
  }, 9000);

  it('Maelin works a sword loose for a company sworn to the Rì', async () => {
    const j = await Journey.start(campaign, 'reach-romance-ri');
    j.assert('befell', 'company_sworn_ri');
    await j.play('=+1', 'Tell Maelin the company is sworn to the Rì');
    expect(j.holds('romance__rlSwordGiven', 'party')).toBe(true);
  }, 9000);
});
