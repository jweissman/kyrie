import { describe, expect, it } from 'bun:test';
import { PlaceNames } from '../src/world/place-names';
import { RegionWriter, type Region } from '../src/world/region-writer';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

class Regions {
  static make(ancestry: string): Region {
    const town = { id: 's1', name: 'Coldhill', feature: 'cold', affix: 'hill', size: 'village', trade: 'wool',
      inn: 'the Red Ram', innkeeper: 'Iamond', priest: 'Cy', merchant: 'Ada', traveller: 'Tam', calling: 'drover' };
    return { name: 'Frostwold', feature: 'frost', affix: 'wold', terrain: 'mountain', ancestry, domain: 'life',
      deity: 'the Mother', settlements: [town], sites: [{ id: 'w1', kind: 'cave', name: 'Fern Cave', feature: 'fern',
        affix: 'cave', hours: 1 }], wonder: { kind: 'stone', description: 'a standing stone.' } };
  }
}

describe('generated places are named in their folk\'s tongue', () => {
  it('says what Deem chose to mean, in Westron for human country and Khuzdul for dwarvish, keeping the meaning', () => {
    const human = PlaceNames.render(Regions.make('human')), dwarf = PlaceNames.render(Regions.make('dwarf'));
    expect(human.settlements[0]).toMatchObject({ name: 'Chealdholm', gloss: 'cold hill', tongue: 'Westron' });
    expect(dwarf.settlements[0]).toMatchObject({ gloss: 'cold hill', tongue: 'Khuzdul' });
    expect(dwarf.settlements[0]!.name).not.toBe('Chealdholm');
    // A name with a part the language has no word for ("wold") stays as Deem said it.
    expect(human.name).toBe('Frostwold');
    expect(human.sites[0]).toMatchObject({ gloss: 'fern cave', tongue: 'Westron' });
    // The meaning is told where the place is described.
    expect(RegionWriter.source(human)).toContain('The name is Westron for “cold hill”.');
    const fen = PlaceNames.render({ ...Regions.make('human'), name: 'Fenfen', feature: 'fen', affix: 'fen' });
    expect([fen.name, fen.gloss]).toEqual(['Faenn', 'fen']);
  });
  it('is the same name for the same seed', async () => {
    const [a, b] = await Promise.all([1, 2].map(() => WorldAssembler.assemble('thorn', NodeBundleSource.shared,
      { region: { terrain: 'mountain' } }))) as [Awaited<ReturnType<typeof WorldAssembler.assemble>>,
      Awaited<ReturnType<typeof WorldAssembler.assemble>>];
    expect(a.report.region.settlements.map(s => s.name)).toEqual(b.report.region.settlements.map(s => s.name));
    const first = a.report.region.settlements[0]!;
    expect(first).toMatchObject({ name: 'Chealdholm', gloss: 'cold hill' });
  }, 60000);
});
