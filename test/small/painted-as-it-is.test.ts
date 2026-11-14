import { describe, expect, it } from 'bun:test';
import { CreaturePortraits } from '../../src/paintings/creature-portraits';

// A creature is not shown by a painting that contradicts it (CO-04: an ice elemental had the elemental's burning
// rock): a variation that its base's painting would belie says so (portrait: null), and is drawn by its emblem; one
// the painting fits keeps it.
describe('an elemental', () => {
  it('of fire, lava or earth is painted as the burning rock, and one of ice, water or air is not', () => {
    for (const fits of ['fire', 'lava', 'earth']) {
      expect(CreaturePortraits.painting(`elemental/${fits}_element`)).toBe('monsters/elemental');
    }
    for (const belies of ['ice', 'water', 'air', 'storm', 'crystal']) {
      expect(CreaturePortraits.painting(`elemental/${belies}_element`)).toBeUndefined();
    }
  });
});
