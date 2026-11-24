import { describe, expect, it } from 'bun:test';
import { Canon } from '../../src/canon/canon';
import { RegionMarket } from '../../src/world/region-market';

// The dear thing a first town sells (OR-323): a coat of the smith's best on the master-at-arms's rack, a point more
// armour than the plain coat at four times its price, worth saving a few outings' coin for.
describe('a fine coat', () => {
  it('is a point more armour at four times the price, and every one a yard may sell is made', () => {
    expect(Canon.items.fine_chainmail).toMatchObject({ category: 'armor', slot: 'body', value: 200,
      armor: { ac: 6, weight: 'heavy', type: 'metal' } });
    for (const coat of RegionMarket.coats) {
      const plain = Canon.items[coat.replace(/^fine_/, '')]!, fine = Canon.items[coat]!;
      expect(fine.value).toBe(plain.value! * 4);
      expect(fine.armor!.ac).toBe(plain.armor!.ac + 1);
    }
    // No fine make of a hide that grows on its wearer, nor of a fine make.
    expect(Canon.items.fine_chitin).toBeUndefined();
    expect(Canon.items.fine_fine_chainmail).toBeUndefined();
  });
});
