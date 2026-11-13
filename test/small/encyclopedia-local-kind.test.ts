import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { EncyclopediaEntry } from '../../src/ui/encyclopedia-entry';

// A kind a module declares for itself (Species … like …) is found in the Encyclopedia under the kind it is like, as its
// portrait and its body are: the book is written from the catalogs, and a module's own kinds have no entry there.
// Its link had named an entry that was nowhere, and the page fell back to a search (the boundary inventory,
// 14 November). (A module's kind may be like a catalogued kind only, not like another of its own.)
describe('a module\'s own creature kind', () => {
  it('is linked to the entry of the catalogued kind it is like', async () => {
    await Tiny.start(`
      Species ash_hound "an ash hound" like wolf temperament territorial described "A wolf grey with old fire.".
      Place yard "the yard" is room at 0, 0 outdoors. Company party "You" of 1 at yard.
      Person hound "an ash hound" at yard { Role "a hound". Species ash_hound. }`);
    const entry = EncyclopediaEntry.creature('ash_hound');
    expect(entry?.id).toBe('species-wolf');
  });
});
