import { ItemCatalog } from '../../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import ledger from '../../data/sources/orsino/adaptations.json';
import { Canon } from '../../src/canon/canon';
import { Content } from '../../src/content';
import { Overlays } from '../../src/overlays';

// The mundane item and kit seam (doc/architecture/mission-21/rules/proof-slices.md, step 7): every calling's first
// inventory, made by the ordinary creation path, holds exactly its kit (the calling's startingGear and the road's
// candle), each a kind the item catalog has; the arms and armour beside it are drawn from the calling's own tables.
// Before, the ranger's rations and the monk's alms bowl were dropped without a word (Overlays.classGear filtered them):
// the bowl is now Kyr's own plain gear, and Orsino's rations are the company's counted good (data/rules/core.kyr), not
// an item a member carries, so the ranger's kit names none apart (the ledger's gear:rations says so).
const content = new Content('calling-kits');
const kits: Record<string, string[]> = {
  warrior: ['torch', 'pole', 'candle'],
  mage: ['spellbook', 'candle'],
  thief: ['thieves_tools', 'candle'],
  cleric: ['holy_symbol', 'candle'],
  bard: ['musical_instrument', 'candle'],
  ranger: ['bedroll', 'firewood', 'flask', 'candle'],
  monk: ['robe', 'alms_bowl', 'needle_and_thread', 'candle'],
};
const first = (classId: string, seed: string) =>
  content.createCreature(ItemCatalog.canon, `p_${classId}`, { raceId: 'human', classId, level: 1 }, seed);
describe('a calling\'s first kit', () => {
  it('is exactly the calling\'s kit for each of the seven, every kind in the catalog, its arms its own tables\'', () => {
    for (const [classId, kit] of Object.entries(kits)) {
      for (const seed of ['a', 'b']) {
        const inventory = first(classId, seed).state.inventory ?? [];
        const candidates = new Set(Overlays.startingCandidates(ItemCatalog.canon, { raceId: 'human', classId }));
        expect(inventory.filter(i => !candidates.has(i.definition)).map(i => i.definition)).toEqual(kit);
        expect(inventory.every(i => Canon.items[i.definition])).toBe(true);
      }
    }
  });
  it('names only kinds the catalog has, or the canon refuses to load (CanonValidation: carries unknown item)', () => {
    for (const k of Object.values(Canon.classes)) {
      expect((k.startingGear ?? []).filter(g => !Canon.items[g])).toEqual([]);
    }
  });
  it('keeps the monk\'s bowl as plain gear, and Orsino\'s rations as the company\'s good, said in the ledger', () => {
    const bowl = first('monk', 'a').state.inventory!.find(i => i.definition === 'alms_bowl')!;
    expect([Canon.items.alms_bowl!.category, Canon.items.alms_bowl!.use, bowl.equipped])
      .toEqual(['gear', undefined, undefined]);
    expect(Canon.items.rations).toBeUndefined();
    const record = ledger.records.find(r => r.orsino === 'gear:rations')!;
    expect([record.support, record.kyr]).toEqual(['represented', []]);
    expect(record.note).toContain('a good the company counts');
  });
});
