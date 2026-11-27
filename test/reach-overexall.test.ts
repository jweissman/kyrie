import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

const campaign = 'data/campaigns/overexall.campaign.json';
const buyer = async (seed: string) => {
  const j = await Journey.start(campaign, seed);
  j.assert('befell', 'ash_count_begun');
  Placed.at(j, 'overexall__field');
  await j.play('=+1');
  expect(j.holds('at', 'overexall__ox_sleat', 'overexall__field')).toBe(true);
  return j;
};

describe('Over Exall, under the count', () => {
  it('keeps a coin bound into the fleece on the bell\'s clapper', async () => {
    const j = await Journey.start(campaign, 'reach-overexall-coin');
    Placed.at(j, 'overexall__bell_chamber');
    await j.play('=+1', 'Unwind the fleece from the bell');
    expect(j.holds('holding', 'party', 'count_coin')).toBe(true);
  }, 9000);

  it('a shamed Saley will not sell the Lodger to the Ash\'s engineer', async () => {
    const j = await buyer('reach-overexall-shamed');
    j.assert('overexall__saleyShamed', 'party');
    await j.play('=+1');
    expect(j.holds('overexall__oxSleatGone', 'party')).toBe(true);
    expect(j.holds('at', 'overexall__ox_sleat', 'overexall__field')).toBe(false);
  }, 9000);

  it('a whale struck while he waits goes east on his carts', async () => {
    const j = await buyer('reach-overexall-struck');
    j.assert('overexall__struck', 'party');
    await j.play('=+1');
    expect(j.holds('overexall__oxSold', 'party')).toBe(true);
  }, 9000);

  it('a company on the Ash board can take his silver, and the Tarpaulin knows it', async () => {
    const j = await buyer('reach-overexall-paid');
    j.assert('befell', 'company_sworn_ash');
    await j.play('=+1', 'Take Sleat\'s silver');
    expect(j.holds('overexall__oxPaid', 'party')).toBe(true);
    expect(j.offers('Cut the cable on Sleat')).toBe(true);
  }, 9000);
});
