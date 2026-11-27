import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleWriter } from '../src/lang';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

const atWar = async (seed: string) => {
  const j = await Journey.start(campaign, seed);
  j.assert('lcMerrenCounted', 'party');
  Placed.at(j, 'tallow__taproom');
  await j.play('Wait a while');
  return j;
};

describe('the war\'s reach', () => {
  it('tells the world the count has begun, and seats the Ash\'s assessor in Merren\'s chair', async () => {
    const j = await atWar('reach-told');
    expect(j.holds('befell', 'ash_count_begun')).toBe(true);
    expect(j.holds('befell', 'merren_counted')).toBe(true);
    expect(j.holds('at', 'lc_assessor', 'taproom')).toBe(true);
    expect(j.offers('Take the twelfth seat')).toBe(false);
    await j.play('Ask the assessor what the twelfth seat is');
    const ash = j.measure('lcAshScore', 'party');
    await j.play('Take the twelfth seat at the Ferryman\'s board', 'Wait a while');
    expect(j.holds('befell', 'company_sworn_ash')).toBe(true);
    expect(j.measure('lcAshScore', 'party')).toBe(ash + 3);
    expect(j.holds('at', 'lc_assessor', 'taproom')).toBe(false);
    j.assert('lcLedgerRead', 'party');
    j.assert('lcWheelGiven', 'party');
    j.assert('knows', 'party', 'lc_true_count');
    Placed.at(j, 'tallow__gate_house');
    expect(j.offers('Raise Merren\'s wheel at the Calx Gate')).toBe(false);
  }, 15000);

  it('makes a refusal a fight in the taproom, or a price paid in what the Ash learns', async () => {
    const j = await atWar('reach-refused');
    await j.play('Ask the assessor what the twelfth seat is', 'Tell the assessor to get out of Merren\'s chair');
    expect(j.holds('at', 'lc_assessor_guard', 'taproom')).toBe(true);
    j.campaign.commitWorld(j.campaign.world.apply([{ kind: 'set',
      call: ModuleWriter.call('quantity', 'party', 'gold'), value: ModuleWriter.number(10) }]));
    await j.play('Pay the assessor\'s guard to take him home');
    expect(j.holds('at', 'lc_assessor', 'taproom')).toBe(false);
    expect(j.measure('lcAIntel', 'party')).toBe(1);
  }, 15000);

  it('weighs each lieutenant broken elsewhere in its own column, and a leaning column changes the war', async () => {
    const j = await atWar('reach-columns');
    const west = j.measure('lcWestScore', 'party'), due = j.measure('lcWarDue', 'party');
    j.assert('befell', 'general_broken');
    j.assert('befell', 'heretic_broken');
    j.assert('befell', 'spymaster_broken');
    j.assert('befell', 'quorn_served');
    await j.play('Wait a while');
    expect(j.measure('lcWForce', 'party')).toBe(1);
    expect(j.measure('lcWIntel', 'party')).toBe(2);
    expect(j.measure('lcASupply', 'party')).toBe(1);
    expect(j.measure('lcWestScore', 'party')).toBe(west + 3);
    expect(j.holds('lcForewarned', 'party')).toBe(true);
    expect(j.measure('lcWarDue', 'party')).toBe(due + 144);
    await j.play('Wait a while');
    expect(j.measure('lcWestScore', 'party')).toBe(west + 3);
  }, 15000);
});

describe('the First Count, in a bowl', () => {
  it('finds a coin under the trough, weighs eleven, and leaves the twelfth place empty', async () => {
    const j = await Journey.start(campaign, 'reach-coins');
    Placed.at(j, 'tallow__green');
    await j.play('Feel along the underside of the trough\'s lip');
    for (let i = 0; i < 10; i++) { j.give('count_coin'); }
    Placed.at(j, 'tallow__counter');
    for (let i = 0; i < 4; i++) { await j.play('Ask Mistress Orpe to weigh a counting-coin'); }
    expect(j.holds('knows', 'party', 'lc_fc_prefect')).toBe(true);
    expect(j.holds('knows', 'party', 'lc_fc_hiel')).toBe(false);
    for (let i = 0; i < 7; i++) { await j.play('Ask Mistress Orpe to weigh a counting-coin'); }
    expect(j.measure('lcCoinsWeighed', 'party')).toBe(11);
    expect(j.holds('knows', 'party', 'lc_first_count')).toBe(true);
    expect(j.offers('Lay the Ash\'s grey board')).toBe(false);
    await j.play('Leave the twelfth place in the bowl empty, and give Mistress Orpe back her blank coin');
    expect(j.measure('lcWPolity', 'party')).toBe(2);
  }, 15000);
});
