import { describe, expect, it } from 'bun:test';
import { Placed } from './support/placed';
import { prepared } from './support/long-road';

const guardOnRoad = async () => {
  const j = await prepared();
  await j.play('Out to Swallet green', 'Into Usk\'s store', 'Buy › A flask of lamp oil',
    'Buy › A ration', 'Buy › A ration', 'Buy › A ration', 'Buy › A ration');
  Placed.at(j, 'tallow__gate_house');
  await j.play('To the Calx Way — free the gate-wheel\'s pawl with lamp oil');
  Placed.at(j, 'tallow__calx_way');
  await j.play('Wait a while');
  Placed.at(j, 'tallow__green');
  expect(j.campaign.running).toBe(true);
  await j.play('Hear the Ferryman\'s offer', 'Tell the Ferryman the road runs through the hill', '==+100');
  return j;
};

describe('The Ferryman provisions the road', () => {
  it('transfers real food to the guard and spends it to keep the gate', async () => {
    const j = await guardOnRoad();
    expect(j.at('lc_vanguard')).toBe('tallow__calx_way');
    expect(j.at('lc_convoy')).toBe('tallow__calx_way');
    expect(j.measure('quantity', 'lc_convoy', 'rations')).toBe(0);
    expect(j.measure('quantity', 'lc_vanguard', 'rations')).toBe(4);
    Placed.at(j, 'tallow__gate_house');
    await j.play('To the Calx Way — turn the wheel and raise the Calx Gate');
    Placed.at(j, 'tallow__green');
    await j.play('==+18');
    expect(j.at('lc_vanguard')).toBe('tallow__gate_house');
    expect(j.at('lc_convoy')).toBe('tallow__gate_house');
    expect(j.holds('lcGuardSupplied', 'party')).toBe(true);
    expect(j.measure('quantity', 'lc_convoy', 'rations')).toBe(0);
    expect(j.measure('quantity', 'lc_vanguard', 'rations')).toBe(4);
    expect(j.campaign.running).toBe(true);
    const due = j.measure('lcGuardDue', 'party');
    await j.play(`==${due}`);
    expect(j.watch()).toBeGreaterThanOrEqual(due);
    expect(j.measure('quantity', 'lc_vanguard', 'rations')).toBe(3);
    expect(j.at('lc_vanguard')).toBe('tallow__gate_house');
  }, 120000);

  it('loses the gate after a day when the supply party cannot reach the guard', async () => {
    const j = await prepared();
    await j.play('Ask the road crew what they can repair', 'Send Merren\'s crew to clear the western portal', '==+30',
      'Out to Swallet green', 'Into Usk\'s store', 'Buy › A flask of lamp oil',
      'Buy › A ration', 'Buy › A ration', 'Buy › A ration', 'Buy › A ration');
    Placed.at(j, 'tallow__gate_house');
    await j.play('To the Calx Way — free the gate-wheel\'s pawl with lamp oil',
      'To the Calx Way — turn the wheel and raise the Calx Gate');
    Placed.at(j, 'tallow__calx_way');
    await j.play('Wait a while');
    Placed.at(j, 'tallow__green');
    await j.play('Hear the Ferryman\'s offer', 'Tell the Ferryman the road runs through the hill', '==+55');
    expect(j.at('lc_vanguard')).toBe('tallow__gate_house');
    expect(j.at('lc_convoy')).toBe('tallow__calx_portal');
    expect(j.measure('quantity', 'lc_convoy', 'rations')).toBe(4);
    // Isolate an interrupted supply party; the encounter itself is offered by the ordinary combat interface.
    Placed.at(j, 'tallow__calx_portal');
    expect(j.offers('Attack')).toBe(true);
    Placed.move(j, 'tallow__lc_convoy', 'tallow__west_end');
    Placed.at(j, 'tallow__green');
    expect(j.at('lc_vanguard')).toBe('tallow__gate_house');
    expect(j.holds('lcGuardSupplied', 'party')).toBe(false);
    const due = j.measure('lcGuardDue', 'party');
    await j.play(`==${due}`);
    expect(j.watch()).toBeGreaterThanOrEqual(due);
    expect(j.holds('lcGuardLeft', 'party')).toBe(true);
    expect(j.at('lc_vanguard')).not.toBe('tallow__gate_house');
    expect(j.measure('quantity', 'lc_convoy', 'rations')).toBe(4);
  }, 120000);

  it('withdraws both the guard and its supply party under the negotiated terms', async () => {
    const j = await guardOnRoad();
    expect(j.at('lc_vanguard')).toBe('tallow__calx_way');
    expect(j.at('lc_convoy')).toBe('tallow__calx_way');
    await j.play('Ask what it would take to withdraw his men',
      'Give the Ferryman four rations to withdraw his men', '==+30');
    expect(j.holds('lcTruce', 'party')).toBe(true);
    expect(j.at('lc_vanguard')).not.toBe('tallow__calx_way');
    expect(j.at('lc_convoy')).not.toBe('tallow__calx_way');
  }, 120000);
});
