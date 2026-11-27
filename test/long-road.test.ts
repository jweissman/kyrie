import { describe, expect, it } from 'bun:test';
import { Placed } from './support/placed';
import { prepared } from './support/long-road';

describe('The road under the hill: the western portal', () => {
  it('sends the crew to clear the actual fall, without opening the gate farther in', async () => {
    const j = await prepared();
    await j.play('Ask the road crew what they can repair', 'Send Merren\'s crew to clear the western portal', '==+12');
    expect(j.at('lc_crew')).toBe('tallow__calx_portal');
    expect(j.holds('state', 'buried_portal', 'buried')).toBe(true);
    await j.play('==+18');
    expect(j.holds('state', 'buried_portal', 'dug')).toBe(true);
    expect(j.holds('state', 'portal_inside', 'cleared')).toBe(true);
    expect(j.holds('state', 'calx_gate', 'raised')).toBe(false);
    expect(j.holds('lcClearedByCrew', 'party')).toBe(true);
  }, 120000);

  it('interrupts the work when the informed Ferryman sends a guard, then resumes after it leaves', async () => {
    const j = await prepared();
    await j.play('Out to Swallet green', 'Hear the Ferryman\'s offer');
    // Skip only the descent: the original Tallow journey proves the way to the Calx Way.
    Placed.at(j, 'tallow__calx_way');
    await j.play('Wait a while');
    Placed.at(j, 'tallow__green');
    await j.play('Tell the Ferryman the road runs through the hill', 'Into the Chandler\'s Arms',
      'Ask the road crew what they can repair', '==+15', 'Send Merren\'s crew to clear the western portal', '==+30');
    expect(j.at('lc_vanguard')).toBe('tallow__calx_portal');
    expect(j.holds('lcWorkPaused', 'party')).toBe(true);
    expect(j.holds('state', 'buried_portal', 'buried')).toBe(true);
    // Move the guard away to isolate work resuming; combat has its own encounter.
    Placed.move(j, 'tallow__lc_vanguard', 'tallow__west_end');
    await j.play('==+24');
    expect(j.holds('state', 'buried_portal', 'dug')).toBe(true);
    expect(j.holds('lcWorkPaused', 'party')).toBe(false);
  }, 120000);

});
