import { afterAll, describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { CanonValidation } from '../src/canon/canon-validation';
import { Content } from '../src/content';
import { CreatureVariants, type Variation } from '../src/creature-variants';
import { Effects } from '../src/effects';
import { Expressions } from '../src/expressions';
import { ItemCatalog } from '../src/item-catalog';

// A stat block's numbers as Deem expressions over context (engine-pressure.md, §2; AB-03's enabler): Hit Dice and a
// natural armour's bonus read the creature's level and the company it is made to meet, as it is made; a natural
// weapon's damage reads the fighter's own, blow by blow. Proved on a variation written for this spec alone
// (t_grown, a breed of the ghoul), taken out after; no placed creature's record declares one.
const variations = CreatureVariants.variations as Record<string, Variation>;
variations.t_grown = { axis: 'breed', word: 'grown', says: 'grown as it was let grow', kinds: ['monster'],
  types: ['undead'], hitDice: '2d8 + 2 * #level + #company', damage: { claws: '1d4 + #level' }, armorBonus: '#level / 4',
  unplaced: true };
afterAll(() => { delete variations.t_grown; });
const content = new Content('stat-expressions');
const made = (level: number, company = 1) =>
  content.createCreature(ItemCatalog.canon, `g${level}-${company}`, { raceId: 'ghoul/t_grown', level, company });

describe('a stat block read over its context', () => {
  it('has the hit points its level and its company make it, as it is made', () => {
    expect([[1, 1], [4, 1], [9, 1], [4, 3]].map(([level, company]) => made(level!, company).base.maxHp))
      .toEqual([12, 18, 28, 20]);
  });
  it('strikes for its own damage at its level, blow by blow, and its hide is harder for its level', () => {
    for (const level of [1, 4, 9]) {
      const c = made(level), e = ItemCatalog.canon.equipment(c);
      expect(e.weapon.damage).toBe('1d4 + #level');
      const f = content.creature('ghoul/t_grown', `f${level}`, 'goblins', level), expressions = new Expressions(`blow-${level}`);
      for (let n = 0; n < 12; n++) {
        const blow = expressions.number(f.equipment.weapon.damage, Effects.context(f));
        expect(blow).toBeGreaterThanOrEqual(1 + level);
        expect(blow).toBeLessThanOrEqual(4 + level);
      }
      const hide = Canon.items[Canon.creature('ghoul').statistics!.armor!]!.armor!.ac;
      expect([level, e.armorAc]).toEqual([level, hide + Math.floor(level / 4)]);
    }
  });
  it('refuses a name nothing binds, dice in a hide, and damage for a weapon no body has', () => {
    const was = structuredClone(variations.t_grown!);
    Object.assign(variations.t_grown!, { hitDice: '2d8 + #moon', armorBonus: '1d4', damage: { longsword: '1d8' } });
    try {
      expect(CanonValidation.problems().filter(p => p.startsWith('variation t_grown'))).toEqual([
        'variation t_grown: hit dice 2d8 + #moon: No value for #moon',
        'variation t_grown: damage for longsword, which is no natural weapon',
        'variation t_grown: armour bonus 1d4 throws dice']);
    } finally { variations.t_grown = was; }
  });
  // A placed record may state a natural weapon's damage as dice of its own (the barrow ghoul's claws of 1d3,
  // the fell owlbear's claws, bite and natural 2: case 62; the long centipede's bite, case 63; the midden rat's,
  // case 64; the wild boar's natural 4, case 65; the drove dog's bite, case 67;
  // srd-proving-cases.md case 25; the royal mummy's slam, case 30) and its hide's bonus as a number (the royal mummy's
  // natural armour), which no context moves; none reads its context.
  it('is declared by no record a world places', () => {
    const records: { hitDice?: string; damage?: Record<string, string>; armorBonus?: string }[] = [
      ...Object.values(Canon.species).map(s => s.statistics ?? {}),
      ...Object.entries(CreatureVariants.variations).filter(([id]) => id !== 't_grown').map(([, v]) => v)];
    expect(records.filter(r => [...Object.values(r.damage ?? {}), r.armorBonus ?? '', r.hitDice ?? '']
      .some(x => /#/.test(x)) || /\D/.test(r.armorBonus ?? ''))).toEqual([]);
    expect(records.filter(r => r.damage).map(r => r.damage)).toEqual([{ bite: '1d4' }, { claws: '1d3' }, { slam: '1d6+3' },
      { claws: '1d6', bite: '1d8' }, { bite: '1d6' },
      { gnaw: '1d4' }]);
    expect(records.filter(r => r.armorBonus).map(r => r.armorBonus)).toEqual(['9', '2', '4']);
  });
});
