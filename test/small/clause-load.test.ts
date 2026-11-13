import { describe, expect, it } from 'bun:test';
import { ClauseLoad } from '../../src/presentation/clause-load';
import { ClauseCensus } from '../../scripts/clause-census';

// What a sentence makes the reader carry (the owner, 14 November: empty words are an obstacle, and the long compound
// sentence is the engine's tic, which a count of sentences does not see). And a ratchet: the prose every first hour
// meets (origins, the town and its undertown, the region's generated places, the voice tables) may grow lighter and
// never heavier; lower `held` as it is edited.
describe('the clause load', () => {
  it('finds the sentence that chains clause on clause, and passes the one that says one thing', () => {
    expect(ClauseLoad.heavy('The causeway runs on its piles across the last of the fen, and at the end of it is '
      + 'Misthythe: low roofs against the sky, masts at the landing, eel-traps stacked against the walls.')).toBe(true);
    expect(ClauseLoad.heavy('Haze\'s dart kills the first rat.')).toBe(false);
    expect(ClauseLoad.heavy('Between you and the horse, the cart comes out of the ditch.')).toBe(false);
  });
  it('is no heavier in what every first hour meets than it was', () => {
    const held = 1202;
    const heavy = ClauseCensus.count(true).reduce((n, c) => n + c.heavy.length, 0);
    expect(heavy).toBeLessThanOrEqual(held);
  });
});
