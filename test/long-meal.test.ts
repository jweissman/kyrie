import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';

const campaign = 'data/adventures/tallow/long-campaign.campaign.json';
const atGarden = async () => {
  const j = await Journey.start(campaign, 'long-road');
  await j.play('To Swallet lane', 'To Swallet green', 'To the Brasiers\' garden',
    'Ask Linnet why she searches the hill');
  return j;
};

describe('A meal with Linnet', () => {
  it('makes a warm meal from a real ration and remembers it after saving', async () => {
    const j = await atGarden();
    const food = j.measure('quantity', 'party', 'rations');
    await j.play('Set aside a ration for a meal with Linnet');
    expect(j.measure('quantity', 'party', 'rations')).toBe(food - 1);
    const before = j.watch();
    await j.play('Cook the meal with Linnet');
    expect(j.watch() - before).toBe(6);
    expect(j.measure('lcMealFood', 'party')).toBe(0);
    expect(j.holds('lcMealWarm', 'party')).toBe(true);
    expect(j.page).toContain('There is still a dark patch on the bottom');
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play('To Swallet green', 'To the Brasiers\' garden');
    expect(resumed.holds('lcMealWarm', 'party')).toBe(true);
    expect(resumed.offers('Cook the meal with Linnet')).toBe(false);
    expect(resumed.offers('Share the meal cold with Linnet')).toBe(false);
  }, 120000);

  it('lets the company put the food away or eat quickly instead', async () => {
    const j = await atGarden();
    const food = j.measure('quantity', 'party', 'rations');
    await j.play('Set aside a ration for a meal with Linnet', 'Put the ration away for another time');
    expect(j.measure('quantity', 'party', 'rations')).toBe(food);
    await j.play('Set aside a ration for a meal with Linnet');
    const before = j.watch();
    await j.play('Share the meal cold with Linnet');
    expect(j.watch() - before).toBe(1);
    expect(j.measure('quantity', 'party', 'rations')).toBe(food - 1);
    expect(j.holds('lcMealDone', 'party')).toBe(true);
    expect(j.holds('lcMealWarm', 'party')).toBe(false);
    expect(j.page).toContain('one lodged under a nail');
  }, 120000);

  it('lets the raid advance while the company cooks', async () => {
    const j = await atGarden();
    await j.play('To the Day-Level portal', 'To the adit', 'To the Day-Level portal',
      'To the Brasiers\' garden', 'To Swallet green', 'Into the Chandler\'s Arms',
      'Ask Merren what she needs from Swallet', 'Out to Swallet green',
      'Sell the buyer a drawing of the entrances', 'To the Brasiers\' garden');
    const raid = j.measure('lcRaidAt', 'party');
    await j.play(`==${raid - 6}`, 'Set aside a ration for a meal with Linnet', 'Cook the meal with Linnet');
    expect(j.holds('lcMealDone', 'party')).toBe(true);
    expect(j.holds('lcRaidArrived', 'party')).toBe(true);
    expect(j.at('lc_raiders')).toBe('tallow__bank');
  }, 120000);
});
