import { describe, expect, it } from 'bun:test';
import type { TickHost } from '../src/campaign/campaign-tick';
import { Consequences } from '../src/campaign/consequences';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

const ordered = async () => {
  const j = await Journey.start(campaign, 'cador-factor');
  j.put('lc_ferryman', 'green');
  j.put('lc_vanguard', 'calx_portal');
  j.assert('lcVanguardArrived', 'party');
  j.assert('lcRoadTold', 'party');
  j.assert('lcCellOrdered', 'party');
  j.assert('lcConvoyOrdered', 'party');
  Placed.at(j, 'tallow__tally_room');
  await j.play('Wait a while');
  return j;
};

describe('the Ferryman buys from Cador', () => {
  it('pays for real food and delivers it to the guard after a save', async () => {
    const j = await ordered();
    expect(j.measure('quantity', 'lc_ferryman', 'gold')).toBe(0);
    expect(j.measure('quantity', 'lc_factor', 'gold')).toBe(3);
    await j.play(`==${j.measure('lcFactorDue', 'party')}`);
    expect(j.at('lc_factor')).toBe('tallow__tally_room');
    const cadorGold = j.measure('quantity', 'joss', 'gold');
    await j.play(`==${j.measure('lcFactorDecisionDue', 'party')}`);
    expect(j.holds('lcFactorBought', 'party')).toBe(true);
    expect(j.measure('quantity', 'joss', 'gold')).toBe(cadorGold + 3);
    expect(j.measure('quantity', 'joss', 'rations')).toBe(0);
    expect(j.measure('quantity', 'lc_factor', 'rations')).toBe(2);
    const before = j.measure('quantity', 'lc_vanguard', 'rations');
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play(`==${resumed.measure('lcFactorDue', 'party')}`);
    expect(resumed.holds('lcFactorDelivered', 'party')).toBe(true);
    expect(resumed.measure('quantity', 'lc_factor', 'rations')).toBe(0);
    expect(resumed.measure('quantity', 'lc_vanguard', 'rations')).toBe(before + 2);
  }, 10000);

  it('lets the company pay Cador to refuse the order and return the factor\'s money', async () => {
    const j = await ordered();
    await j.play(`==${j.measure('lcFactorDue', 'party')}`);
    await j.play('Ask Cador about the Ferryman\'s food');
    const gold = j.measure('quantity', 'party', 'gold');
    const cadorGold = j.measure('quantity', 'joss', 'gold');
    await j.play('Pay Cador four coin to refuse the Ferryman\'s order');
    expect(j.measure('quantity', 'party', 'gold')).toBe(gold - 4);
    expect(j.measure('quantity', 'joss', 'gold')).toBe(cadorGold + 4);
    expect(j.measure('quantity', 'joss', 'rations')).toBe(2);
    await j.play(`==${j.measure('lcFactorDue', 'party')}`);
    expect(j.at('lc_factor')).toBe('tallow__green');
    expect(j.measure('quantity', 'lc_ferryman', 'gold')).toBe(3);
    expect(j.holds('lcFactorBought', 'party')).toBe(false);
    expect(j.holds('lcFactorDelivered', 'party')).toBe(false);
  }, 10000);

  it('can reach Cador from the green in time to outbid the factor', async () => {
    const j = await Journey.start(campaign, 'cador-natural-route');
    j.put('lc_ferryman', 'green');
    j.assert('lcRoadTold', 'party');
    Placed.at(j, 'tallow__green');
    await j.play('To the Brasiers\' garden', 'To the Day-Level portal', 'To the adit',
      'Pay the Tallymen six coin for the lantern\'s loan', 'Bran: light a torch',
      'To the long drift', 'To the Tally-Room', 'Ask Cador about the Ferryman\'s food',
      'Pay Cador four coin to refuse the Ferryman\'s order');
    expect(j.holds('lcCadorExclusive', 'party')).toBe(true);
    expect(j.holds('lcFactorBought', 'party')).toBe(false);
  }, 10000);

  it('leaves the food with a fallen factor rather than delivering it', async () => {
    const j = await ordered();
    await j.play(`==${j.measure('lcFactorDue', 'party')}`);
    await j.play(`==${j.measure('lcFactorDecisionDue', 'party')}`);
    j.put('lc_vanguard', 'green');
    await j.play(`==${j.measure('lcFactorDue', 'party')}`);
    expect(j.at('lc_factor')).toBe('tallow__calx_portal');
    j.assert('struckDead', 'lc_factor');
    Consequences.slay(j.campaign as unknown as TickHost);
    Placed.at(j, 'tallow__calx_portal');
    const before = j.measure('quantity', 'party', 'rations');
    await j.play('Take the fallen factor\'s food');
    expect(j.measure('quantity', 'party', 'rations')).toBe(before + 2);
    expect(j.holds('lcFactorDelivered', 'party')).toBe(false);
    expect(j.offers('Take the fallen factor\'s food')).toBe(false);
  }, 10000);

  it('does not deliver bought food after a withdrawal agreement', async () => {
    const j = await ordered();
    await j.play(`==${j.measure('lcFactorDue', 'party')}`);
    await j.play(`==${j.measure('lcFactorDecisionDue', 'party')}`);
    j.assert('lcTruce', 'party');
    await j.play(`==${j.measure('lcFactorDue', 'party')}`);
    expect(j.holds('lcFactorDelivered', 'party')).toBe(false);
    expect(j.measure('quantity', 'lc_factor', 'rations')).toBe(2);
    expect(j.holds('lcFactorReturning', 'party')).toBe(true);
  }, 10000);

  it('follows the guard along the road but cannot pass a closed gate', async () => {
    const j = await ordered();
    await j.play(`==${j.measure('lcFactorDue', 'party')}`);
    await j.play(`==${j.measure('lcFactorDecisionDue', 'party')}`);
    j.put('lc_vanguard', 'gate_house');
    j.assert('state', 'portal_inside', 'cleared');
    j.assert('state', 'calx_gate', 'raised');
    await j.play(`==${j.measure('lcFactorDue', 'party')}`);
    expect(j.at('lc_factor')).toBe('tallow__calx_portal');
    expect(j.holds('lcFactorEntering', 'party')).toBe(true);
    await j.play('==+6');
    expect(j.at('lc_factor')).toBe('tallow__calx_way');
    expect(j.holds('lcFactorAdvancing', 'party')).toBe(true);
    j.assert('state', 'calx_gate', 'freed');
    await j.play('==+6');
    expect(j.at('lc_factor')).toBe('tallow__calx_way');
    expect(j.holds('lcFactorDelivered', 'party')).toBe(false);
    j.assert('state', 'calx_gate', 'raised');
    const before = j.measure('quantity', 'lc_vanguard', 'rations');
    await j.play('==+7');
    expect(j.holds('lcFactorDelivered', 'party')).toBe(true);
    expect(j.measure('quantity', 'lc_vanguard', 'rations')).toBe(before + 2);
  }, 10000);
});
