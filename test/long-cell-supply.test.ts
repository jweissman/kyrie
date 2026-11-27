import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { campaign } from './support/long-road';

describe('the Ferryman\'s generated supply cell', () => {
  it('waits with its food for a late guard and hands it over at the portal', async () => {
    const j = await Journey.start(campaign, 'long-road');
    // Keep the guard offstage until after the independently ordered cell arrives.
    j.assert('lcRoadTold', 'party');
    j.assert('lcVanguardArrived', 'party');
    await j.play('==+12');
    expect(j.at('lc_cell')).toBe('tallow__calx_portal');
    expect(j.holds('lcCellDelivered', 'party')).toBe(false);
    const food = j.measure('quantity', 'lc_cell', 'rations');
    expect(food).toBeGreaterThan(0);
    j.put('lc_vanguard', 'tallow__calx_portal');
    await j.play('Wait a while');
    expect(j.measure('quantity', 'lc_vanguard', 'rations')).toBe(food);
    expect(j.measure('quantity', 'lc_cell', 'rations')).toBe(0);
    expect(j.holds('lcCellDelivered', 'party')).toBe(true);
    expect(j.holds('lcCellLeft', 'party')).toBe(true);
  }, 10000);
});
