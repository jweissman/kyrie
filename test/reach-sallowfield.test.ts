import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

const campaign = 'data/campaigns/sallowfield.campaign.json';
const purser = async (seed: string) => {
  const j = await Journey.start(campaign, seed);
  j.assert('befell', 'ash_count_begun');
  await j.play('=day 1 16:30');
  expect(j.holds('at', 'sallowfield__sf_purser', 'sallowfield__parley_stone')).toBe(true);
  Placed.at(j, 'sallowfield__parley_stone');
  return j;
};

describe('Sallowfield, under the count', () => {
  it('keeps a coin pegged into the oldest beam of the bell-frame', async () => {
    const j = await Journey.start(campaign, 'reach-sallowfield-coin');
    Placed.at(j, 'sallowfield__bell_loft');
    for (let i = 0; i < 4 && !j.holds('holding', 'party', 'count_coin'); i++) {
      await j.play('Feel along the oldest beam');
    }
    expect(j.holds('holding', 'party', 'count_coin')).toBe(true);
  }, 9000);

  it('lets the purser deliver his fire-pots to Wyre if nothing is done, and the bridge is harder for it', async () => {
    const j = await purser('reach-sallowfield-pots');
    await j.play('=day 2 18:00');
    expect(j.holds('sallowfield__sfPotsDelivered', 'party')).toBe(true);
  }, 9000);

  it('can fall on the purser\'s cart', async () => {
    const j = await purser('reach-sallowfield-fight');
    const prose = await j.play('Fall on the purser');
    expect(prose).toMatch(/come at you/);
  }, 9000);

  it('a captain whose debts were heard may send the purser home', async () => {
    let refused = false;
    for (let i = 0; i < 8 && !refused; i++) {
      const j = await purser(`reach-sallowfield-wyre-${i}`);
      j.put('sallowfield__wyre', 'sallowfield__parley_stone');
      j.assert('sallowfield__owedHeard', 'party');
      await j.play('Tell the captain what the purser');
      expect(j.holds('sallowfield__sfWyreAsked', 'party')).toBe(true);
      refused = j.holds('sallowfield__sfWyreRefused', 'party');
      if (refused) {
        expect(j.holds('at', 'sallowfield__sf_purser', 'sallowfield__parley_stone')).toBe(false);
        await j.play('=day 2 18:00');
        expect(j.holds('sallowfield__sfPotsDelivered', 'party')).toBe(false);
      }
    }
    expect(refused).toBe(true);
  }, 9000);

  it('pays a company on the Ash board to leave the ford dark', async () => {
    const j = await purser('reach-sallowfield-sold');
    j.assert('befell', 'company_sworn_ash');
    await j.play('Take Thewlis');
    expect(j.holds('sallowfield__sfSold', 'party')).toBe(true);
    expect(j.offers('Fall on the purser')).toBe(false);
  }, 9000);
});
