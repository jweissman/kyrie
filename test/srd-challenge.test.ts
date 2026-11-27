import { describe, expect, it } from 'bun:test';
import { BestiaryTool } from '../src/cli/bestiary-tool';
import { Challenge } from '../src/world/challenge';

// The challenge table measured again for the kinds the SRD adaptation changed or made (bin/kyrie bestiary challenge
// unicorn ghoul/barrow golem/flesh, 13 November): each is measured, not read from its base, and the measure is what a
// lone warrior's fights say now, checked here at the levels that decide it (12 fights a side, as the tool's).
// Measured again once only a wound triggers a damage kind's condition (R9-06): the unicorn's hooves, 1d4 without its
// Strength, had done nothing to a warrior of the twentieth level and stunned him all the same (674 failed stun saves
// after blows for nothing in the tool's twelve fights), which is what had made it 24, beyond any warrior; and the
// barrow ghoul, on the edge at 2 (a second-level warrior had won six of twelve), measures 4.
// Measured again after correcting the ghoul's secondary strikes to +0 (26 November): 1 at each rank, with a lone
// first-level warrior winning six of twelve. Its bite and claws still each carry paralysis.
// With SRD modifiers and calling HP (OR-1396), those wins are five of twelve at first level, seven at second.
// The recorded world-budget ratings remain unchanged pending the World remeasurement (OR-1398).
// Measured for the fell owlbear by the SRD's numbers (20 November, case 62): 8, the SRD's challenge 4 for a company of
// four met by one warrior alone. The long centipede (21 November, case 63): a third, as the SRD's challenge 1/2; the
// midden rat (case 64): a third, as the SRD's 1/3; the wild boar (case 65): 2, the SRD's 2.
describe('the challenge of the SRD kinds', () => {
  it('measures each of them, and none by its base', () => {
    for (const kind of ['unicorn', 'ghoul/barrow', 'golem/flesh', 'owlbear/fell',
      'centipede/long', 'rat/midden', 'boar/wild']) {
      expect([kind, Challenge.measured(kind)]).toEqual([kind, true]);
    }
    // The recorded ratings, not a new measurement with the corrected HP.
    expect([Challenge.of('ghoul/barrow'), Challenge.of('ghoul')]).toEqual([1, 0.5]);
    expect(Challenge.of('ghoul/barrow', 5)).toBe(1);
  }, 60000);
  it('feels a level apart: the barrow ghoul beats a first-level warrior, not a second-level one', () => {
    expect(BestiaryTool.won('ghoul/barrow', 1, { warrior: 1, foes: 1 })).toBeLessThan(0.5);
    expect(BestiaryTool.won('ghoul/barrow', 1, { warrior: 2, foes: 1 })).toBeGreaterThanOrEqual(0.5);
    expect(BestiaryTool.won('ghoul/barrow', 1, { warrior: 1, foes: 2 })).toBeLessThan(0.5);
  }, 60000);
  it('feels a level apart: the wild boar beats a first-level warrior, not a second-level one', () => {
    expect(Challenge.of('boar/wild')).toBe(2);
    expect(BestiaryTool.won('boar/wild', 1, { warrior: 1, foes: 1 })).toBeLessThan(0.5);
    expect(BestiaryTool.won('boar/wild', 1, { warrior: 2, foes: 1 })).toBeGreaterThanOrEqual(0.5);
  }, 60000);
  // Their 10/magic and 5/adamantine: no blade of the catalog's passes either. A warrior of the twentieth level gets
  // enough past ten to beat the unicorn; the flesh golem no one beats.
  it('finds only a twentieth-level warrior who beats the unicorn, and none who beats the flesh golem', () => {
    expect([Challenge.of('unicorn'), Challenge.of('golem/flesh')]).toEqual([20, 24]);
    expect(BestiaryTool.won('unicorn', 1, { warrior: 20, foes: 1 })).toBeGreaterThanOrEqual(0.5);
    expect(BestiaryTool.won('unicorn', 1, { warrior: 18, foes: 1 })).toBeLessThan(0.5);
  }, 60000);
});
