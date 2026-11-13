import { afterAll, describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { CanonValidation } from '../src/canon/canon-validation';
import { Content } from '../src/content';
import { CreatureVariants, type Variation } from '../src/creature-variants';
import { Effects } from '../src/effects';
import { Fighting } from '../src/rules/fighting';
import { KindDefenses } from '../src/kind-defenses';

// Two capabilities an SRD stat block needs (completion-plan §4): its saves as the source gives them, whatever its
// scores and level, and a variation that forgoes its base's defences for its own (the SRD mummy's 5/— in place of
// Orsino's half of every blow). Proved on variations written for this spec alone, taken out after.
const variations = CreatureVariants.variations as Record<string, Variation>;
variations.t_saved = { axis: 'breed', word: 'saved', says: 'as the book has it', kinds: ['monster'], types: ['undead'],
  saves: { fortitude: 0, reflex: 2, will: 5 }, unplaced: true };
variations.t_bare = { axis: 'breed', word: 'bare', says: 'as the book has it', kinds: ['monster'], types: ['undead'],
  defenses: [{ kind: 'reduction', amount: 5 }], forgoes: { defenses: true }, unplaced: true };
afterAll(() => { delete variations.t_saved; delete variations.t_bare; });
const content = new Content('stat-block-saves');
const total = (raceId: string, level: number, kind: string) => {
  const f = content.creature(raceId, `${raceId}-${level}`, 'goblins', level), scores = Effects.scores(f);
  return Fighting.statMod(scores[Canon.rules.saveKinds[kind] as keyof typeof scores]) + f.level
    + Effects.saveModifier(f, kind);
};
describe('a stat block\'s saves', () => {
  it('are what every save of a family is made at, at any level', () => {
    for (const level of [1, 3, 8]) {
      expect(['fortitude', 'poison', 'paralyze', 'reflex', 'will', 'sleep', 'charm'].map(k => total('ghoul/t_saved',
        level, k))).toEqual([0, 0, 0, 2, 5, 5, 5]);
    }
    // A kind without them saves as before: its score and its level.
    expect(total('ghoul', 3, 'will')).not.toBe(total('ghoul/t_saved', 3, 'will'));
  });
  it('are refused unless they are the three, each a whole number', () => {
    const saved = variations.t_saved!;
    saved.saves = { fortitude: 0, reflex: 2 } as never;
    try { expect(CanonValidation.problems().some(p => p.includes('saves are Fortitude, Reflex and Will'))).toBe(true); }
    finally { saved.saves = { fortitude: 0, reflex: 2, will: 5 }; }
  });
});
describe('a variation that forgoes its base\'s defences', () => {
  it('has its own in their place, and the base keeps its', () => {
    // Orsino's mummy takes half of every blow and half again of fire: fractions of its own.
    expect(Canon.creature('mummy').defenses!.some(d => d.kind === 'resistance' && d.mode === 'fraction')).toBe(true);
    expect(Canon.creature('mummy/t_bare').defenses).toEqual([{ kind: 'reduction', amount: 5 }]);
    expect(KindDefenses.fractions(content.creature('mummy/t_bare', 'b', 'goblins', 3))).toEqual([]);
  });
});
