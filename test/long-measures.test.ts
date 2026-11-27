import { describe, expect, it } from 'bun:test';
import type { TickHost } from '../src/campaign/campaign-tick';
import { Consequences } from '../src/campaign/consequences';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

const ring = async (seed: string) => {
  const j = await Journey.start(campaign, seed);
  Placed.at(j, 'tallow__lc_ring');
  await j.play('Examine the balance beside the arch');
  return j;
};

describe('the ring balance', () => {
  it('opens the arch without defeating the fighters, and keeps the unfinished count through a save', async () => {
    const j = await ring('measures-open');
    const start = j.watch();
    await j.play('Place the one-dot weight', 'Place the three-dot weight');
    expect(j.watch()).toBe(start + 2);
    expect(j.latest).toContain('2 weights, with 4 dots');
    expect(j.offers('Place the one-dot weight')).toBe(false);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play('Place the five-dot weight');
    expect(resumed.holds('lcMeasuresSolved', 'party')).toBe(true);
    expect(resumed.holds('lcArenaStarted', 'party')).toBe(false);
    expect(resumed.holds('able', 'lc_fencers')).toBe(true);
    await resumed.play('To the scorched walk');
    expect(resumed.at('party')).toBe('tallow__lc_wyrm_walk');
  }, 10000);

  it('accepts a different set of three weights', async () => {
    const j = await ring('measures-alternative');
    await j.play('Place the four-dot weight', 'Place the two-dot weight', 'Place the three-dot weight');
    expect(j.measure('lcMeasureCount', 'party')).toBe(3);
    expect(j.measure('lcMeasureTotal', 'party')).toBe(9);
    expect(j.holds('lcMeasuresSolved', 'party')).toBe(true);
    expect(j.holds('lcArenaStarted', 'party')).toBe(false);
  }, 10000);

  it('calls the real fighters on a wrong total', async () => {
    const j = await ring('measures-wrong');
    await j.play('Place the one-dot weight', 'Place the two-dot weight');
    await j.fight('Place the three-dot weight');
    expect(j.holds('lcMeasuresFailed', 'party')).toBe(true);
    expect(j.holds('lcMeasuresSolved', 'party')).toBe(false);
    expect(j.holds('lcArenaStarted', 'party')).toBe(true);
    expect(j.taken.at(-1)!.event.combat.some(e => e.type === 'initiative')).toBe(true);
  }, 10000);

  it('uses the principle and a real rope to lower the road gate faster', async () => {
    const j = await ring('measures-gate');
    Placed.at(j, 'tallow__gate_house');
    j.assert('state', 'calx_gate', 'raised');
    expect(j.holds('holding', 'party', 'rope')).toBe(true);
    const watch = j.watch();
    await j.play('Rig a counterweight on the Calx Gate', 'Lower the balanced Calx Gate');
    expect(j.watch()).toBe(watch + 4);
    expect(j.holds('holding', 'party', 'rope')).toBe(false);
    expect(j.holds('state', 'calx_gate', 'freed')).toBe(true);
    expect(j.holds('lcGateBalanced', 'party')).toBe(true);
    await j.play('To the Calx Way — turn the wheel and raise the Calx Gate');
    j.put('lc_vanguard', 'calx_way');
    j.assert('lcFoeInRoad', 'party');
    await j.play('Wait a while');
    expect(j.holds('lcFoeAdvancing', 'party')).toBe(true);
    const again = j.watch();
    await j.play('Lower the balanced Calx Gate');
    expect(j.watch()).toBe(again + 1);
    expect(j.holds('state', 'calx_gate', 'freed')).toBe(true);
    await j.play('==+6');
    expect(j.at('lc_vanguard')).toBe('tallow__calx_way');
    expect(j.holds('lcFoeThrough', 'party')).toBe(false);
  }, 10000);

  it('does not close the gate if the guard reaches the wheel first', async () => {
    const j = await ring('measures-race');
    Placed.at(j, 'tallow__gate_house');
    j.assert('state', 'calx_gate', 'raised');
    j.assert('lcGateBalanced', 'party');
    j.put('lc_vanguard', 'calx_way');
    j.assert('lcFoeInRoad', 'party');
    await j.play('Wait a while');
    await j.play(`==${j.measure('lcFoeAdvanceDue', 'party') - 1}`);
    await j.play('Lower the balanced Calx Gate');
    expect(j.at('lc_vanguard')).toBe('tallow__gate_house');
    expect(j.holds('state', 'calx_gate', 'raised')).toBe(true);
    expect(j.holds('lcGateLowering', 'party')).toBe(false);
  }, 10000);

  it('does not finish rigging if the guard arrives during the work', async () => {
    const j = await ring('measures-rig-interrupted');
    Placed.at(j, 'tallow__gate_house');
    j.assert('state', 'calx_gate', 'raised');
    j.put('lc_vanguard', 'calx_way');
    j.assert('lcFoeInRoad', 'party');
    await j.play('Wait a while');
    await j.play(`==${j.measure('lcFoeAdvanceDue', 'party') - 2}`);
    await j.play('Rig a counterweight on the Calx Gate');
    expect(j.at('lc_vanguard')).toBe('tallow__gate_house');
    expect(j.holds('lcGateBalanced', 'party')).toBe(false);
    expect(j.holds('lcGateRigging', 'party')).toBe(false);
    expect(j.holds('lcGateRigInterrupted', 'party')).toBe(true);
    expect(j.holds('holding', 'party', 'rope')).toBe(false);
  }, 10000);

  it('does not finish the ordinary hour-long closing when the guard arrives during it', async () => {
    const j = await ring('measures-ordinary-gate');
    Placed.at(j, 'tallow__gate_house');
    j.assert('state', 'calx_gate', 'raised');
    j.put('lc_vanguard', 'calx_way');
    j.assert('lcFoeInRoad', 'party');
    await j.play('Wait a while');
    await j.play(`==${j.measure('lcFoeAdvanceDue', 'party') - 2}`);
    await j.play('Lower the Calx Gate behind you');
    expect(j.at('lc_vanguard')).toBe('tallow__gate_house');
    expect(j.holds('state', 'calx_gate', 'raised')).toBe(true);
    expect(j.holds('lcGateClosing', 'party')).toBe(false);
  }, 10000);

  it('opens the arch when the fighters fall even without a formal challenge', async () => {
    const j = await Journey.start(campaign, 'measures-fighters-fall');
    Placed.at(j, 'tallow__lc_ring');
    j.assert('struckDead', 'lc_fencers');
    Consequences.slay(j.campaign as unknown as TickHost);
    await j.play('Wait a while');
    expect(j.holds('lcArenaStarted', 'party')).toBe(false);
    expect(j.holds('lcArenaWon', 'party')).toBe(true);
    await j.play('To the scorched walk');
    expect(j.at('party')).toBe('tallow__lc_wyrm_walk');
  }, 10000);
});
