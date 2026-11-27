import { describe, expect, it } from 'bun:test';
import { Expressions } from '../src/expressions';
import { RandomStreams } from '../src/random-streams';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

const game = async (seed: string) => {
  const j = await Journey.start(campaign, seed);
  j.put('lc_ferryman', 'green');
  j.put('lc_vanguard', 'calx_portal');
  j.assert('lcVanguardArrived', 'party');
  j.assert('lcRoadTold', 'party');
  j.assert('lcCellOrdered', 'party');
  j.assert('lcConvoyOrdered', 'party');
  Placed.at(j, 'tallow__tally_room');
  await j.play('Wait a while');
  await j.play(`==${j.measure('lcFactorDue', 'party')}`, 'Ask Cador about the covered stones');
  return j;
};

const call = (j: Journey, correct: boolean) => {
  const high = new Expressions(RandomStreams.key(j.session.seed, 'dice', j.watch() + 1)).number('1d100') > 50;
  return `Call the next stone ${high === correct ? 'high' : 'low'}`;
};

describe("Cador's stones", () => {
  it('keeps his food from the factor after two correct calls, including across a save', async () => {
    const j = await game('cador-stones-win');
    const gold = j.measure('quantity', 'party', 'gold');
    const cadorGold = j.measure('quantity', 'joss', 'gold');
    await j.play('Pay two coin to play Cador\'s stones');
    await j.play(call(j, true));
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play(call(resumed, true));
    expect(resumed.measure('quantity', 'party', 'gold')).toBe(gold - 2);
    expect(resumed.measure('quantity', 'joss', 'gold')).toBe(cadorGold + 2);
    expect(resumed.holds('lcCadorExclusive', 'party')).toBe(true);
    expect(resumed.measure('quantity', 'joss', 'rations')).toBe(2);
    await resumed.play(`==${resumed.measure('lcFactorDue', 'party')}`);
    expect(resumed.holds('lcFactorBought', 'party')).toBe(false);
    expect(resumed.measure('quantity', 'lc_ferryman', 'gold')).toBe(3);
  }, 10000);

  it('leaves the sale in motion after two missed calls', async () => {
    const j = await game('cador-stones-loss');
    await j.play('Pay two coin to play Cador\'s stones');
    await j.play(call(j, false));
    await j.play(call(j, false));
    expect(j.holds('lcCadorExclusive', 'party')).toBe(false);
    expect(j.holds('lcCadorGame', 'party')).toBe(false);
    await j.play(`==${j.measure('lcFactorDecisionDue', 'party')}`);
    expect(j.holds('lcFactorBought', 'party')).toBe(true);
    expect(j.measure('quantity', 'lc_factor', 'rations')).toBe(2);
  }, 10000);

  it("lets a final correct call finish at the buyer's deadline", async () => {
    const j = await game('cador-stones-boundary');
    await j.play('Pay two coin to play Cador\'s stones');
    await j.play(call(j, false));
    await j.play(call(j, true));
    await j.play(`==${j.measure('lcFactorDecisionDue', 'party') - 1}`);
    await j.play(call(j, true));
    expect(j.holds('lcCadorExclusive', 'party')).toBe(true);
    expect(j.holds('lcFactorBought', 'party')).toBe(false);
    expect(j.measure('quantity', 'joss', 'rations')).toBe(2);
  }, 10000);

  it('can be reached from Swallet green while the factor is still waiting', async () => {
    const j = await Journey.start(campaign, 'cador-stones-road');
    j.put('lc_ferryman', 'green');
    j.assert('lcRoadTold', 'party');
    Placed.at(j, 'tallow__green');
    await j.play('To the Brasiers\' garden', 'To the Day-Level portal', 'To the adit',
      'Pay the Tallymen six coin for the lantern\'s loan', 'Bran: light a torch',
      'To the long drift', 'To the Tally-Room');
    await j.play(`==${j.measure('lcFactorDue', 'party')}`, 'Ask Cador about the covered stones',
      'Pay two coin to play Cador\'s stones');
    await j.play(call(j, true));
    await j.play(call(j, true));
    expect(j.holds('lcCadorExclusive', 'party')).toBe(true);
    expect(j.holds('lcFactorBought', 'party')).toBe(false);
  }, 10000);

  it('ends an unfinished game when the buyer will wait no longer', async () => {
    const j = await game('cador-stones-timeout');
    await j.play('Pay two coin to play Cador\'s stones');
    await j.play(`==${j.measure('lcFactorDecisionDue', 'party')}`);
    expect(j.holds('lcCadorGame', 'party')).toBe(false);
    expect(j.holds('lcFactorBought', 'party')).toBe(true);
    expect(j.offers('Call the next stone low')).toBe(false);
  }, 10000);

  it('abandons the game without a reward when the company leaves', async () => {
    const j = await game('cador-stones-leave');
    await j.play('Pay two coin to play Cador\'s stones');
    Placed.at(j, 'tallow__adit');
    await j.play('Wait a while');
    expect(j.holds('lcCadorGame', 'party')).toBe(false);
    expect(j.holds('lcCadorExclusive', 'party')).toBe(false);
    await j.play(`==${j.measure('lcFactorDecisionDue', 'party')}`);
    expect(j.holds('lcFactorBought', 'party')).toBe(true);
  }, 10000);
});
