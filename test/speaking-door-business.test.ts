import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Runner } from '../src/cli/runner';
import { RunnerWalk } from '../src/cli/runner-walk';

// At the place the followed aim names, its grave choices are its business: promoted into the four with their grave
// mark and no gold, and nothing gilds the way back out (the lead's ruling, 15 November). At Mistlake's speaking door,
// push, pull and listen spent and the letters over it read, the four had been the way out to the woods, a wait and a
// spell, the riddle's words buried in the rest.
describe('the speaking door, its safe tries spent', () => {
  it('leads with its words, grave and never gold, and not with the way out', async () => {
    const s = await DrawnWorld.start('a1', { origin: 'order', party: [{ name: 'Hamo', raceId: 'human',
      classId: 'cleric', backgroundId: 'doctor' }] }, NodeBundleSource.shared);
    const walk = await RunnerWalk.run(new Runner(s), 'straight', 8, 1);
    // Before, the door's own safe tries are its gold (look, push, listen); after, nothing is.
    const said = walk.turns.find(t => t.offer.primary.some(o => /^Press the word/.test(o.label))
      && !t.offer.primary.some(o => /look at the speaking door/.test(o.label)))!;
    expect(said).toBeDefined();
    const words = said.offer.primary.filter(o => /^Press the word/.test(o.label));
    expect(words.length).toBeGreaterThanOrEqual(2);
    expect(words.every(o => o.marks.includes('grave') && !o.aspects.includes('undertaking'))).toBe(true);
    expect(said.offer.primary.filter(o => o.aspects.includes('undertaking'))).toEqual([]);
  }, 120000);
});
