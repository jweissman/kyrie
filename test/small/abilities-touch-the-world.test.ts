import { describe, expect, it } from 'bun:test';
import { EffectSentences } from '../support/effect-sentences';

// The effect language's world forms (L1 and L2 of doc/design/research-abilities-and-the-world-2026-11-26.md §3.3, the
// owner's leave of 26 November): an ability may aim at `it` (the thing, way or person its act names) and `here` (the
// place), and may try one of the kernel's verbs on either (`Try opening on it.`, `Try lighting here.`), lowered to
// `tried(target, verb)` and answered by the world's rules for that verb, never by the ability. Each sentence reads as
// its typed form and prints back the same.
describe('the effect language aimed at the world', () => {
  it('reads a verb tried on what the act names, or on the place', () => {
    expect(EffectSentences.parse('knock', 'Try opening on it.')).toEqual([{ kind: 'try', verb: 'opening', target: 'it' }]);
    expect(EffectSentences.parse('light', 'Try lighting here.')).toEqual([{ kind: 'try', verb: 'lighting', target: 'here' }]);
    expect(EffectSentences.parse('fire', 'Deal 3 fire damage to it. Try burning on it.')).toEqual([
      { kind: 'damage', amount: { kind: 'literal', value: 3 }, damageType: 'fire', target: 'it' },
      { kind: 'try', verb: 'burning', target: 'it' }]);
  });
  it('prints each back as it was written', () => {
    for (const sentence of ['Try opening on it.', 'Try lighting here.', 'Try soothing on enemy.', 'Apply lit to it for 2 hours.']) {
      const effects = EffectSentences.parse('x', sentence);
      expect(EffectSentences.print(effects)).toEqual({ sentence });
      expect(EffectSentences.roundTrip('x', effects)).toBe('equal');
    }
  });
  it('refuses a try with no verb or no target', () => {
    expect(() => EffectSentences.parse('x', 'Try on it.')).toThrow();
    expect(() => EffectSentences.parse('x', 'Try opening.')).toThrow();
  });
});
