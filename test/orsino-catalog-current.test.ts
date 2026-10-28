import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { OrsinoTranslate } from '../src/registry/orsino-translate';
import { OrsinoBestiary } from '../src/registry/orsino-bestiary';
import type { RegistryEntry } from '../src/registry/orsino-extract';

// COR-20: the generated Orsino catalog had fallen behind its generator, so that a regeneration would bring what nobody
// chose: a summoning of constructs calling up bombs, turrets, barriers and a phylactery. What a summoning calls is a
// creature, of the beasts, the magical kinds or another plane; and the catalog is what its generator makes of the
// snapshot, so that nothing waits in a regeneration.
const read = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'));
describe('the generated Orsino catalog', () => {
  const entries = (read('data/sources/orsino/registry.json') as { entries: RegistryEntry[] }).entries;
  it('summons creatures, never a fighting object', () => {
    const hand = (read('data/catalog/species.json') as { species: Record<string, { source: { orsino?: string } }> })
      .species;
    const objects = Object.keys(hand).filter(id => hand[id]!.source.orsino?.startsWith('combatEntity:'));
    expect(objects.length).toBeGreaterThan(3);
    const called = Object.values(OrsinoBestiary.vocabulary(entries).byType).flat();
    expect(called.filter(id => objects.includes(id))).toEqual([]);
  });
  it('is what its generator makes of the snapshot', () => {
    const vocabulary = read('data/catalog/vocabulary.json') as { saveKinds: Record<string, string>; damageTypes: string[] };
    const generated = new OrsinoTranslate(entries, { saveKinds: Object.keys(vocabulary.saveKinds),
      damageTypes: vocabulary.damageTypes, bestiary: OrsinoBestiary.vocabulary(entries) }).generate();
    for (const [family, made] of Object.entries(generated)) {
      expect(JSON.parse(JSON.stringify(made)), family)
        .toEqual((read(`data/catalog/orsino/${family}.json`) as Record<string, unknown>)[family]);
    }
  }, 60000);
});
