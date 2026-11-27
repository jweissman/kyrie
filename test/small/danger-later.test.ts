import { describe, expect, it, spyOn } from 'bun:test';
import { DangerSense } from '../../src/presentation/danger-sense';
import type { Battle } from '../../src/battle';

// A fight's reckoning made after its frame has gone (DangerSense.later, OR-1351) is made only while the host still
// waits on that fight: one gone on from (its turn answered, the fight over, a new game begun) had been reckoned anew
// with its fighters let go of, and thrown "Invalid combatant" between commands (test/compositions, red main after
// OR-1451).
describe('a fight reckoned later', () => {
  it('is not reckoned once the host has gone on from it', async () => {
    const battle = {} as Battle;
    const known = spyOn(DangerSense, 'known').mockReturnValue({ fresh: false });
    const of = spyOn(DangerSense, 'of').mockImplementation(() => { throw new Error('Invalid combatant'); });
    let moved = 0;
    DangerSense.later(battle, () => { moved++; }, () => false);
    await new Promise(resolve => setTimeout(resolve, 5));
    expect([of.mock.calls.length, moved]).toEqual([0, 0]);
    of.mockReturnValue({ text: 'new' } as ReturnType<typeof DangerSense.of>);
    DangerSense.later(battle, () => { moved++; }, () => true);
    await new Promise(resolve => setTimeout(resolve, 5));
    expect(moved).toBe(1);
    known.mockRestore(); of.mockRestore();
  });
});
