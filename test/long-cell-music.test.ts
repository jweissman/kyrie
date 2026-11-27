import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

const meeting = async () => {
  const j = await Journey.start(campaign, 'cell-approach-0');
  j.assert('lcRoadTold', 'party');
  j.assert('lcVanguardArrived', 'party');
  Placed.at(j, 'tallow__green');
  await j.play('To Swallet lane', 'To the west road\'s end');
  expect(j.holds('lc_cell_kind', 'lc_musicians')).toBe(true);
  expect(j.at('lc_cell')).toBe('tallow__west_end');
  return j;
};

describe('the travelling players\' road tune', () => {
  it('shares one real ration after two good turns, leaving the rest for the guard', async () => {
    const j = await meeting();
    const food = j.measure('quantity', 'party', 'rations');
    const carried = j.measure('quantity', 'lc_cell', 'rations');
    await j.play('Play a road tune with the travelling players');
    j.roll('pass');
    await j.play('Carry the melody');
    j.roll('fail');
    await j.play('Listen for the fiddler\'s next turn');
    expect(j.holds('lcMusicPlaying', 'party')).toBe(true);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    resumed.roll('pass');
    await resumed.play('Listen for the fiddler\'s next turn');
    expect(resumed.holds('lcMusicPlaying', 'party')).toBe(false);
    expect(resumed.measure('quantity', 'party', 'rations')).toBe(food + 1);
    expect(resumed.measure('quantity', 'lc_cell', 'rations')).toBe(carried - 1);
    resumed.put('lc_vanguard', 'tallow__calx_portal');
    await resumed.play('==+4');
    expect(resumed.holds('lcCellDelivered', 'party')).toBe(true);
    expect(resumed.measure('quantity', 'lc_vanguard', 'rations')).toBe(carried - 1);
  }, 10000);

  it('lets the players leave with all their food after two missed turns', async () => {
    const j = await meeting();
    const food = j.measure('quantity', 'party', 'rations');
    const carried = j.measure('quantity', 'lc_cell', 'rations');
    await j.play('Play a road tune with the travelling players');
    j.roll('fail');
    await j.play('Carry the melody', 'Listen for the fiddler\'s next turn');
    expect(j.holds('lcMusicPlaying', 'party')).toBe(false);
    expect(j.measure('quantity', 'party', 'rations')).toBe(food);
    j.put('lc_vanguard', 'tallow__calx_portal');
    await j.play('==+4');
    expect(j.measure('quantity', 'lc_vanguard', 'rations')).toBe(carried);
  }, 10000);

  it('does not hold the supply cell indefinitely when the company stops playing', async () => {
    const j = await meeting();
    await j.play('Play a road tune with the travelling players');
    await j.play('==+5');
    expect(j.holds('lcMusicPlaying', 'party')).toBe(false);
    expect(j.at('lc_cell')).toBe('tallow__calx_portal');
    expect(j.measure('lcMusicGood', 'party')).toBe(0);
  }, 10000);

  it('abandons the tune without a reward when the company leaves', async () => {
    const j = await meeting();
    const carried = j.measure('quantity', 'lc_cell', 'rations');
    await j.play('Play a road tune with the travelling players');
    j.roll('pass');
    await j.play('Carry the melody', 'To Swallet lane');
    expect(j.holds('lcMusicPlaying', 'party')).toBe(false);
    expect(j.measure('lcMusicGood', 'party')).toBe(1);
    expect(j.measure('quantity', 'lc_cell', 'rations')).toBe(carried);
    expect(j.at('lc_cell')).toBe('tallow__calx_portal');
  }, 10000);
});
