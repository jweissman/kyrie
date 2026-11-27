import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import { Consequence } from '../src/lang';
import { PlaySession } from '../src/session/play-session';

const campaign = 'data/adventures/tallow/long-campaign.campaign.json';
const returned = async () => {
  const j = await Journey.start(campaign, 'long-road');
  await j.play('To Swallet lane', 'To Swallet green', 'To the Brasiers\' garden',
    'To the Day-Level portal', 'To the adit', 'To the Day-Level portal',
    'To the Brasiers\' garden', 'To Swallet green', 'Into the Chandler\'s Arms',
    'Ask Merren why the road matters', 'Ask Merren what she needs from Swallet', 'Out to Swallet green');
  return j;
};

describe('The road under the hill', () => {
  it('loads as a Kyr campaign', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('adds no inert acts or topics to the inherited adventure', async () => {
    const base = await Journey.start('data/campaigns/tallow.campaign.json', 'long-road');
    const extended = await Journey.start(campaign, 'long-road');
    const census = (j: Journey) => Consequence.census(j.campaign.module).map(x => `${x.topic ? 'topic' : 'act'} ${x.why} ${x.id}`);
    const before = census(base);
    expect(census(extended).filter(x => !before.includes(x))).toEqual([]);
  }, 60000);

  it('makes a drawing and a defense affect the approaching raid', async () => {
    const sold = await returned();
    await sold.play('Sell the buyer a drawing of the entrances');
    const soldStart = sold.measure('lcStart', 'party');
    expect(sold.measure('lcRaidAt', 'party') - soldStart).toBe(72);
    await sold.play('To the bank below the Rising', 'Block the river path with loose stones');
    expect(sold.measure('lcRaidAt', 'party') - soldStart).toBe(90);

    const kept = await returned();
    await kept.play('Keep the drawing and send the buyer away');
    expect(kept.measure('lcRaidAt', 'party') - kept.measure('lcStart', 'party')).toBe(120);
    expect(kept.holds('lcRaidArrived', 'party')).toBe(false);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(kept.session.checkpoint())), { trusted: true }));
    expect(resumed.measure('lcRaidAt', 'party')).toBe(kept.measure('lcRaidAt', 'party'));
    expect(resumed.holds('lcKept', 'party')).toBe(true);
  }, 120000);

  it('spends provisions for the road crew and lets the Ferryman offer terms', async () => {
    const j = await returned();
    await j.play('Sell the buyer a drawing of the entrances', 'Into the Chandler\'s Arms');
    const food = j.measure('quantity', 'party', 'rations');
    await j.play('Give two days of rations to Merren\'s repair crew');
    expect(j.measure('quantity', 'party', 'rations')).toBe(food - 2);
    await j.play('Out to Swallet green', '=+18', 'Hear the Ferryman\'s offer');
    expect(j.holds('lcTermsHeard', 'party')).toBe(true);
    expect(j.offers('Accept the Ferryman\'s terms for the bank')).toBe(true);
    await j.play('Accept the Ferryman\'s terms for the bank');
    expect(j.measure('quantity', 'party', 'rations')).toBe(food - 3);
    expect(j.holds('lcAccepted', 'party')).toBe(true);
  }, 120000);

  it('sends an armed raiding party to the bank and lets it take the approach', async () => {
    const j = await returned();
    await j.play('Sell the buyer a drawing of the entrances', '==+75');
    expect(j.holds('lcRaidArrived', 'party')).toBe(true);
    expect(j.at('lc_raiders')).toBe('tallow__bank');
    await j.play('==+36');
    expect(j.holds('lcOccupied', 'party')).toBe(true);
    await j.play('To the bank below the Rising');
    expect(j.offers('Attack')).toBe(true);
  }, 120000);

  it('sends a peaceable garrison, not the raiders, when the offer is accepted', async () => {
    const j = await returned();
    await j.play('Sell the buyer a drawing of the entrances', 'Into the Chandler\'s Arms',
      'Give two days of rations to Merren\'s repair crew', 'Out to Swallet green', '=+18',
      'Hear the Ferryman\'s offer', 'Accept the Ferryman\'s terms for the bank', '==+72');
    expect(j.holds('lcOccupied', 'party')).toBe(true);
    expect(j.at('lc_garrison')).toBe('tallow__bank');
    expect(j.at('lc_raiders')).not.toBe('tallow__bank');
    expect(j.at('lc_crew')).toBe('tallow__taproom');
  }, 120000);

  it('lets a rival delay the raiders at the cost of the same food the crew needs', async () => {
    const j = await returned();
    await j.play('Sell the buyer a drawing of the entrances', 'To the Brasiers\' garden');
    const food = j.measure('quantity', 'party', 'rations');
    const raid = j.measure('lcRaidAt', 'party');
    await j.play('Ask Linnet why she searches the hill', 'Give Linnet a ration so she can block the river path');
    expect(j.measure('quantity', 'party', 'rations')).toBe(food - 1);
    expect(j.measure('lcRaidAt', 'party')).toBe(raid + 18);
    expect(j.holds('lcRivalHelp', 'party')).toBe(true);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    expect(resumed.holds('lcRivalHelp', 'party')).toBe(true);
    expect(resumed.measure('quantity', 'party', 'rations')).toBe(food - 1);
  }, 120000);
});
