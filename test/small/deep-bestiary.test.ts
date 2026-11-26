import { describe, expect, it } from 'bun:test';
import { Canon } from '../../src/canon/canon';
import { Challenge } from '../../src/world/challenge';
import { QuantityBestiary } from '../../scripts/quantity/bestiary';
import { DeepPurposes } from '../../src/world/deep/deep-purposes';

// The bestiary deployment census (OR-1230; the owner, 26 November: "make sure we're deploying as much of our bestiary
// as possible"): how many of the catalog's kinds the deep sites' tables and rooms can field, and how many some
// generated placement can (the deep, a den, the open ground). A ratchet: each may only rise. The deep had fielded 33
// kinds (its tables named 18); kinds with no habitat (the mephit, the automaton, the xill, the lillend) and kinds of a
// purpose's habitats it had not written (the zombie, the wisp, the eel) went into its tables by depth, from their
// challenge, and it fields 49.
const fielded = QuantityBestiary.fielded(), placed = QuantityBestiary.placed();

describe('the bestiary the world fields', () => {
  it('the deep fields at least 49 kinds, and some placement 99, of the catalog', () => {
    expect(fielded.size).toBeGreaterThanOrEqual(49);
    expect(placed.size).toBeGreaterThanOrEqual(99);
    expect(Canon.catalogued.length).toBeGreaterThanOrEqual(placed.size);
  });
  it('every kind a deep table writes is a kind of the bestiary, measured, and not tame', () => {
    for (const [art, purpose] of Object.entries(DeepPurposes.all)) {
      const groups = [...purpose.dwellers, ...purpose.elites ?? []].flatMap(r => r.groups).filter(g => g.species);
      for (const kind of groups.map(g => g.species!)) {
        expect(`${art}: ${kind} ${Canon.catalogued.includes(QuantityBestiary.base(kind))}`).toBe(`${art}: ${kind} true`);
        expect(`${art}: ${kind} ${Challenge.measured(kind)}`).toBe(`${art}: ${kind} true`);
        expect(Canon.temperament(kind)).not.toBe('tame');
      }
    }
  });
  it('a written group is no stronger than its depth asks: a first level\'s dwellers are a first-level company\'s match', () => {
    for (const [art, purpose] of Object.entries(DeepPurposes.all)) {
      for (const g of purpose.dwellers.find(r => r.depth === 0)!.groups.filter(x => x.species)) {
        // A first level's room is of the first to third level (DeepPacing.dwellers); two warriors' worth at its third.
        expect(`${art}: ${g.species} ${g.count * Challenge.of(g.species!, 3) <= 2}`).toBe(`${art}: ${g.species} true`);
      }
    }
  });
});
