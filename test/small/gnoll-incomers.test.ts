import { describe, expect, it } from 'bun:test';
import { Canon } from '../../src/canon/canon';
import { WorldAssembler } from '../../src/world/world-assembler';
import { RegionWriter } from '../../src/world/region-writer';
import { DeepPurposes } from '../../src/world/deep/deep-purposes';
import { CanonVocabulary } from '../../src/canon/canon-vocabulary';

// Gnolls as the tenants of the combat place by the first town (OR-1236; the owner had sketched gnolls, ogres later):
// Orsino's gnoll, a people of the catalog (not a player's), comes in from outside to the way into a deep site once its
// first dwellers there are dealt with, and dens where they were: in the reference game's town the dead place under its
// woods, gone down into from the town itself, so a company that goes back down finds a pack of gnolls at home.
describe('the gnolls', () => {
  it('are a people of the catalog, Orsino\'s, that no new life is made of', () => {
    const gnoll = Canon.ancestries.gnoll!;
    expect(gnoll.name).toBe('Gnoll');
    expect(gnoll.playable).toBeFalsy();
    expect((gnoll as unknown as { source: { orsino: string } }).source.orsino).toBe('ancestry:gnoll');
  });
  it('come in to the way into every deep purpose\'s first level', () => {
    for (const purpose of Object.values(DeepPurposes.all)) {
      expect(purpose.incomers?.map(g => g.ancestry)).toEqual(['gnoll']);
    }
  });
  it('move in under the reference town once the first dwellers of its way in are dead', () => {
    const region = WorldAssembler.region('s0', [0, 0]), text = RegionWriter.source(region, { size: 1, contacts: [] }, {},
      CanonVocabulary.context());
    const t = region.settlements[0]!.id;
    expect(text).toMatch(new RegExp(`Person ${t}_ud_barrow_newcomers "the gnolls" at ${t}_ud_barrow_beyond \\{.*`
      + 'Ancestry gnoll\\. Calling warrior\\. Numbers 2\\.'));
    expect(text).toMatch(new RegExp(`Rule ${t}_ud_barrow_\\w+_dwellers_succeeded when dead\\(${t}_ud_barrow_\\w+_dwellers\\)`
      + ` and at\\(${t}_ud_barrow_newcomers, ${t}_ud_barrow_beyond\\)`));
  });
});
