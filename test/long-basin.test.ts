import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { reflectedLanding } from './support/long-road';

const basin = async (seed: string) => {
  const j = await reflectedLanding(seed);
  await j.play('Lift the hook out of the standing water', 'To the water beyond the hook', 'To the hanging basin');
  return j;
};

describe('the hanging basin', () => {
  it('lets the company follow the current and save its keeper', async () => {
    let j = await basin('basin-save');
    expect(j.holds('lcBasinFloodStarted', 'party')).toBe(true);
    for (let n = 0; n < 2; n++) {
      const left = j.holds('lcBasinLeft', 'party');
      expect(j.seen()).toContain(`spill-wheel pulls to the ${left ? 'left' : 'right'}`);
      await j.play(`Turn the spill-wheel ${left ? 'left' : 'right'}`);
      if (n === 0) {
        j = Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
      }
    }
    expect(j.holds('lcBasinOpened', 'party')).toBe(true);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    expect(resumed.holds('carries', 'lc_basin_keeper', 'lc_basin_bandages')).toBe(true);
    await resumed.play('Ask the basin keeper what they were holding shut',
      `==${resumed.measure('lcBasinFloodDue', 'party') + 1}`);
    expect(resumed.holds('carries', 'party', 'lc_basin_bandages')).toBe(true);
    expect(resumed.holds('able', 'lc_basin_keeper')).toBe(true);
    expect(resumed.holds('lcBasinFlooded', 'party')).toBe(false);
  }, 10000);

  it('lets the last turn finish at the flood deadline', async () => {
    const j = await basin('basin-last-turn');
    const due = j.measure('lcBasinFloodDue', 'party');
    await j.play(`==${due - 2}`);
    for (let n = 0; n < 2; n++) {
      await j.play(`Turn the spill-wheel ${j.holds('lcBasinLeft', 'party') ? 'left' : 'right'}`);
      expect(j.measure('lcBasinTurns', 'party')).toBe(n + 1);
    }
    expect(j.holds('lcBasinOpened', 'party')).toBe(true);
    expect(j.holds('lcBasinFlooded', 'party')).toBe(false);
    expect(j.holds('able', 'lc_basin_keeper')).toBe(true);
  }, 10000);

  it('lets the rescued keeper join and leave the basin with the company', async () => {
    const j = await basin('basin-companion');
    for (let n = 0; n < 2; n++) {
      await j.play(`Turn the spill-wheel ${j.holds('lcBasinLeft', 'party') ? 'left' : 'right'}`);
    }
    await j.play('Ask the basin keeper how they came here');
    expect(j.holds('willing', 'lc_basin_keeper', 'party')).toBe(true);
    const before = new Set(j.campaign.readout.partyIds);
    await j.play('Ask Senn to join the company');
    expect(j.holds('travelsWith', 'lc_basin_keeper', 'party')).toBe(true);
    expect(j.campaign.readout.partyIds).toHaveLength(4);
    const joined = j.campaign.readout.partyIds.find(id => !before.has(id))!;
    expect(j.campaign.readout.creatures.find(c => c.id === joined)!.classId).toBe('mage');
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play('To the water beyond the hook', 'To the reflected landing');
    expect(resumed.campaign.readout.partyIds).toHaveLength(4);
    expect(resumed.holds('travelsWith', 'lc_basin_keeper', 'party')).toBe(true);
    Placed.at(resumed, 'tallow__gate_house');
    resumed.assert('state', 'calx_gate', 'raised');
    const beforeGate = resumed.watch();
    await resumed.play('Ask Senn to help lower the Calx Gate');
    expect(resumed.watch()).toBe(beforeGate + 3);
    expect(resumed.holds('state', 'calx_gate', 'freed')).toBe(true);
  }, 10000);

  for (const remaining of [2, 3]) {
    it(`stops Senn working the gate if the guard arrives in ${remaining} watches`, async () => {
      const j = await basin(`basin-gate-interrupted-${remaining}`);
      for (let n = 0; n < 2; n++) {
        await j.play(`Turn the spill-wheel ${j.holds('lcBasinLeft', 'party') ? 'left' : 'right'}`);
      }
      await j.play('Ask the basin keeper how they came here', 'Ask Senn to join the company');
      Placed.at(j, 'tallow__gate_house');
      j.assert('state', 'calx_gate', 'raised');
      j.put('lc_vanguard', 'calx_way');
      j.assert('lcFoeInRoad', 'party');
      await j.play('Wait a while');
      await j.play(`==${j.measure('lcFoeAdvanceDue', 'party') - remaining}`, 'Ask Senn to help lower the Calx Gate');
      expect(j.at('lc_vanguard')).toBe('tallow__gate_house');
      expect(j.holds('lcSennGateWorking', 'party')).toBe(false);
      expect(j.holds('state', 'calx_gate', 'raised')).toBe(true);
    }, 10000);
  }

  it('makes a wrong turn risky and loses the partial work', async () => {
    const j = await basin('basin-slip');
    const right = j.holds('lcBasinLeft', 'party') ? 'left' : 'right';
    await j.play(`Turn the spill-wheel ${right}`);
    expect(j.measure('lcBasinTurns', 'party')).toBe(1);
    const wrong = j.holds('lcBasinLeft', 'party') ? 'right' : 'left';
    await j.play(`Turn the spill-wheel ${wrong}`);
    expect(j.measure('lcBasinTurns', 'party')).toBe(0);
    expect(j.holds('lcBasinOpened', 'party')).toBe(false);
    expect(j.taken.at(-1)!.event.combat.some(e =>
      (e.type === 'save' || e.type === 'damage') && e.actor === 'tallow__lc_basin_slip')).toBe(true);
  }, 10000);

  it('floods on time even when the company goes elsewhere', async () => {
    const j = await reflectedLanding('basin-late');
    await j.play('Lift the hook out of the standing water', 'To the room of panes');
    await j.play(`==${j.measure('lcBasinFloodDue', 'party')}`);
    expect(j.holds('lcBasinFlooded', 'party')).toBe(true);
    expect(j.holds('able', 'lc_basin_keeper')).toBe(false);
    await j.play('To the reflected landing', 'To the water beyond the hook', 'To the hanging basin');
    expect(j.seen()).toContain('Water covers the house');
    expect(j.offers('Ask the basin keeper what they were holding shut')).toBe(false);
  }, 10000);
});
