import { describe, expect, it } from 'bun:test';
import type { TickHost } from '../src/campaign/campaign-tick';
import { Consequences } from '../src/campaign/consequences';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { campaign, prepared } from './support/long-road';
import { Placed } from './support/placed';

const start = async () => {
  const j = await Journey.start(campaign, 'long-road');
  Placed.at(j, 'tallow__green');
  j.put('lc_ferryman', 'tallow__green');
  j.assert('lcScoutArrived', 'party');
  await j.play('Wait a while');
  return j;
};

const toPortal = async (j: Journey) => {
  await j.play(`==${j.measure('lcReconDue', 'party')}`, '==+6', '==+2');
  expect(j.at('lc_road_scout')).toBe('tallow__calx_portal');
};

describe('the Ferryman scouts the road', () => {
  it('comes into the village after the drawing decision without a special setup', async () => {
    const j = await Journey.start(campaign, 'long-road');
    await j.play('To Swallet lane', 'To Swallet green', 'To the Brasiers\' garden',
      'To the Day-Level portal', 'To the adit', 'To the Day-Level portal',
      'To the Brasiers\' garden', 'To Swallet green', 'Into the Chandler\'s Arms',
      'Ask Merren what she needs from Swallet', 'Out to Swallet green',
      'Keep the drawing and send the buyer away');
    await j.play(`==${j.measure('lcStart', 'party') + 18}`);
    expect(j.at('lc_ferryman')).toBe('tallow__green');
    expect(j.at('lc_road_scout')).toBe('tallow__green');
    expect(j.offers('Pay the scout two coin to leave the road alone')).toBe(true);
  }, 10000);

  it('orders a guard only after a living scout sees the open portal and reports in person', async () => {
    let j = await start();
    j.assert('state', 'portal_inside', 'cleared');
    expect(j.holds('lcRoadTold', 'party')).toBe(false);
    await toPortal(j);
    expect(j.holds('lcReconSeen', 'party')).toBe(true);
    expect(j.holds('lcRoadTold', 'party')).toBe(false);
    j = Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await j.play('==+6');
    expect(j.at('lc_road_scout')).toBe('tallow__calx_portal');
    await j.play('==+2', '==+6', '==+1');
    expect(j.at('lc_road_scout')).toBe('tallow__green');
    expect(j.holds('lcReconReported', 'party')).toBe(true);
    expect(j.holds('lcRoadTold', 'party')).toBe(true);
    expect(j.holds('lcVanguardArrived', 'party')).toBe(false);
    await j.play(`==${j.measure('lcVanguardDue', 'party')}`);
    expect(j.at('lc_vanguard')).toBe('tallow__calx_portal');
  }, 10000);

  it('finds the portal the crew really cleared and sets the guard in motion', async () => {
    const j = await prepared();
    await j.play('Ask the road crew what they can repair', 'Send Merren\'s crew to clear the western portal', '==+30');
    expect(j.holds('lcClearedByCrew', 'party')).toBe(true);
    expect(j.holds('lcRoadTold', 'party')).toBe(false);
    await toPortal(j);
    expect(j.holds('lcReconSeen', 'party')).toBe(true);
    await j.play('==+6', '==+2', '==+6', '==+1');
    expect(j.holds('lcRoadTold', 'party')).toBe(true);
    await j.play(`==${j.measure('lcVanguardDue', 'party')}`);
    expect(j.at('lc_vanguard')).toBe('tallow__calx_portal');
  }, 10000);

  it('does not learn about a portal that opens after the scout leaves, but tries again next day', async () => {
    const j = await start();
    await toPortal(j);
    await j.play('==+6', '==+2', '==+6', '==+1');
    expect(j.holds('lcReconSeen', 'party')).toBe(false);
    expect(j.holds('lcRoadTold', 'party')).toBe(false);
    j.assert('state', 'portal_inside', 'cleared');
    await toPortal(j);
    expect(j.holds('lcReconSeen', 'party')).toBe(true);
    await j.play('==+6', '==+2', '==+6', '==+1');
    expect(j.holds('lcRoadTold', 'party')).toBe(true);
  }, 10000);

  it('lets the company pay the scout to leave before she reports', async () => {
    const j = await start();
    const gold = j.measure('quantity', 'party', 'gold');
    await j.play('Pay the scout two coin to leave the road alone');
    expect(j.measure('quantity', 'party', 'gold')).toBe(gold - 2);
    expect(j.measure('quantity', 'lc_road_scout', 'gold')).toBe(2);
    j.assert('state', 'portal_inside', 'cleared');
    await j.play('==+200');
    expect(j.holds('lcReconSeen', 'party')).toBe(false);
    expect(j.holds('lcRoadTold', 'party')).toBe(false);
  }, 10000);

  it('lets the company intercept and pay her after she has seen the open portal', async () => {
    const j = await start();
    j.assert('state', 'portal_inside', 'cleared');
    await j.play('To Swallet lane', 'To the west road\'s end', 'To the buried portal');
    await toPortal(j);
    expect(j.holds('lcReconSeen', 'party')).toBe(true);
    await j.play('Pay the scout two coin to leave the road alone', '==+30');
    expect(j.holds('lcRoadTold', 'party')).toBe(false);
    expect(j.holds('lcReconReported', 'party')).toBe(false);
  }, 10000);

  it('does not report if the scout dies before returning', async () => {
    const j = await start();
    j.assert('state', 'portal_inside', 'cleared');
    await toPortal(j);
    j.assert('struckDead', 'lc_road_scout');
    Consequences.slay(j.campaign as unknown as TickHost);
    await j.play('==+30');
    expect(j.at('lc_road_scout')).toBe('tallow__calx_portal');
    expect(j.holds('lcRoadTold', 'party')).toBe(false);
    expect(j.holds('lcReconReported', 'party')).toBe(false);
  }, 10000);

  it('waits to report until the Ferryman is present', async () => {
    const j = await start();
    j.assert('state', 'portal_inside', 'cleared');
    await toPortal(j);
    j.put('lc_ferryman', 'tallow__taproom');
    await j.play('==+6', '==+2', '==+6', '==+1');
    expect(j.holds('lcRoadTold', 'party')).toBe(false);
    j.put('lc_ferryman', 'tallow__green');
    await j.play('Wait a while');
    expect(j.holds('lcRoadTold', 'party')).toBe(true);
  }, 10000);

  it('does not leave the portal while the company attacks her', async () => {
    const j = await start();
    j.assert('state', 'portal_inside', 'cleared');
    await toPortal(j);
    j.assert('assails', 'party', 'lc_road_scout');
    await j.play('==+12');
    expect(j.at('lc_road_scout')).toBe('tallow__calx_portal');
    expect(j.holds('lcRoadTold', 'party')).toBe(false);
  }, 10000);
});
