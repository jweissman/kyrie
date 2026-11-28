import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { ScenarioTowns } from '../../src/world/scenario-towns';
import { WorldAssembler } from '../../src/world/world-assembler';
import { WorldShape } from '../../src/world/world-shape';

// The Empty Seat is set in the canon's city, Dun Rìerdan, and makes no city of its own (doc/adventures/theemptyseat/
// friction.md, ES-F01): its seat says what goes on there in every world (data/imbar/shape.json's `goings`), and the
// country the seat makes the city of places it there, its ward the city and its square the city's heart, one march
// north of the first country and never in it. The install itself is test/dun-rierdan.test.ts's (a drawn world).
describe('The Empty Seat, in the city of the canon', () => {
  it('is placed in the seat\'s country, over the city, and in no other country', async () => {
    for (const seed of ['wren']) {
      const first = WorldAssembler.region(seed, [0, 0]);
      expect(WorldShape.goings(first)).toEqual([]);
      const north = await WorldAssembler.beyond(seed, NodeBundleSource.shared,
        { x: 0, y: -1, exclude: [], first: first.terrain });
      const city = north.region.settlements.find(s => s.seat === 'dun_ri')!;
      const seat = north.requests.find(r => r.id === 'x0ym1theemptyseat');
      expect([seed, seat?.imports]).toEqual([seed,
        { party: 'region.party', ward: `x0ym1.${city.id}`, square: `x0ym1.${city.id}_green` }]);
      expect(north.requests.filter(r => /news$/.test(r.id)).map(r => r.imports?.news_place))
        .toEqual(['x0ym1theemptyseat.entry', 'x0ym1theemptyseat.guild_hall']);
    }
  }, 20000);
  it('is set nowhere a country holds no such city', () => {
    const region = WorldAssembler.region('a1', [0, 0]);
    expect(ScenarioTowns.town('seat:dun_ri', { region, bindings: {}, claimed: new Set(), key: 'k', parts: [] })).toBe('');
  });
});
