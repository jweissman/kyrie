import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A road's roll is keyed by stable identity (OR-1345; AGENTS.md: random draws are keyed by stable identity, not one
// sequential stream): a band's fortune on a road for the day (fortune(band, road)), not the watch's die (dice(clock)),
// so that a leg walked on a given day meets the same fate however long the acts before it took. The watch's die had
// made every road come out otherwise whenever an earlier act took longer: the weir route set upon where it had not
// been, journey receipts no longer set upon where they had. A fragment: a lane out of a town onto a road, walked after
// a short wait and after a long one, the same morning, in a dozen worlds; beside it the same roll on the watch's die.
const lane = `
  Place town "the town" is room at 0, 0 outdoors.
  Place road "the road" is room at 1, 0 outdoors.
  Passage lane "the lane" is road between town and road.
  Company party "You" of 1 at town.
  Relation fated(place). Relation chanced(place).
  Rule fate when at(party, road) and fortune(party, road) <= 50 and not fated(road) { Assert fated(road). }
  Rule chance when at(party, road) and dice(clock) <= 50 and not chanced(road) { Assert chanced(road). }
  Goal false.`;
const walk = async (seed: string, wait: string) => {
  const t = await Tiny.start(lane, { seed });
  await t.play(wait, 'To the road');
  return { day: t.world.number({ kind: 'call', name: 'day', args: ['clock'] }),
    fated: t.world.related('t__fated').length > 0, chanced: t.world.related('t__chanced').length > 0 };
};
describe('a road\'s roll', () => {
  it('is the same for a leg walked the same day, however long the act before it took', async () => {
    const seeds = Array.from({ length: 12 }, (_, n) => `fortune${n}`);
    const runs = await Promise.all(seeds.map(async seed => [await walk(seed, 'Wait a while'),
      await walk(seed, 'Wait an hour')] as const));
    for (const [short, long] of runs) {
      expect(long.day).toBe(short.day);
      expect(long.fated).toBe(short.fated);
    }
    // Its odds are a die's: some worlds meet it on that road that day, and some do not.
    expect(runs.some(([s]) => s.fated)).toBe(true);
    expect(runs.some(([s]) => !s.fated)).toBe(true);
    // The watch's die, beside it, comes out otherwise in some world for the longer wait alone.
    expect(runs.some(([s, l]) => s.chanced !== l.chanced)).toBe(true);
  }, 30000);
});
