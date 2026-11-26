import { describe, expect, it } from 'bun:test';
import { Arrivals } from '../support/arrivals';
import { PlayerFrame } from '../../src/presentation/player-frame';
import { PlayerView } from '../../src/presentation/player-view';

// What the company perceives reads the frame's rows, the one row set of the revision (platform-separation.md's
// immediate queue, step 4), not a copy of its own: the choices it holds are the frame's own choices, the same objects,
// and a command is resolved from them. Along the arrivals track, at every place.
describe('what the company perceives', () => {
  it('holds the frame\'s own rows, not a copy of them', async () => {
    const s = await Arrivals.start(), c = s.campaign;
    for (const passage of ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12']) {
      const rows = PlayerFrame.of(c).rows, seen = PlayerView.observe(c).choices;
      expect(seen.length).toBe(rows.length);
      expect(seen.every((choice, i) => choice === rows[i]!.choice)).toBe(true);
      await s.leg(Arrivals.way(s, passage));
    }
  });
});
