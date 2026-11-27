import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

const campaign = 'data/campaigns/low-water.campaign.json';
const reader = async (seed: string) => {
  const j = await Journey.start(campaign, seed);
  j.assert('befell', 'ash_count_begun');
  Placed.at(j, 'lowwater__taproom');
  await j.play('=+40');
  j.put('party', 'lowwater__w_aeneans');
  await j.play('=+1');
  expect(j.holds('at', 'lowwater__lw_reader', 'lowwater__w_aeneans')).toBe(true);
  return j;
};

describe('Low Water, under the count', () => {
  it('keeps a coin under the brass line of the oldest pot in the Full Measure', async () => {
    const j = await Journey.start(campaign, 'reach-low-water-coin');
    Placed.at(j, 'lowwater__taproom');
    for (let i = 0; i < 4 && !j.holds('holding', 'party', 'count_coin'); i++) {
      await j.play('Look inside the oldest pot');
    }
    expect(j.holds('holding', 'party', 'count_coin')).toBe(true);
  }, 9000);

  it('lets the reader saw out the Aeneans\' gate by the third morning, and the approach quickens', async () => {
    const j = await reader('reach-low-water-sawn');
    j.put('party', 'lowwater__taproom');
    await j.play('=+300');
    expect(j.holds('lowwater__lwGateTaken', 'party')).toBe(true);
  }, 9000);

  it('turns the reader when he is shown the third column was closed by hand', async () => {
    let gone = false;
    for (let i = 0; i < 8 && !gone; i++) {
      const j = await reader(`reach-low-water-shown-${i}`);
      j.assert('knows', 'party', 'lowwater__wheels_counted');
      await j.play('Show Maudrey');
      gone = j.holds('lowwater__lwReaderGone', 'party') && !j.holds('lowwater__lwGateTaken', 'party');
    }
    expect(gone).toBe(true);
  }, 9000);

  it('a broken count is worth nothing to him', async () => {
    const j = await reader('reach-low-water-broken');
    j.assert('lowwater__broken', 'lowwater__reckoner');
    await j.play('=+1');
    expect(j.holds('lowwater__lwReaderGone', 'party')).toBe(true);
    expect(j.holds('lowwater__lwGateTaken', 'party')).toBe(false);
  }, 9000);

  it('can be fought in the dark of the wheel-room', async () => {
    const j = await reader('reach-low-water-fight');
    expect(await j.play('Put out the reader')).toMatch(/comes? at you|Mind the gate/);
  }, 9000);
});
