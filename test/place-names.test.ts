import { describe, expect, it } from 'bun:test';
import { PlaceNames } from '../src/world/place-names';
import { RegionWriter, type Region } from '../src/world/region-writer';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { CommonNames } from '../src/world/common-names';
import { Foundings } from '../src/world/founding';
import { RegionLand } from '../src/world/region-land';

class Regions {
  static make(ancestry: string): Region {
    const town = { id: 's1', name: 'Coldhill', feature: 'cold', affix: 'hill', size: 'village', trade: 'wool',
      inn: 'the Red Ram', innkeeper: 'Iamond', priest: 'Cy', merchant: 'Ada', traveller: 'Tam', calling: 'drover' };
    return { name: 'Frostwold', feature: 'frost', affix: 'wold', terrain: 'mountain', ancestry, domain: 'life',
      deity: 'the Mother', settlements: [town], sites: [{ id: 'w1', kind: 'cave', name: 'Fern Cave', feature: 'fern',
        affix: 'cave', hours: 1 }], wonder: { kind: 'stone', description: 'a standing stone.' } };
  }
  private static drawn?: Region[];
  // The human countries among two dozen worlds' first regions, drawn as a world draws them.
  static heartland(): Region[] {
    this.drawn ??= Array.from({ length: 24 }, (_, i) => WorldAssembler.region(`heartland${i}`, [0, 0]))
      .filter(r => r.ancestry === 'human');
    return this.drawn;
  }
}

describe('generated places are named in their folk\'s tongue', () => {
  it('names a village of the human heartland in plain Common, and a dwarvish one in Khuzdul with its meaning', () => {
    const human = PlaceNames.render(Regions.make('human')), dwarf = PlaceNames.render(Regions.make('dwarf'));
    // With no land to lie by, a village is named for what it is: "-by", "-ton", "-ham".
    expect(human.settlements[0]).toMatchObject({ name: 'Eagleby', feature: 'eagle', affix: 'by' });
    expect(human.settlements[0]).not.toHaveProperty('gloss');
    expect(human.settlements[0]).not.toHaveProperty('tongue');
    expect(dwarf.settlements[0]).toMatchObject({ gloss: 'cold hill', tongue: 'Khuzdul' });
    expect(dwarf.settlements[0]!.name).not.toBe('Eagleby');
    // A name with a part the language has no word for ("wold") stays as Deem said it; the region and its sites are
    // named as they were.
    expect(human.name).toBe('Frostwold');
    expect(human.sites[0]).toMatchObject({ gloss: 'fern cave', tongue: 'Westron' });
    // A Common name needs no meaning told: nothing says what one is "Common for", in a place or on the chart, where
    // only the works' old names are glossed.
    const laid = PlaceNames.render(WorldAssembler.lay(Regions.make('human'), 'frostwold'));
    const source = RegionWriter.source(laid), manifest = RegionWriter.manifest(laid) as { chart: { glosses: object } };
    expect(source.split('\n').filter(l => /Observe \S+ at /.test(l) && l.includes('The name is'))).toEqual([]);
    expect(`${source}${JSON.stringify(manifest)}`).not.toContain('Common for');
    expect(Object.keys(manifest.chart.glosses).filter(id => /^s\d+$/.test(id))).toEqual([]);
    // What Deem drew a place to mean, said in Common, is there to fall back on.
    expect(CommonNames.meant({ feature: 'lofty', affix: 'town' }).map(c => c.name)).toEqual(['Highton']);
    const fen = PlaceNames.render({ ...Regions.make('human'), name: 'Fenfen', feature: 'fen', affix: 'fen' });
    expect([fen.name, fen.gloss]).toEqual(['Faenn', 'fen']);
  });
  it('is the same name for the same seed', async () => {
    const [a, b] = await Promise.all([1, 2].map(() => WorldAssembler.assemble('thorn', NodeBundleSource.shared,
      { region: { terrain: 'mountain' } }))) as [Awaited<ReturnType<typeof WorldAssembler.assemble>>,
      Awaited<ReturnType<typeof WorldAssembler.assemble>>];
    expect(a.report.region.settlements.map(s => s.name)).toEqual(b.report.region.settlements.map(s => s.name));
    const first = a.report.region.settlements[0]!;
    expect(first).toMatchObject({ name: 'Hawkhaven', feature: 'hawk', affix: 'haven' });
    expect(first).not.toHaveProperty('gloss');
  }, 60000);
  // OWN-16 and OWN-30: the heartland's settlements in one human tradition, plain names after their lie and life.
  it('names each settlement of the heartland for what it lies by or is there for, and none like another', () => {
    for (const region of Regions.heartland()) {
      const kinds = Foundings.kinds(region), names = [region.name, ...(region.land ?? []).map(l => l.name)];
      region.settlements.forEach((s, i) => {
        expect(names.filter(n => RegionLand.confusable(s.name, n))).toEqual([]);
        names.push(s.name);
        if (s.tongue) { return; }
        expect(s.name).toMatch(/^[A-Z][a-z]+$/);
        // Its last word is one its lie, its roads, its size or its founding give it: no ford without a ford.
        const marks = CommonNames.marks(region, i, kinds[i]);
        expect(CommonNames.lexicon.generics.some(g => g.words.includes(s.affix!) && g.when.every(w => marks.has(w))))
          .toBe(true);
        // One that is there for its crossing is named for the very ford or bridge it is there for, unless a
        // settlement named before it is already called for one.
        const crossed = [...marks].find(m => m.startsWith('crossed:'))?.replace('crossed:', '');
        if (crossed && !region.settlements.slice(0, i).some(o => o.affix === crossed)) {
          expect(s.affix).toBe(crossed);
        }
      });
    }
  }, 60000);
  it('keeps elves\' and dwarves\' own tongues where they settled, and an old name where the makers built', () => {
    // d4: a dwarf hold among human villages is named in Khuzdul; Ísenburg, built round the makers' work, keeps the
    // Westron name it had in the old kingdom's day; the half-orcs' hamlet is named in Common like its neighbours.
    const d4 = WorldAssembler.region('d4', [0, 0]);
    expect(d4.settlements.map(s => [s.name, s.folk, s.tongue ?? 'Common'])).toEqual([['Rainmeet', 'human', 'Common'],
      ['Ísenburg', 'human', 'Westron'], ['Harmizela', 'dwarf', 'Khuzdul'], ['Hawkmill', 'half_orc', 'Common'],
      ['Broadhurst', 'human', 'Common']]);
    expect(Foundings.of(d4, 1).kind).toBe('ancient');
    // Across the heartland, a name not in Common is elves' or dwarves', or as old as the makers' work it is built
    // round.
    for (const region of Regions.heartland()) {
      const foreign = region.settlements.map((s, i) => ({ s, kind: Foundings.of(region, i).kind }))
        .filter(x => x.s.tongue);
      expect(foreign.filter(x => !['elf', 'dwarf'].includes(x.s.folk!) && x.kind !== 'ancient')).toEqual([]);
    }
    // A dwarf country is named as it was, its birdfolk hamlet too.
    const b2 = WorldAssembler.region('b2', [0, 0]);
    expect(b2.settlements.map(s => s.name)).toEqual(['Ramavor', 'Barzelmizela', 'Gebaglornof', 'Harrehes', 'Shaygabar']);
    expect(b2.settlements.every(s => s.tongue === 'Khuzdul')).toBe(true);
  }, 60000);
});
