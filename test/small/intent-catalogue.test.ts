import { describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { IntentCatalogue } from '../../scripts/intent-catalogue';

// The player-intent catalogue (the owner, 15 November), held as a ratchet: every action the rules library defines is
// placed in a family of what a player means by it, a family's proof is a spec that exists, and the families with none
// are
// named (a gap in what the world sustains, not a claim). A new schema must be classified; a new proof lowers the gaps.
describe('the player-intent catalogue', () => {
  it('places every library action in a family', () => {
    expect(IntentCatalogue.schemas().filter(s => !IntentCatalogue.family(s))).toEqual([]);
  });
  it('names a proof for each family, and says which have none', () => {
    const root = join(import.meta.dir, '..', '..');
    const missing = IntentCatalogue.families.filter(f => !IntentCatalogue.pins[f]);
    expect(missing).toEqual(['discovery']);
    for (const f of IntentCatalogue.families) {
      const pin = IntentCatalogue.pins[f];
      if (pin) { expect(existsSync(join(root, pin))).toBe(true); }
    }
  });
  it('keeps no family empty of capabilities the library defines', () => {
    const all = IntentCatalogue.schemas();
    for (const f of IntentCatalogue.families) {
      expect(IntentCatalogue.table[f].some(s => all.includes(s))).toBe(true);
    }
  });
});
