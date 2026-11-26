import { describe, expect, it } from 'bun:test';
import { Origins } from '../../src/world/origins';
import { CanonVocabulary } from '../../src/canon/canon-vocabulary';
import { SettlementWriter } from '../../src/world/settlement-writer';
import { WorldAssembler } from '../../src/world/world-assembler';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';

// The brothers' letter is for whoever keeps the shrine, called as their Role calls them (OR-30: M22's second review
// read "the priest of Lugh" in the letter and on the way in, and met "Vance, priestess of Lugh").
describe('the brothers\' letter', () => {
  it('names the shrine\'s keeper as the keeper is called', async () => {
    const order = (await Origins.load(NodeBundleSource.shared)).find(o => o.manifest.id === 'order')!;
    const seen = new Set<string>();
    for (const seed of ['a1', 'b2', 'kite', 'thorn', 'wren', 's0', 'c3', 'jade']) {
      const region = WorldAssembler.region(seed, [0, 0]), files: Record<string, string> = {};
      if (!Origins.write(order, { region, placements: [], protagonist: 'Nest', root: 'x', files })) { continue; }
      const s = region.settlements.find(t => t.size === 'town') ?? region.settlements[0]!;
      const i = region.settlements.indexOf(s), role = /Person \w+_priest "[^"]*" at \w+ \{ Role "([^"]+)"/
        .exec(SettlementWriter.lines(s, i, region).join('\n'))![1]!;
      expect(SettlementWriter.called(region, s)).toBe(role);
      const source = files['x/origin/origin.kyr']!;
      expect(source).toContain(`to the ${role} at `);
      expect(source).toContain(`points the way to the ${role}, `);
      expect(Origins.choices([order], region, [], CanonVocabulary.context())[0]!.choice)
        .toContain(`a letter for the ${role}.`);
      seen.add(role.split(' ')[0]!);
    }
    // Both are met among these countries.
    expect([...seen].sort()).toEqual(['priest', 'priestess']);
  });
});
