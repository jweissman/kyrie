import { afterEach, describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import ecology from '../data/generation/tables/ecology.json';
import { Canon } from '../src/canon/canon';
import { CanonValidation } from '../src/canon/canon-validation';
import { Content } from '../src/content';
import { Draw } from '../src/world/land/draw';
import { RegionEcology } from '../src/world/region-ecology';
import { RegionGrowth } from '../src/world/region-growth';
import { RegionAnimals } from '../src/world/region-animals';
import { WorldAssembler } from '../src/world/world-assembler';
import { RegionWriter } from '../src/world/region-writer';
import { Herbals } from '../src/world/herbals';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import type { Region } from '../src/world/region-writer';
import type { Plant, Species } from '../src/canon/schema';

// One record for each thing that lives, and one vocabulary of where (the owner, 5 November, late): plants in
// data/catalog/plants.json, animals and monsters in their files, the kinds of country in data/catalog/habitats.json;
// organisms.json, which held plants beside three animals told twice, is retired. The ecology places by them: a plant
// written into plants.json grows wherever its habitat is, an animal whose record says how common it is dens there,
// with nothing else to write.
const added: { plants: string[]; species: string[] } = { plants: [], species: [] };
const region = async (seed: string) =>
  (await WorldAssembler.assemble(seed, NodeBundleSource.shared, {})).report.region as Region;
afterEach(() => {
  for (const id of added.plants.splice(0)) { delete (Canon.plants as Record<string, Plant>)[id]; }
  for (const id of added.species.splice(0)) { delete (Canon.species as Record<string, Species>)[id]; }
});

describe('natural history', () => {
  it('keeps one record of each living thing and one vocabulary of where it lives', () => {
    expect(existsSync('data/catalog/organisms.json')).toBe(false);
    expect(CanonValidation.problems()).toEqual([]);
    const keys = [...Object.values(ecology.denBeast.groups), ...Object.values(ecology.wildSign.groups)].flat()
      .map(r => r._key);
    expect(keys.filter(k => !Canon.isSpecies(k))).toEqual([]);
    expect(Object.keys(ecology.denBeast.groups).filter(h => !Canon.habitats[h])).toEqual([]);
    // A desert has its own beasts, not the fells' wolves and bears.
    expect(RegionEcology.terrain.desert).toBe('desert');
    expect(new Content('alias').createCreature('w', { raceId: 'grey_wolf' as never }).raceId).toBe('wolf');
  });
  it('grows a plant written into plants.json wherever its habitat is, with what it yields', async () => {
    (Canon.plants as Record<string, Plant>).bog_myrtle = { name: 'Bog myrtle', looks: 'A low shrub of grey-green leaves.',
      habitats: ['fen', 'heath'], stand: 'Bog myrtle grows low here, its leaves smelling of resin when brushed.',
      yields: 'herbs', gathered: 'a handful of bog myrtle', count: 1, uses: ['medicine'], abundance: 8,
      source: { kyr: true } };
    added.plants.push('bog_myrtle');
    expect(RegionGrowth.plants).toContain('bog_myrtle');
    const grown = (await Promise.all(['a1', 'b2', 'kite'].map(region))).flatMap(r => RegionGrowth.lines(r))
      .filter(l => l.includes('bog_myrtle'));
    expect(grown.some(l => l.includes('is scenery'))).toBe(true);
    expect(grown.some(l => /Item \w+_bog_myrtle_1 "a handful of bog myrtle" is herbs/.test(l))).toBe(true);
  }, 120000);
  const harrier = (temperament?: string): Species => ({ name: 'Marsh harrier', type: 'beast', kind: 'animal',
    description: 'A long-winged hawk of the reed-beds.', looks: 'A brown hawk with a pale head, quartering low over reeds.',
    statistics: {
      attributes: { strength: 6, dexterity: 12, constitution: 6, intelligence: 3, wisdom: 12, charisma: 4 },
      primary: 'dexterity', weapon: 'talons', growth: { hitPoints: { base: 4, perLevel: 1 } } },
    abilities: ['flee'], ...temperament ? { temperament } : {}, habitats: ['meadow'], abundance: 2,
    source: { kyr: true } });
  it('dens a beast written into animals.json where it lives, varied by its country, made as all are', async () => {
    (Canon.species as Record<string, Species>).marsh_harrier = harrier('territorial');
    added.species.push('marsh_harrier');
    const den = RegionEcology.den(await region('a1'), 'meadow')!;
    expect([den.species, den.label, den.nature]).toEqual(['marsh_harrier', 'the marsh harriers', 'wild']);
    const varied = RegionEcology.varied(den, { habitat: 'meadow', climate: 'temperate' }, new Draw('harrier'));
    const made = new Content('harrier').createCreature('h', { raceId: 'marsh_harrier', level: 3,
      ...varied.variations ? { variations: varied.variations } : {} });
    expect([made.raceId, made.base.maxHp > 0, made.base.abilities]).toEqual(['marsh_harrier', true, ['flee']]);
  });
  it('meets an animal that keeps no den in the open country where it lives, by its record alone', async () => {
    (Canon.species as Record<string, Species>).marsh_harrier = harrier();
    added.species.push('marsh_harrier');
    expect(RegionEcology.den(await region('a1'), 'meadow')?.species).not.toBe('marsh_harrier');
    // Among what open meadow shows of its living things, by its record alone, and wherever it is drawn, as it is
    // written. Which stretches meet one is chance, and the standing scenarios now keep some of them: no fixed set of
    // countries is sure to draw it.
    expect(RegionEcology.seen(new Set(['meadow'])).map(([k]) => k)).toContain('marsh_harrier');
    const lines = (await Promise.all(['a1', 'b2', 'kite'].map(region))).flatMap(r => RegionAnimals.lines(r))
      .filter(l => l.includes('marsh_harrier'));
    const met = /Person wa\d+ "a marsh harrier" at t\d+ \{ Role "a brown hawk.*Species marsh_harrier\./;
    expect(lines.every(l => met.test(l))).toBe(true);
  }, 120000);
  it('places every kind whose record says where it lives and how common it is, in a den or in the open', () => {
    const habitats = Object.keys(Canon.habitats);
    const placed = new Set([...habitats.flatMap(h => RegionEcology.recorded(h).map(r => r._key)),
      ...RegionEcology.seen(new Set(habitats)).map(([id]) => id)]);
    const said = Object.entries(Canon.species).filter(([, s]) => s.abundance).map(([id]) => id);
    expect(said.filter(id => !placed.has(id))).toEqual([]);
    // The kinds of Orsino's that were met only when summoned are among them: the deer, the otter, the dryad.
    expect(['deer', 'otter', 'rabbit', 'dryad', 'vampire', 'drake'].filter(id => !placed.has(id))).toEqual([]);
  });
  // A plant written in its author's own words (the owner's plants, 6 November): where it lives by any common word for
  // it (a forest is the wood, a moor the heath, a garden by houses and farms), the ground it likes by its soil (loam,
  // or rocky_vale for rocky), and what it gives by its record alone, with no item written for it.
  it('takes a plant written in its author\'s words, and gives what it yields from its record', () => {
    type Grown = Record<string, { habitats: string[]; grounds?: string[]; yields?: string; name: string;
      looks: string }>;
    const read = (Canon as unknown as { grown(r: Grown): Grown }).grown({ hazel: { name: 'Hazel', looks: 'A small tree.',
      habitats: ['forest', 'garden', 'moor'], grounds: ['loam', 'rocky_vale'], yields: 'hazel' } }).hazel!;
    expect([read.habitats, read.grounds, read.yields]).toEqual([['wood', 'settlement', 'heath'], ['loam', 'rocky'],
      'hazel_gathered']);
    expect(['loam', 'rocky', 'sand', 'granite'].filter(g => !CanonValidation.grounds.has(g))).toEqual([]);
    expect(Object.values(Canon.plants).filter(p => p.yields && !Canon.items[p.yields]).map(p => p.name)).toEqual([]);
  });
  // A town's gardens, seen from its green (the owner's garden herbs, 6 November): two at most of what lives by houses.
  it('grows a few garden herbs about each town\'s green', () => {
    const region = WorldAssembler.region('a1', [0, 0]);
    const greens = new Map<string, string[]>();
    for (const l of RegionGrowth.lines(region)) {
      const m = /^ {2}Thing (\w+_green)_(\w+) ".*" at \1 is scenery/.exec(l);
      if (m) { greens.set(m[1]!, [...greens.get(m[1]!) ?? [], m[2]!]); }
    }
    expect(greens.size).toBeGreaterThan(1);
    for (const [, grown] of greens) {
      expect(grown.length).toBeLessThanOrEqual(RegionGrowth.gardens);
      expect(grown.every(id => Canon.plants[id]!.habitats.includes('settlement'))).toBe(true);
    }
  });
  // What is gathered wild is worth something to a herbalist (the owner, 6 November: the herb-wife pays you to collect
  // the rare ones): every plant's yield, a coin for the common, more for the scarce.
  it('has a herbalist who pays for what is gathered, more for the rare', () => {
    const buys = new Map(Herbals.buys());
    expect(Object.values(Canon.plants).filter(p => p.yields && !buys.has(p.yields)).map(p => p.name)).toEqual([]);
    expect([Herbals.price(undefined), Herbals.price(6), Herbals.price(3), Herbals.price(2), Herbals.price(1)])
      .toEqual([1, 1, 2, 3, 6]);
    const region = WorldAssembler.region('a1', [0, 0]);
    expect(RegionWriter.source(region).includes('Buys hazel_gathered for 3 coin.')).toBe(true);
  });
});
