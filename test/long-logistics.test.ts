import { describe, expect, it } from 'bun:test';
import { Placed } from './support/placed';
import { convoyOnPortal, prepared } from './support/long-road';

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
    const cellFood = j.holds('lc_cell_kind', 'lc_marauders') ? 3 : 2;
    expect(j.at('lc_vanguard')).toBe('tallow__calx_way');
    expect(j.at('lc_convoy')).toBe('tallow__calx_way');
    expect(j.measure('quantity', 'lc_convoy', 'rations')).toBe(0);
    expect(j.holds('lcCellDelivered', 'party')).toBe(true);
    expect(j.holds('lcFactorDelivered', 'party')).toBe(true);
    expect(j.measure('quantity', 'lc_vanguard', 'rations')).toBe(6 + cellFood);
    Placed.at(j, 'tallow__gate_house');
    await j.play('To the Calx Way — turn the wheel and raise the Calx Gate');
    Placed.at(j, 'tallow__green');
    await j.play('==+18');
    expect(j.at('lc_vanguard')).toBe('tallow__gate_house');
    expect(j.at('lc_convoy')).toBe('tallow__gate_house');
    expect(j.holds('lcGuardSupplied', 'party')).toBe(true);
    expect(j.measure('quantity', 'lc_convoy', 'rations')).toBe(0);
    expect(j.measure('quantity', 'lc_vanguard', 'rations')).toBe(6 + cellFood);
    expect(j.campaign.running).toBe(true);
    const due = j.measure('lcGuardDue', 'party');
    await j.play(`==${due}`);
    expect(j.watch()).toBeGreaterThanOrEqual(due);
    expect(j.measure('quantity', 'lc_vanguard', 'rations')).toBe(5 + cellFood);
    expect(j.at('lc_vanguard')).toBe('tallow__gate_house');
  }, 120000);

  it('loses the gate after a day when all three supply lines are stopped', async () => {
    const j = await convoyOnPortal();
    expect(j.at('lc_vanguard')).toBe('tallow__gate_house');
    expect(j.at('lc_convoy')).toBe('tallow__calx_portal');
    expect(j.measure('quantity', 'lc_convoy', 'rations')).toBe(4);
    Placed.at(j, 'tallow__calx_portal');
    expect(j.offers('Attack')).toBe(true);
    // Isolate interruption without predetermining the outcome of the separate combat.
    Placed.move(j, 'tallow__lc_convoy', 'tallow__west_end');
    Placed.at(j, 'tallow__green');
    expect(j.at('lc_vanguard')).toBe('tallow__gate_house');
    expect(j.holds('lcGuardSupplied', 'party')).toBe(false);
    expect(j.holds('lcCadorExclusive', 'party')).toBe(true);
    const due = j.measure('lcGuardDue', 'party');
    await j.play(`==${due}`);
    expect(j.watch()).toBeGreaterThanOrEqual(due);
    expect(j.holds('lcGuardLeft', 'party')).toBe(true);
    expect(j.at('lc_vanguard')).not.toBe('tallow__gate_house');
    expect(j.measure('quantity', 'lc_convoy', 'rations')).toBe(4);
  }, 120000);

  it('lets the armed supply party defeat an unprepared company', async () => {
    const j = await convoyOnPortal();
    Placed.at(j, 'tallow__calx_portal');
    await j.fight('Attack');
    expect(j.campaign.running).toBe(false);
    expect(j.holds('able', 'lc_convoy')).toBe(true);
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
