import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Frontier } from '../src/world/frontier';
import { WorldGrid } from '../src/world/world-grid';
import { WorldShape } from '../src/world/world-shape';
import { PlaceNames } from '../src/world/place-names';
import { Terrain } from '../src/world/land/terrain';
import { GeneratedWorld } from './support/generated';
import { ModuleWriter } from '../src/lang/module-writer';

// The shape of Imbar (data/imbar/shape.json), the same in every world whatever its seed: the Eastern Ocean east of
// the first country's eastern neighbour, the Great Desert south beyond its southern neighbour (south is +y on the
// grid), the Southern Sea beyond the desert and the Southern Continent beyond that. The first country's east falls to
// the ocean, and Tolleth, the Dorothea's harbour, has its way in on that shore (M19-101). The march toward the ocean
// is its shore: no road goes over, and nothing is drawn beyond it.
class Shape {
  static readonly seeds = ['a1', 'b2', 'd4', 'g7', 'h8', 'kite', 'wren', 'thorn'];
  static called(seed: string, x: number, y: number): string {
    return PlaceNames.regionName(WorldGrid.drawn(seed, x, y));
  }
}
describe('the shape of the world', () => {
  it('holds the ocean east, the desert south, and the sea and continent beyond, named as one', () => {
    for (const seed of Shape.seeds) {
      for (const [x, y] of [[2, 0], [3, -1], [2, 3], [5, 1]] as const) {
        expect([seed, x, y, WorldShape.sea(x, y), Shape.called(seed, x, y)]).toEqual([seed, x, y, true, 'the Eastern Ocean']);
      }
      for (const [x, y] of [[0, 2], [1, 3], [-2, 2], [-1, 3]] as const) {
        const drawn = WorldGrid.drawn(seed, x, y);
        expect([seed, x, y, drawn.terrain]).toEqual([seed, x, y, 'desert']);
        expect(Shape.called(seed, x, y)).toMatch(/^\S+ of the Great Desert$/);
      }
      expect(Shape.called(seed, 0, 4)).toBe('the Southern Sea');
      expect(Shape.called(seed, -1, 6)).toMatch(/^\S+ of the Southern Continent$/);
      // The first country's own neighbours are its seed's, as they were.
      for (const [x, y] of [[1, 0], [0, 1], [-1, 0], [0, -1]] as const) { expect(WorldShape.at(x, y)).toBeUndefined(); }
      // The eastern neighbour's march east is the ocean's shore, with no road over.
      expect(WorldGrid.beyond(seed, [1, 0])!.east).toMatchObject({ name: 'the Eastern Ocean', closed: true, sea: true });
    }
  });
  it('gives the first country a coast on its east, and Tolleth\'s way in a cell beside the sea', async () => {
    for (const seed of Shape.seeds) {
      const region = (await WorldAssembler.assemble(seed, NodeBundleSource.shared)).report.region;
      const land = region.atlas!.land;
      expect([seed, land.coast]).toEqual([seed, 'east']);
      const edge = land.cover.filter((cover, c) => cover === 'sea' && Terrain.x(land, c) === land.width - 1);
      expect(edge.length).toBeGreaterThan(0);
      const gate = region.provinces!.find(p => p.country === 'tolleth')!.gate;
      expect([seed, Terrain.neighbours(land, gate.cell).some(n => land.cover[n] === 'sea')]).toEqual([seed, true]);
    }
  }, 120000);
  it('stops the road east at the ocean\'s shore, and draws nothing beyond it', async () => {
    const seed = 'a1', w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    const s = await PlaySession.start(w.path, seed, w.source), frontier = new Frontier(seed, NodeBundleSource.shared);
    GeneratedWorld.put(s, 'edge_east');
    expect((await frontier.expand(s.campaign))!.rid).toBe('x1y0');
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'x1y0__edge_east') }]));
    const shore = s.campaign.module.entities.find(e => e.id === 'x1y0__edge_east');
    expect(shore?.name).toBe('the shore of the Eastern Ocean');
    expect(frontier.drawing(s.campaign)).toBe(false);
    expect(await frontier.expand(s.campaign)).toBeUndefined();
    expect(s.campaign.installed.filter(id => /x2y0/.test(id))).toEqual([]);
  }, 120000);
});
