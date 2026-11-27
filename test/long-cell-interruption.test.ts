import { describe, expect, it } from 'bun:test';
import { Consequences } from '../src/campaign/consequences';
import type { TickHost } from '../src/campaign/campaign-tick';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

describe('the Ferryman\'s generated supply cell', () => {
  it('can be confronted in an actual fight', async () => {
    const j = await Journey.start(campaign, 'long-road');
    j.assert('lcRoadTold', 'party');
    j.assert('lcVanguardArrived', 'party');
    await j.play('==+7');
    Placed.at(j, 'tallow__west_end');
    await j.fight('Draw on the Ferryman\'s people');
    expect(j.holds('lcCellDefied', 'party')).toBe(true);
    expect(j.taken.at(-1)!.event.combat.some(e => e.type === 'initiative')).toBe(true);
    expect(j.holds('lcCellDelivered', 'party')).toBe(false);
  }, 10000);

  it('abandons its delivery on a withdrawal order', async () => {
    const j = await Journey.start(campaign, 'long-road');
    // Isolate the cell's order from the already exercised conversation with the Ferryman.
    j.assert('lcRoadTold', 'party');
    j.assert('lcVanguardArrived', 'party');
    await j.play('==+7');
    expect(j.at('lc_cell')).toBe('tallow__west_end');
    j.assert('lcTruce', 'party');
    await j.play('==+6');
    expect(j.holds('lcCellLeft', 'party')).toBe(true);
    expect(j.holds('lcCellDelivered', 'party')).toBe(false);
    expect(j.at('lc_cell')).not.toBe('tallow__calx_portal');
  }, 10000);

  it('leaves recoverable food if the carriers are defeated', async () => {
    const j = await Journey.start(campaign, 'long-road');
    j.assert('lcRoadTold', 'party');
    j.assert('lcVanguardArrived', 'party');
    await j.play('==+7');
    Placed.at(j, 'tallow__west_end');
    const food = j.measure('quantity', 'party', 'rations');
    const carried = j.measure('quantity', 'lc_cell', 'rations');
    j.assert('struckDead', 'lc_cell');
    Consequences.slay(j.campaign as unknown as TickHost);
    await j.play('Take the Ferryman\'s people\'s remaining food');
    expect(j.measure('quantity', 'party', 'rations')).toBe(food + carried);
    expect(j.measure('quantity', 'lc_cell', 'rations')).toBe(0);
    expect(j.offers('Take the Ferryman\'s people\'s remaining food')).toBe(false);
    await j.play('==+12');
    expect(j.holds('lcCellDelivered', 'party')).toBe(false);
    expect(j.at('lc_cell')).toBe('tallow__west_end');
  }, 10000);
});
