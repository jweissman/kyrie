import { describe, expect, it } from 'bun:test';
import { AbilityCensus } from '../support/ability-census';

// The censuses of abilities and the world (OR-1098). Each number is a ratchet that may only rise: raise it when a
// change lets the language say more, or lets an ability reach the world, and never lower it.
describe('every catalog ability as an effect sentence', () => {
  const census = AbilityCensus.roundTrip();
  it('prints and parses back as many as it did', () => {
    // 215 of 411 on 26 November; 216 of 412 with Comprehend Languages, a sentence (OR-1099).
    expect(census.total).toBe(412);
    expect(census.equal).toBeGreaterThanOrEqual(216);
  });
  it('never prints a sentence that fails to parse or comes back different', () => {
    expect(census.differs).toEqual([]);
  });
  it('names what the language lacks for the rest', () => {
    // The research's first five forms (§2.1): half on a resisted save first.
    expect(census.lacks.onResist).toBeGreaterThan(0);
    expect(Object.values(census.lacks).reduce((n, x) => n + x, 0)).toBe(census.total - census.equal);
  });
});

describe('abilities and the world', () => {
  const reach = AbilityCensus.reach();
  it('counts the playable abilities with any reading outside a fight', () => {
    // 84 of 335 on 26 November; 85 of 336 with Comprehend Languages (OR-1099).
    expect(reach.playable).toBeGreaterThanOrEqual(336);
    expect(reach.reading.length).toBeGreaterThanOrEqual(85);
  });
  it('counts those that change what the world lets the company do', () => {
    // 2 on 26 November (Light, Knock); 3 with Comprehend Languages, granting lore (OR-1099).
    expect(reach.enabling.length).toBeGreaterThanOrEqual(3);
    expect(reach.enabling).toEqual(expect.arrayContaining(['conjure_light', 'knock', 'comprehend_languages']));
  });
});
