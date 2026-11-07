import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlaySession } from '../src/session/play-session';
import { Countries } from '../src/world/countries';
import { Foundings } from '../src/world/founding';
import { Frontier } from '../src/world/frontier';
import { RegionWriter } from '../src/world/region-writer';
import { Seats } from '../src/world/seats';
import { WorldAssembler } from '../src/world/world-assembler';
import { WorldGrid } from '../src/world/world-grid';
import { WorldShape } from '../src/world/world-shape';
import { GeneratedWorld } from './support/generated';

// Dun Rìerdan, the City of Seven Towers (the canon's dun_ri), is in every world, where the shape's seat for it says
// (data/imbar/shape.json): the chief town of the nearest country north of the first, in its column, that no great sea
// holds, which is the first country's northern neighbour (north is -y on the grid). The country is drawn by its own
// seed as any is, but its chief town is the city, named for it, and the canon's identity is seated there; what points
// there (the Dun Rìerdan waystone) points to that place, and from wherever the company is says which way it lies.
class City {
  static readonly seeds = ['a1', 'b2', 'd4', 'g7', 'kite', 'wren'];
  static readonly name = 'Dun Rìerdan';
  static async world(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    const s = await PlaySession.start(w.path, seed, w.source);
    return { s, terrain: w.report.region.terrain, frontier: new Frontier(seed, NodeBundleSource.shared) };
  }
}
describe('Dun Rìerdan, the City of Seven Towers', () => {
  it('is the chief town of the first country\'s northern neighbour in every world, seated as the canon\'s', () => {
    expect(WorldShape.seat('dun_ri')).toEqual([0, -1]);
    expect(WorldShape.seated(0, -1)?.identity).toBe('dun_ri');
    expect(WorldShape.at(0, -1)).toBeUndefined();
    for (const seed of City.seeds) {
      const region = WorldAssembler.region(seed, [0, -1]), city = region.settlements[0]!;
      expect([seed, city.name, city.size, city.seat]).toEqual([seed, City.name, 'town', 'dun_ri']);
      expect([seed, city.gloss]).toEqual([seed, undefined]);
      // A city of markets or of a harbour, not a fort holding a pass; and no other place there is called so.
      expect([seed, ['market', 'harbour'].includes(Foundings.kinds(region)[0]!)]).toEqual([seed, true]);
      expect([...region.settlements.slice(1), ...region.sites].filter(p => p.name === City.name)).toEqual([]);
      // The country itself is its seed's: it is named as drawn, not for the city.
      expect(region.name).not.toBe(City.name);
      expect(RegionWriter.source(region, null)).toContain('  Initially Assert seatOf(dun_ri, s1).');
      expect((RegionWriter.manifest(region) as { canon: string[] }).canon).toContain('dun_ri');
      // No authored country is laid in its cell; no other country's chief town is the city.
      expect(Countries.plan(seed, WorldAssembler.region(seed, [0, 0]).terrain).has('x0ym1')).toBe(false);
      expect(WorldAssembler.region(seed, [0, 0]).settlements.some(s => s.seat || s.name === City.name)).toBe(false);
      expect(WorldGrid.beyond(seed, [0, 0])!.north).not.toHaveProperty('sea');
    }
  }, 120000);
  it('is where the waystone points, from the first country, on the road north, and in the city', async () => {
    for (const seed of ['a1', 'wren']) {
      const { s } = await City.world(seed), frontier = new Frontier(seed, NodeBundleSource.shared);
      const world = () => s.campaign.world;
      // Before anyone has gone north, the waystone points the way the shape says, to no place yet.
      expect(Seats.pointed(world(), 'dun_rierdan_waystone')).toEqual({ identity: 'dun_ri', name: City.name, cell: [0, -1] });
      expect([seed, Seats.line(world(), 'dun_rierdan_waystone')]).toEqual([seed, `It points north, toward ${City.name}.`]);
      expect(Seats.line(world(), 'torch')).toBeUndefined();
      GeneratedWorld.put(s, 'edge_north');
      await frontier.expand(s.campaign);
      expect(s.campaign.installed).toContain('x0ym1');
      // The country north is drawn: the city is its chief town, and the canon's Dun Rì is seated in it.
      expect(world().test(ModuleWriter.call('seatOf', 'dun_ri', 'x0ym1__s1'))).toBe(true);
      expect(world().related('seatOf', 'dun_ri').map(r => r.args[1])).toEqual(['x0ym1__s1']);
      expect(s.campaign.module.entities.find(e => e.id === 'x0ym1__s1')?.name).toBe(City.name);
      expect(Seats.pointed(world(), 'dun_rierdan_waystone'))
        .toEqual({ identity: 'dun_ri', name: City.name, place: 'x0ym1__s1', cell: [0, -1] });
      // Its towers are the city's, and found there; so is the College, seated in the Tower of Doors.
      for (const tower of ['tower_of_the_ri', 'tower_of_the_harp', 'tower_of_the_teulu', 'mages_college', 'the_llys']) {
        expect([tower, Seats.place(world(), tower)]).toEqual([tower, 'x0ym1__s1']);
      }
      // In the city's country it points to the city; in the city it is still.
      expect(Seats.line(world(), 'dun_rierdan_waystone', 'x0ym1__edge_south'))
        .toBe(`It points toward ${City.name}, in this country.`);
      expect(Seats.line(world(), 'dun_rierdan_waystone', 'x0ym1__s1_green')).toBe(`It is still: ${City.name} is here.`);
      expect(Seats.line(world(), 'dun_rierdan_waystone', 'region__s1_green'))
        .toBe(`It points north, toward ${City.name}.`);
    }
  }, 240000);
});
