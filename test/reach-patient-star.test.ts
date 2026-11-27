import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

const campaign = 'data/campaigns/the-patient-star.campaign.json';
const factor = async (seed: string) => {
  const j = await Journey.start(campaign, seed);
  j.assert('befell', 'ash_count_begun');
  Placed.at(j, 'season__weighing');
  await j.play('=+1');
  expect(j.holds('at', 'season__ps_factor', 'season__weighing')).toBe(true);
  return j;
};

describe('The Patient Star, under the count', () => {
  it('keeps a coin under the loose step in Old Quell', async () => {
    const j = await Journey.start(campaign, 'reach-star-coin');
    Placed.at(j, 'season__old_quell');
    for (let i = 0; i < 4 && !j.holds('holding', 'party', 'count_coin'); i++) {
      await j.play('Dig under the loose step');
    }
    expect(j.holds('holding', 'party', 'count_coin')).toBe(true);
  }, 9000);

  it('crowds the company out of the draw and sends the Ash\'s cutters down the Well', async () => {
    const j = await factor('reach-star-crowded');
    j.assert('season__entered', 'party');
    await j.play('=day 6 07:30');
    expect(j.holds('season__psCrowded', 'party')).toBe(true);
    expect(j.holds('season__entered', 'party')).toBe(false);
    expect(j.holds('at', 'season__ps_cutters', 'season__watch_room')).toBe(true);
    j.put('party', 'season__watch_room');
    expect(await j.play('=+1')).toMatch(/Licensed|come at you/);
  }, 9000);

  it('lets Pike sort the drum when shown the slips are in one hand', async () => {
    let exposed = false;
    for (let i = 0; i < 8 && !exposed; i++) {
      const j = await factor(`reach-star-shown-${i}`);
      await j.play('Show Pike');
      exposed = j.holds('season__psExposed', 'party');
      if (exposed) {
        j.assert('season__entered', 'party');
        await j.play('=day 6 07:30');
        expect(j.holds('season__psCrowded', 'party')).toBe(false);
      }
    }
    expect(exposed).toBe(true);
  }, 9000);

  it('buys a sworn company\'s place in the draw', async () => {
    const j = await factor('reach-star-sold');
    j.assert('befell', 'company_sworn_ash');
    j.assert('season__entered', 'party');
    await j.play('Sell Orrage');
    expect(j.holds('season__psSold', 'party')).toBe(true);
    expect(j.holds('season__entered', 'party')).toBe(false);
  }, 9000);
});
