import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';
import { campaign, prepared } from './support/long-road';

describe('The road under the hill: the gate and the bank', () => {
  it('lets a rival return food after the raid without surrendering her rivalry', async () => {
    const j = await Journey.start(campaign, 'long-road');
    await j.play('To Swallet lane', 'To Swallet green', 'To the Brasiers\' garden',
      'To the Day-Level portal', 'To the adit', 'To the Day-Level portal',
      'To the Brasiers\' garden', 'To Swallet green', 'Into the Chandler\'s Arms',
      'Ask Merren what she needs from Swallet', 'Out to Swallet green',
      'Sell the buyer a drawing of the entrances', 'To the Brasiers\' garden',
      'Ask Linnet why she searches the hill', 'Give Linnet a ration so she can block the river path', '==+90');
    const food = j.measure('quantity', 'party', 'rations');
    const rivalFood = j.measure('quantity', 'lc_rival', 'rations');
    await j.play('Accept Linnet\'s food for the next descent');
    expect(j.measure('quantity', 'party', 'rations')).toBe(food + 1);
    expect(j.measure('quantity', 'lc_rival', 'rations')).toBe(rivalFood - 1);
    expect(j.holds('lcRivalReturned', 'party')).toBe(true);
    expect(j.offers('Accept Linnet\'s food for the next descent')).toBe(false);
  }, 120000);

  it('lets the gate stop an informed guard until the road is reopened', async () => {
    const j = await prepared();
    await j.play('Out to Swallet green', 'Into Usk\'s store', 'Buy › A flask of lamp oil');
    // The existing Tallow journey proves the descent; put the company at the gate to exercise its operation.
    Placed.at(j, 'tallow__gate_house');
    await j.play('To the Calx Way — free the gate-wheel\'s pawl with lamp oil',
      'To the Calx Way — turn the wheel and raise the Calx Gate', 'Lower the Calx Gate behind you');
    expect(j.holds('state', 'calx_gate', 'freed')).toBe(true);
    Placed.at(j, 'tallow__calx_way');
    await j.play('Wait a while');
    Placed.at(j, 'tallow__green');
    await j.play('Hear the Ferryman\'s offer', 'Tell the Ferryman the road runs through the hill', '==+100');
    expect(j.at('lc_vanguard')).toBe('tallow__calx_way');
    expect(j.holds('lcFoeThrough', 'party')).toBe(false);
    Placed.at(j, 'tallow__gate_house');
    await j.play('To the Calx Way — turn the wheel and raise the Calx Gate', '==+12');
    expect(j.at('lc_vanguard')).toBe('tallow__gate_house');
    expect(j.holds('lcFoeThrough', 'party')).toBe(true);
  }, 120000);

  it('does not replace a departed negotiated garrison with raiders who never arrived', async () => {
    const j = await Journey.start(campaign, 'long-road');
    await j.play('To Swallet lane', 'To Swallet green', 'To the Brasiers\' garden',
      'To the Day-Level portal', 'To the adit', 'To the Day-Level portal',
      'To the Brasiers\' garden', 'To Swallet green', 'Into the Chandler\'s Arms',
      'Ask Merren what she needs from Swallet', 'Out to Swallet green', 'Sell the buyer a drawing of the entrances',
      '=+18', 'Hear the Ferryman\'s offer',
      'Accept the Ferryman\'s terms for the bank', '==+75');
    expect(j.holds('lcOccupied', 'party')).toBe(true);
    Placed.move(j, 'tallow__lc_garrison', 'tallow__west_end');
    await j.play('==+42');
    expect(j.holds('lcOccupied', 'party')).toBe(false);
    expect(j.holds('lcCleared', 'party')).toBe(true);
    expect(j.at('lc_raiders')).not.toBe('tallow__bank');
  }, 120000);
});
