import { afterAll, describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { CanonValidation } from '../src/canon/canon-validation';
import { CombatProjection } from '../src/combat-projection';
import { Content } from '../src/content';
import { Effects } from '../src/effects';
import { Expressions } from '../src/expressions';
import { MechanicsText } from '../src/presentation/mechanics-text';
import { Amounts } from '../src/rules/amounts';
import { CastingLevel } from '../src/rules/casting-level';
import type { Ability } from '../src/canon/schema';

// The level a caster casts at (proof-slices.md, step 3): #castingLevel beside the encounter's #level, a calling's
// level as it stands after any drain, a kind's own powers at its source Hit Dice; and one cap over it,
// cappedLevel(n), read alike by the evaluator, the mean, validation and the page.
const content = new Content('casting-level');
const cast = (raceId: string, level: number, classId?: string) => Effects.context(CombatProjection.fighter(
  content.createCreature(`${raceId}-${level}`, { raceId, level, ...classId ? { classId } : {} }), 'fighters'))
  .castingLevel;
describe('the casting level', () => {
  it('is a calling\'s level as it stands, drained or not', () => {
    expect([1, 5, 9].map(level => cast('human', level, 'mage'))).toEqual([1, 5, 9]);
    const drained = content.createCreature('drained', { raceId: 'human', classId: 'mage', level: 5 });
    drained.state.conditions.push({ id: 'drained', remaining: 2, clock: 'until-removed' });
    expect(Effects.context(CombatProjection.fighter(drained, 'fighters')).castingLevel).toBe(3);
  });
  it('is a kind\'s source Hit Dice for its own powers: an Orsino creature\'s level, a fixed block\'s count', () => {
    expect(cast('ghoul', 5)).toBe(5);
    expect(cast('ghoul/barrow', 5)).toBe(2);
    expect(cast('ghoul/barrow', 9)).toBe(2);
  });
});
describe('a cap over it, cappedLevel(n)', () => {
  const at = (level: number) => new Expressions('cap').number('roll(cappedLevel(10), 1)', { castingLevel: level });
  it('comes to the casting level up to its cap, at the first level, the cap and one beyond', () => {
    expect([1, 10, 11].map(at)).toEqual([1, 10, 10]);
    expect([1, 10, 11].map(level => Amounts.mean('roll(cappedLevel(10), 6)', { castingLevel: level })))
      .toEqual([3.5, 35, 35]);
  });
  it('is said on the page as the SRD says it', () => {
    expect(MechanicsText.amount({ kind: 'deem', expression: 'roll(cappedLevel(10), 6)' }))
      .toBe('1d6 per caster level, to 10d6');
  });
  const abilities = Canon.abilities as Record<string, Ability>;
  afterAll(() => { delete abilities.t_capped; });
  it('is refused unless its cap is a whole number from 1', () => {
    expect(CastingLevel.problems('roll(cappedLevel(10), 6)')).toEqual([]);
    expect(CastingLevel.problems('roll(cappedLevel(0), 6) + cappedLevel(#level)')).toHaveLength(2);
    abilities.t_capped = { name: 'Capped', kind: 'technique', effect: 'Deal (roll(cappedLevel(x), 6)) fire damage to enemy.',
      source: { kyr: true } } as Ability;
    expect(CanonValidation.problems().some(p => p.includes('t_capped') && p.includes('a cap is a whole number'))).toBe(true);
  });
});
