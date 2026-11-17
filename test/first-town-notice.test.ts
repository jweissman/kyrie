import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';

// The first town holds one neighbour's notice among its own goings-on (CO-03): every neighbouring country's notice had
// hung there, the same in every world, Merrowdale's forty crowns first. One, drawn by the country's name, still says
// a neighbour is there to be found; the rest hang in the country's other towns, and are asked after in the first.
const notices = async (seed: string) => {
  const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
    { origin: 'wanderer', party: [{ name: 'Aud', raceId: 'human', classId: 'warrior' }] });
  const c = (await PlaySession.start(w.path, seed, w.source)).campaign;
  const ids = c.module.entities.map(e => e.id), first = ids.filter(id => /_notice_s1$/.test(id));
  return { first, elsewhere: ids.filter(id => /_notice_s[2-9]$/.test(id)).length, asked: c.module.actions
    .filter(a => /_beyond_told_s1$/.test(a.id)).length };
};
describe('a neighbour\'s notice', () => {
  it('is one in the first town, the rest in the country\'s other towns, each neighbour asked after in the first', async () => {
    for (const seed of ['a1', 'thorn']) {
      const { first, elsewhere, asked } = await notices(seed);
      expect(first.length).toBe(1);
      expect(elsewhere).toBeGreaterThan(first.length);
      expect(asked).toBeGreaterThan(1);
    }
  }, 120000);
});
