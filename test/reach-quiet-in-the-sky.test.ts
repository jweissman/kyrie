import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

const campaign = 'data/campaigns/the-quiet-in-the-sky.campaign.json';
// Up on the Field a day, waiting it out by the Oven, then out to the banner lanes where the herald stands.
const herald = async (seed: string) => {
  const j = await Journey.start(campaign, seed);
  j.assert('befell', 'ash_count_begun');
  Placed.at(j, 'larum__oven');
  await j.play('=+150');
  j.put('party', 'larum__banner_lanes');
  await j.play('=+1');
  expect(j.holds('at', 'larum__lq_herald', 'larum__banner_lanes')).toBe(true);
  return j;
};

describe('The Quiet in the Sky, under the count', () => {
  it('keeps a coin under the top stones of the cairn on the highest Tooth', async () => {
    const j = await Journey.start(campaign, 'reach-quiet-coin');
    Placed.at(j, 'larum__high_cairn');
    for (let i = 0; i < 4 && !j.holds('holding', 'party', 'count_coin'); i++) {
      await j.play('Lift the top stones');
    }
    expect(j.holds('holding', 'party', 'count_coin')).toBe(true);
  }, 9000);

  it('lets the herald take a column of the dead down the Pass at the Testing if nobody answers him', async () => {
    const j = await herald('reach-quiet-march');
    j.put('party', 'larum__oven');
    await j.play('=+700');
    expect(j.holds('larum__lqMarched', 'party')).toBe(true);
  }, 9000);

  it('sends the herald down when the dead are told that a stripe would stay', async () => {
    let gone = false;
    for (let i = 0; i < 6 && !gone; i++) {
      const j = await herald(`reach-quiet-told-${i}`);
      j.assert('knows', 'party', 'larum__makings_last');
      await j.play('Tell the dead in the lanes');
      gone = j.holds('larum__lqHeraldGone', 'party');
    }
    expect(gone).toBe(true);
  }, 9000);

  it('has nothing to sell once Halvard is taken off his bier', async () => {
    const j = await herald('reach-quiet-halvard');
    j.assert('state', 'larum__halvard', 'larum__gone_ice');
    await j.play('=+1');
    expect(j.holds('larum__lqHeraldGone', 'party')).toBe(true);
    expect(j.holds('larum__lqMarched', 'party')).toBe(false);
  }, 9000);

  it('makes a ring of the dead for a fight with him', async () => {
    const j = await herald('reach-quiet-fight');
    expect(await j.play('Draw on the herald')).toMatch(/come at you|make a ring/);
  }, 9000);
});
