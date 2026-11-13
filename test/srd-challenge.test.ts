import { describe, expect, it } from 'bun:test';
import { BestiaryTool } from '../src/cli/bestiary-tool';
import { Challenge } from '../src/world/challenge';

// The challenge table measured again for the kinds the SRD adaptation changed or made (bin/kyrie bestiary challenge
// unicorn ghoul/barrow golem/flesh, 13 November): each is measured, not read from its base, and the measure is what a
// lone warrior's fights say now, checked here at the one level that decides it (12 fights a side, as the tool's).
describe('the challenge of the SRD kinds', () => {
  it('measures each of them, and none by its base', () => {
    for (const kind of ['unicorn', 'ghoul/barrow', 'golem/flesh']) {
      expect([kind, Challenge.measured(kind)]).toEqual([kind, true]);
    }
    // The barrow ghoul is four of Orsino's: a lone warrior of the second level, against half of one of the first.
    expect([Challenge.of('ghoul/barrow'), Challenge.of('ghoul')]).toEqual([2, 0.5]);
  });
  it('is what the fights say: a second-level warrior beats the barrow ghoul, a first-level one does not', () => {
    expect(BestiaryTool.won('ghoul/barrow', 1, { warrior: 2, foes: 1 })).toBeGreaterThanOrEqual(0.5);
    expect(BestiaryTool.won('ghoul/barrow', 1, { warrior: 1, foes: 1 })).toBeLessThan(0.5);
  });
  // Their 10/magic and 5/adamantine: no blade of the catalog's passes either.
  it('finds no lone warrior to the twentieth level who beats the unicorn or the flesh golem', () => {
    expect([Challenge.of('unicorn'), Challenge.of('golem/flesh')]).toEqual([24, 24]);
    expect(BestiaryTool.won('unicorn', 1, { warrior: 20, foes: 1 })).toBeLessThan(0.5);
  });
});
