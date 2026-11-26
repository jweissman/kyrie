import { describe, expect, it } from 'bun:test';
import { AbilityCensus } from '../support/ability-census';

// The censuses of abilities and the world (OR-1098). Each number is a ratchet that may only rise: raise it when a
// change lets the language say more, or lets an ability reach the world, and never lower it.
describe('every catalog ability as an effect sentence', () => {
  const census = AbilityCensus.roundTrip();
  it('prints and parses back as many as it did', () => {
    // 216 of 412 with Comprehend Languages (OR-1099); the two SRD cantrips bring the total to 414, still 216 equal.
    expect(census.total).toBe(414);
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
    // 84 of 335 on 26 November; 85 of 336 with Comprehend Languages (OR-1099); 143 once any harm of an element lets
    // it loose where it lands, on one or many, and electric and thunder are elements (OR-1100).
    expect(reach.playable).toBeGreaterThanOrEqual(336);
    expect(reach.reading.length).toBeGreaterThanOrEqual(143);
    expect(reach.reading).toEqual(expect.arrayContaining(['lightning_bolt', 'stormsurge', 'maelstrom', 'firebolt']));
  });
  it('counts those that change what the world lets the company do', () => {
    // 2 on 26 November (Light, Knock); 3 with Comprehend Languages, granting lore (OR-1099); 2 again once Knock is a
    // verb tried on a door, not an hour's lockwork (the owner's ruling of 26 November; OR-1103): it is counted among
    // those that write a fact, below, which does not fall.
    expect(reach.enabling.length).toBeGreaterThanOrEqual(2);
    expect(reach.enabling).toEqual(expect.arrayContaining(['conjure_light', 'comprehend_languages']));
  });
  it('counts those that enable, or write a fact of the world its authors answer', () => {
    // 2 on 26 November; 13 once fire puts what it reaches to the flame (tried(thing, burning): OR-1100); Knock among
    // them as a verb (tried(door, opening): OR-1103).
    expect(AbilityCensus.changing().length).toBeGreaterThanOrEqual(13);
    expect(AbilityCensus.changing()).toEqual(expect.arrayContaining(['firebolt', 'fireball', 'knock']));
  });
});
