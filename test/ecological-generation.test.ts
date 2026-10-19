import { expect, it } from 'bun:test';
import { Generator, Template, buildSetting } from 'deem';
import templates from '../data/ecology/deem.templates.json';
import tables from '../data/ecology/deem.tables.json';
import { Canon } from '../src/canon/canon';

it('composes habitat-constrained plants and animals independently through real DEEM context', () => {
  function generate(seed: number, biome: string) {
    const setting = buildSetting(tables, templates);
    const runtime = Template.bootstrapDeem({ seed }, setting);
    const options = { biome, __setting: setting, __deemRuntime: runtime };
    return Generator.gen('ecological_palette', options) as
      { biome: string; plant: string; animal: string };
  }
  const plants = new Set(), animals = new Set();
  for (const biome of ['riverbank', 'woodland', 'marsh', 'meadow']) {
    for (let seed = 1; seed <= 20; seed++) {
      const result = generate(seed, biome);
      expect(result).toEqual(generate(seed, biome));
      expect(Canon.organisms[Canon.resolve('organisms', result.plant)]!.habitats).toContain(biome);
      expect(Canon.organisms[Canon.resolve('organisms', result.animal)]!.habitats).toContain(biome);
      if (biome === 'riverbank') { plants.add(result.plant); animals.add(result.animal); }
    }
  }
  expect(plants.size).toBe(2);
  expect(animals.size).toBe(2);
});
