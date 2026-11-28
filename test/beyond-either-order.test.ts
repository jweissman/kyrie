import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { StoryCasts } from '../src/campaign/story-casts';
import { Frontier } from '../src/world/frontier';
import { WorldAssembler } from '../src/world/world-assembler';

// The countries beyond the marches hold the same stories, and name their people alike, whichever the company came to
// first (OR-1745): a country beyond had left out every scenario placed in the countries installed before it, so two
// lives of one seed that crossed the south march first and the west march first found other stories beyond the west
// one. What a country beyond leaves out is what the world's first country places, decided as the world was drawn.
// s0's first country is a forest; its installations as an s0 life begins (the region, its stories and their words,
// the origin, the arrival and the kits), and the two countries beyond its south and west marches.
const seed = 's0', base = NodeBundleSource.shared, first = 'forest';
const world = ['region', 'factors', 'word1', 'players', 'word2', 'sink', 'brood', 'word3', 'den', 'word4', 'tower',
  'word5', 'disputation', 'word6', 'drover', 'oxen', 'word7', 'circus', 'word8', 'arcology', 'word9', 'howe', 'word10',
  'keep', 'word11', 'fellowship', 'word12', 'walk', 'word13', 'origin', 'arrival', 'raiders', 'toll', 'price'];
const south = [0, 1] as const, west = [-1, 0] as const;
class EitherOrder {
  // A country beyond drawn as Frontier draws it, with the world holding what it holds then: its stories' requests,
  // drawn apart as they are installed (Frontier.apart), and the names they cast.
  static async drawn([x, y]: readonly [number, number], held: string[]) {
    const exclude = await Frontier.placed(base, held);
    const beyond = await WorldAssembler.beyond(seed, base, { x, y, exclude, first });
    const requests = [...beyond.requests];
    const cast = await StoryCasts.drawApart(requests, { seed, source: beyond.source, among: beyond.names });
    return { exclude, ids: requests.map(r => r.id), taken: requests.map(r => r.context?.taken ?? null), cast };
  }
}
describe('the countries beyond, in either order', () => {
  it('hold the same stories, their people named alike, whichever is reached first', async () => {
    const southFirst = await EitherOrder.drawn(south, world);
    const westAfter = await EitherOrder.drawn(west, [...world, ...southFirst.ids]);
    const westFirst = await EitherOrder.drawn(west, world);
    expect(westAfter).toEqual(westFirst);
    // And the south, reached after the west, is drawn from what it was drawn from first.
    expect(await Frontier.placed(base, [...world, ...westFirst.ids])).toEqual(southFirst.exclude);
    // Neither repeats what the first country places, and each holds stories of its own.
    expect(southFirst.exclude).toEqual(expect.arrayContaining(['brood-hollow', 'den', 'unquiet-tower', 'drover']));
    for (const c of [southFirst, westFirst]) {
      expect(c.ids.filter(id => /^x(m?\d+)y(m?\d+)(den|tower|brood|drover)$/.test(id))).toEqual([]);
      expect(c.ids.filter(id => /word\d+$/.test(id)).length).toBeGreaterThan(0);
    }
  }, 30000);
});
