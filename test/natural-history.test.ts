import { afterEach, describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import ecology from '../data/generation/tables/ecology.json';
import { Canon } from '../src/canon/canon';
import { CanonValidation } from '../src/canon/canon-validation';
import { Content } from '../src/content';
import { Draw } from '../src/world/land/draw';
import { RegionEcology } from '../src/world/region-ecology';
import { RegionGrowth } from '../src/world/region-growth';
import { WorldAssembler } from '../src/world/world-assembler';
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
  it('dens an animal written into animals.json where it lives, varied by its country, made as all are', async () => {
    (Canon.species as Record<string, Species>).marsh_harrier = { name: 'Marsh harrier', type: 'beast', kind: 'animal',
      description: 'A long-winged hawk of the reed-beds.', looks: 'A brown hawk with a pale head, quartering low over reeds.',
      statistics: {
        attributes: { strength: 6, dexterity: 12, constitution: 6, intelligence: 3, wisdom: 12, charisma: 4 },
        primary: 'dexterity', weapon: 'talons', growth: { hitPoints: { base: 4, perLevel: 1 } } },
      abilities: ['flee'], temperament: 'wary', habitats: ['meadow'], abundance: 2, source: { kyr: true } };
    added.species.push('marsh_harrier');
    const den = RegionEcology.den(await region('a1'), 'meadow')!;
    expect([den.species, den.label, den.nature]).toEqual(['marsh_harrier', 'the marsh harriers', 'wild']);
    const varied = RegionEcology.varied(den, { habitat: 'meadow', climate: 'temperate' }, new Draw('harrier'));
    const made = new Content('harrier').createCreature('h', { raceId: 'marsh_harrier', level: 3,
      ...varied.variations ? { variations: varied.variations } : {} });
    expect([made.raceId, made.base.maxHp > 0, made.base.abilities]).toEqual(['marsh_harrier', true, ['flee']]);
  });
});
