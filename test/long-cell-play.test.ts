import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { prepared } from './support/long-road';

describe('the Ferryman\'s people', () => {
  it('can sell their food before reaching the guard', async () => {
    const j = await prepared();
    expect(j.offers('Ask Merren who feeds the road guard')).toBe(false);
    await j.play('Ask Merren who else wants the road', 'Out to Swallet green', 'Hear the Ferryman\'s offer');
    Placed.at(j, 'tallow__calx_way');
    await j.play('Wait a while');
    Placed.at(j, 'tallow__green');
    await j.play('Tell the Ferryman the road runs through the hill', 'Into the Chandler\'s Arms',
      'Ask Merren who feeds the road guard', 'Out to Swallet green', 'To Swallet lane', 'To the west road\'s end');
    expect(j.at('lc_cell')).toBe('tallow__west_end');
    const cell = j.campaign.actors.find(a => a.id === 'tallow__lc_cell')!;
    expect(cell.members.length).toBe(j.holds('lc_cell_kind', 'lc_marauders') ? 3 : 2);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    expect(resumed.campaign.actors.find(a => a.id === 'tallow__lc_cell')!.members).toEqual(cell.members);
    expect(resumed.at('lc_cell')).toBe('tallow__west_end');
    const food = j.measure('quantity', 'party', 'rations');
    const carried = j.measure('quantity', 'lc_cell', 'rations');
    const gold = j.measure('quantity', 'party', 'gold');
    await j.play('Buy the Ferryman\'s people out of their food for three coin');
    expect(j.measure('quantity', 'party', 'rations')).toBe(food + carried);
    expect(j.measure('quantity', 'party', 'gold')).toBe(gold - 3);
    expect(j.measure('quantity', 'lc_cell', 'rations')).toBe(0);
    expect(j.holds('lcCellPaid', 'party')).toBe(true);
    expect(j.holds('lcCellDelivered', 'party')).toBe(false);
    await j.play('==+42');
    expect(j.at('lc_cell')).not.toBe('tallow__calx_portal');
    expect(j.holds('lcCellDelivered', 'party')).toBe(false);
  }, 10000);
});
