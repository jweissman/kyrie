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
// Measured again for the barrow ghoul by the SRD's numbers (18 November, srd-proving-cases.md case 25: AC 7 in place of
// hide's 6, claws of 1d3, struck at the SRD's +2 and not by its Strength): 2, a second-level warrior's match.
// Measured for the fell owlbear by the SRD's numbers (20 November, case 62): 8, the SRD's challenge 4 for a company of
// four met by one warrior alone. The long centipede (21 November, case 63): a third, as the SRD's challenge 1/2; the
// midden rat (case 64): a third, as the SRD's 1/3; the wild boar (case 65): 2, the SRD's 2.
describe('the challenge of the SRD kinds', () => {
  it('measures each of them, and none by its base', () => {
    for (const kind of ['unicorn', 'ghoul/barrow', 'golem/flesh', 'owlbear/fell',
      'centipede/long', 'rat/midden', 'boar/wild']) {
      expect([kind, Challenge.measured(kind)]).toEqual([kind, true]);
    }
    // The barrow ghoul is four of Orsino's: a lone warrior of the second level, against half of one of the first.
    expect([Challenge.of('ghoul/barrow'), Challenge.of('ghoul')]).toEqual([2, 0.5]);
  }, 60000);
  it('is what the fights say: a second-level warrior beats the barrow ghoul, a first-level one does not', () => {
    expect(BestiaryTool.won('ghoul/barrow', 1, { warrior: 2, foes: 1 })).toBeGreaterThanOrEqual(0.5);
    expect(BestiaryTool.won('ghoul/barrow', 1, { warrior: 1, foes: 1 })).toBeLessThan(0.5);
  }, 60000);
  // Their 10/magic and 5/adamantine: no blade of the catalog's passes either. A warrior of the twentieth level gets
  // enough past ten to beat the unicorn; the flesh golem no one beats.
  it('finds only a twentieth-level warrior who beats the unicorn, and none who beats the flesh golem', () => {
    expect([Challenge.of('unicorn'), Challenge.of('golem/flesh')]).toEqual([20, 24]);
    expect(BestiaryTool.won('unicorn', 1, { warrior: 20, foes: 1 })).toBeGreaterThanOrEqual(0.5);
    expect(BestiaryTool.won('unicorn', 1, { warrior: 18, foes: 1 })).toBeLessThan(0.5);
  }, 60000);
});
