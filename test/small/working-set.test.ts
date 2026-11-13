import { describe, expect, it } from 'bun:test';
import { ScaleCosts } from '../../scripts/scale-costs';

// An operation pays for its working set, not the whole world (the owner, 14 November): one cellar of five things
// held constant while thirty-two times as many rooms and things it has no reason to touch are added elsewhere. Held as
// ratios, which a shared lane's load scales alike. Before the repairs (doc/architecture/mission-21/
// loading-boundaries.md §6), starting grew with the square of the world (exclusive asserts each went through their
// whole relation; Ohm's children rebuilt per declaration), and looking again in the cellar grew with it too
// (look_closely proposed every thing in the world that suits looking).
describe('the working set', () => {
  it('starts in time near the world it holds, and looks and acts in a room at a cost near the room', async () => {
    await ScaleCosts.one(10);
    const small = await ScaleCosts.one(100), large = await ScaleCosts.one(3200);
    const ratio = (name: string) => (large.ms[name] ?? 0) / Math.max(small.ms[name] ?? 0, 1);
    const grown = large.facts / small.facts;
    console.log(`  ×${grown.toFixed(0)} facts: start ×${ratio('start').toFixed(1)}, observe again ×${ratio('observe again')
      .toFixed(1)}, act ×${ratio('act').toFixed(1)}`);
    // Starting reads what the world holds, and so grows with it, but not with its square.
    expect(grown).toBeGreaterThan(24);
    expect(ratio('start')).toBeLessThan(grown * 3);
    expect(ratio('observe again')).toBeLessThan(5);
    expect(ratio('act')).toBeLessThan(5);
  }, 60_000);
});
