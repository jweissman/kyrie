import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';

// The first town's notices are its own (CO-03): a neighbouring country's notice (Merrowdale's forty crowns) had hung
// in the first town of every world. It hangs in the country's other towns, and in the first the neighbour is heard
// of by asking, as everywhere.
const notices = async (seed: string) => {
  const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
    { origin: 'wanderer', party: [{ name: 'Aud', raceId: 'human', classId: 'warrior' }] });
  const c = (await PlaySession.start(w.path, seed, w.source)).campaign;
  return { c, posted: c.module.entities.map(e => e.id.match(/_notice_(s\d+)$/)?.[1]).filter(Boolean) };
};
describe('a neighbour\'s notice', () => {
  it('hangs in the country\'s other towns, not the first, whose way to the neighbour is still asked after', async () => {
    for (const seed of ['a1', 'thorn']) {
      const { c, posted } = await notices(seed);
      expect(posted.length).toBeGreaterThan(0);
      expect(posted).not.toContain('s1');
      expect(c.module.actions.some(a => /_beyond_told_s1$/.test(a.id))).toBe(true);
    }
  }, 120000);
});
