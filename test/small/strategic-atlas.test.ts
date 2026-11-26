import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../../src/world/world-assembler';
import { RegionWriter } from '../../src/world/region-writer';
import { StrategicAtlas } from '../../src/world/strategic-atlas';
import { CanonVocabulary } from '../../src/canon/canon-vocabulary';

// The strategic atlas (data/imbar/atlas.json; mission-22/world/orientation.md): the worlds it lists draw its countries
// as it says, each with its own detail, and every other world is drawn as it was.
const worlds = StrategicAtlas.worlds;
const first = (seed: string) => WorldAssembler.region(seed, [0, 0]);
describe('the strategic atlas', () => {
  it('changes nothing in a world it does not list', () => {
    const a1 = first('a1');
    expect(StrategicAtlas.given('a1', 0, 0)).toEqual({});
    expect(a1.country).toBeUndefined();
    expect(StrategicAtlas.named(a1)).toEqual(a1);
    expect(StrategicAtlas.shaped(a1, 'a1', [0, 0])).toEqual(a1);
    expect(StrategicAtlas.lines(a1)).toEqual([]);
  });
  it('draws the same world from the same seed', () => {
    expect(JSON.stringify(first(worlds[0]!))).toBe(JSON.stringify(first(worlds[0]!)));
  });
  it('gives every world it lists the same countries, with their seats, livelihoods, makers and neighbours', () => {
    for (const seed of worlds) {
      const r = first(seed);
      expect([r.name, r.country, r.terrain, r.shore]).toEqual(['Iscoed', 'iscoed', 'marsh', 'east']);
      // The chief town is the port, and lives by salt, whatever the seed.
      expect(r.settlements[0]).toMatchObject({ name: 'Porthalen', size: 'town', trade: 'salt' });
      expect(r.settlements.map(s => s.name)).toEqual(expect.arrayContaining(['Wrackham', 'Edderwick', 'Gatesend']));
      expect(r.history!.makers.map(m => m.art)).toEqual(['water', 'bone']);
      expect([r.beyond!.north!.name, r.beyond!.west!.name]).toEqual(['Rìerdan', 'Brynach']);
      const north = WorldAssembler.region(seed, [0, -1]), west = WorldAssembler.region(seed, [-1, 0]);
      expect(north.settlements[0]).toMatchObject({ name: 'Dun Rìerdan', seat: 'dun_ri' });
      expect([west.name, west.terrain, west.ancestry]).toEqual(['Brynach', 'mountain', 'dwarf']);
      expect(west.history!.makers.map(m => m.art)).toEqual(['deep', 'sky']);
      expect(west.settlements.map(s => s.trade)).not.toContain('salt');
    }
  });
  it('lets each world it lists draw its own detail', () => {
    const drawn = worlds.map(first);
    const keepers = drawn.map(r => r.settlements.map(s => s.innkeeper).join('/'));
    const sites = drawn.map(r => r.sites.map(s => s.name).join('/'));
    expect(new Set(keepers).size).toBe(worlds.length);
    expect(new Set(sites).size).toBe(worlds.length);
  });
  it('writes the country\'s facts into its module, for its people to tell', () => {
    const source = RegionWriter.source(first(worlds[0]!), null, {}, CanonVocabulary.context());
    expect(source).toContain('Entity country_iscoed: fact "Iscoed is the Rì\'s southern march');
    expect(source).toContain('Entity country_iscoed_short: fact "Iscoed: fuel for the pans, iron');
    expect(source).toContain('Entity country_iscoed_west: fact "West of Iscoed is Brynach, a lordship of the fells');
  });
});
