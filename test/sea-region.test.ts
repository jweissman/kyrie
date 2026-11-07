import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { AuthoredLand } from '../src/world/authored-land';
import { BoardTiles } from '../web/reader/board/board-tiles';

// A sea region (the owner's brief for regions: a sea of ocean tiles with far-flung islands, and a few terrains that
// no generator draws): opt-in, by an authored region saying `terrain(region, archipelago)`. Nothing else is drawn
// differently, so no world already played changes.
const places = [[0, 0], [2, 0], [0, 1], [3, 2], [1, 3], [5, 1]];
async function chart(terrain: string | undefined, seed: string, at = places) {
  const body = at.map(([x, y], i) => `Place i${i} "Isle ${i}" is ${i % 2 ? 'wilderness' : 'settlement'} within reach at ${x}, ${y}.`)
    .join('\n');
  const source = new OverlayBundleSource(NodeBundleSource.shared, {
    'sea/site.kyr': `Module sea "Sea" { Place reach "The Reach" is region.
      ${terrain ? `Initially Assert terrain(reach, ${terrain}).` : ''}
      ${body}
      Place deck "the deck" is room within i1 at 0, 0. Company party "You" of 1 at deck. }`,
    'sea/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
      exports: { party: 'party' } }),
    'sea.campaign.json': JSON.stringify({ version: 1, name: 'sea', modules: [{ id: 'p', bundle: 'sea/module.json' }],
      party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
  const s = await PlaySession.start(source.resolve('sea.campaign.json'), seed, source);
  const module = s.campaign.world.module, region = module.entities.find(e => e.id.endsWith('reach'))!.id;
  return { land: AuthoredLand.of(module, region)!, ids: places.map((_, i) => module.entities.find(e => e.id.endsWith(`i${i}`))!.id) };
}
// The islands: land cells joined by a hex or square step, as cell sets.
function islands(c: { width: number; height: number; cover: string }): number[][] {
  const seen = new Set<number>(), out: number[][] = [];
  const near = (i: number) => [-1, 0, 1].flatMap(dy => [-1, 0, 1].map(dx => [dx, dy] as const))
    .map(([dx, dy]) => [i % c.width + dx, Math.floor(i / c.width) + dy] as const)
    .filter(([x, y]) => x >= 0 && y >= 0 && x < c.width && y < c.height).map(([x, y]) => y * c.width + x);
  for (let i = 0; i < c.cover.length; i++) {
    if (c.cover[i] === '~' || seen.has(i)) { continue; }
    const island = [i], todo = [i]; seen.add(i);
    while (todo.length) { for (const n of near(todo.pop()!)) { if (c.cover[n] !== '~' && !seen.has(n)) { seen.add(n); island.push(n); todo.push(n); } } }
    out.push(island);
  }
  return out;
}
const gap = (c: { width: number }, a: number[], b: number[]) => Math.min(...a.flatMap(p => b.map(q =>
  Math.max(Math.abs(p % c.width - q % c.width), Math.abs(Math.floor(p / c.width) - Math.floor(q / c.width))))));

describe('terrains no generator draws', () => {
  it('are registered, laid as land by an authored region and coloured on the board', async () => {
    for (const t of ['jungle', 'volcanic', 'saltflat', 'reef']) {
      const { land } = await chart(t, 'k1');
      expect(land.cover).not.toContain('~');
      expect(new Set(land.cover).size).toBeGreaterThan(1);
      expect(BoardTiles.tone(t, '.')).not.toEqual(BoardTiles.tone(undefined, '.'));
      expect(BoardTiles.tone(t, 'f')).not.toEqual(BoardTiles.tone('desert', 'f'));
    }
    expect(BoardTiles.tone('forest', '.')).toEqual(BoardTiles.tone(undefined, '.'));
  }, 120000);
});

describe('a sea region', () => {
  it('is open water with at least three islands, two or more hexes of water between them', async () => {
    for (const seed of ['a', 'b', 'c', 'd']) {
      const { land, ids } = await chart('archipelago', seed);
      const isles = islands(land);
      expect(isles.length).toBe(places.length);
      expect(land.cover.split('').filter(c => c === '~').length).toBeGreaterThan(land.cover.length / 2);
      for (const id of ids) { expect(land.cover[land.places[id]!]).not.toBe('~'); }
      for (let i = 0; i < isles.length; i++) {
        for (let j = i + 1; j < isles.length; j++) {
          expect(gap(land, isles[i]!, isles[j]!)).toBeGreaterThanOrEqual(3);
        }
      }
    }
  }, 120000);
  it('leaves a region that does not ask for it as it was', async () => {
    const plain = await chart(undefined, 'a'), again = await chart('forest', 'a');
    expect(plain.land.cover).toBe(again.land.cover);
    expect(plain.land.cover).not.toContain('~');
    expect(await Bun.hash(JSON.stringify(plain.land))).toBe(await Bun.hash(JSON.stringify(again.land)));
  }, 120000);
});
