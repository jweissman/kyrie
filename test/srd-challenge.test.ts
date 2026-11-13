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
describe('the challenge of the SRD kinds', () => {
  it('measures each of them, and none by its base', () => {
    for (const kind of ['unicorn', 'ghoul/barrow', 'golem/flesh']) {
      expect([kind, Challenge.measured(kind)]).toEqual([kind, true]);
    }
    // The barrow ghoul is eight of Orsino's: a lone warrior of the fourth level, against half of one of the first.
    expect([Challenge.of('ghoul/barrow'), Challenge.of('ghoul')]).toEqual([4, 0.5]);
  }, 60000);
  it('is what the fights say: a fourth-level warrior beats the barrow ghoul, no lower one does', () => {
    expect(BestiaryTool.won('ghoul/barrow', 1, { warrior: 4, foes: 1 })).toBeGreaterThanOrEqual(0.5);
    for (const warrior of [1, 2, 3]) {
      expect([warrior, BestiaryTool.won('ghoul/barrow', 1, { warrior, foes: 1 }) < 0.5]).toEqual([warrior, true]);
    }
  }, 60000);
  // Their 10/magic and 5/adamantine: no blade of the catalog's passes either. A warrior of the twentieth level gets
  // enough past ten to beat the unicorn; the flesh golem no one beats.
  it('finds only a twentieth-level warrior who beats the unicorn, and none who beats the flesh golem', () => {
    expect([Challenge.of('unicorn'), Challenge.of('golem/flesh')]).toEqual([20, 24]);
    expect(BestiaryTool.won('unicorn', 1, { warrior: 20, foes: 1 })).toBeGreaterThanOrEqual(0.5);
    expect(BestiaryTool.won('unicorn', 1, { warrior: 18, foes: 1 })).toBeLessThan(0.5);
  }, 60000);
});
