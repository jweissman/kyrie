import { afterAll, describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { CanonValidation } from '../src/canon/canon-validation';
import { CombatProjection } from '../src/combat-projection';
import { Content } from '../src/content';
import { CreatureSchema, type Creature } from '../src/creature';
import { CreatureVariants, type Variation } from '../src/creature-variants';
import { Effects } from '../src/effects';
import { Fighting } from '../src/rules/fighting';

// A fixed stat block's saves and attack bonus (proof-slices.md, step 2), proved on the SRD rat, rat/cellar: made by
// the ordinary creature path at any rank, it is the same rat (its hit point, scores, bite, the bonus it bites at and
// its saves), and a save and a reload give it back exactly; the roll, its forecast and the page read one to-hit. An
// ordinary rat keeps the saves and blows its level gives it. This spec is rat/cellar's play-identity test (the
// concordance names it).
const content = new Content('fixed-stat-block');
const fighter = (c: Creature) => CombatProjection.fighter(c, 'goblins');
const kinds = ['fortitude', 'poison', 'paralyze', 'reflex', 'will', 'sleep', 'charm'];
const saves = (c: Creature) => {
  const f = fighter(c), scores = Effects.scores(f) as Record<string, number>;
  return kinds.map(k => Fighting.statMod(scores[Canon.rules.saveKinds[k]!]!) + f.level + Effects.saveModifier(f, k));
};
// What the rat is, as a fighter sees it: hit points, scores, blows, to-hit and saves.
const sheet = (c: Creature) => {
  const f = fighter(c);
  return { hp: c.base.maxHp, scores: [f.strength, f.dexterity, f.constitution, f.intelligence, f.wisdom, f.charisma],
    blows: (f.equipment.routine ?? [f.equipment.weapon]).map(w => w.damage), toHit: Fighting.toHit(Effects.combatant(f))
      + Math.floor(f.level / 2), saves: saves(c) };
};
describe('the SRD rat, a fixed stat block', () => {
  it('is the same rat at every rank it is met at, and saves and bites as the SRD has it', () => {
    const ranks = [1, 3, 6].map(level => sheet(content.createCreature(`r${level}`, { raceId: 'rat/cellar', level })));
    expect(ranks[1]).toEqual(ranks[0]!);
    expect(ranks[2]).toEqual(ranks[0]!);
    expect(ranks[0]).toMatchObject({ hp: 1, scores: [2, 15, 10, 2, 12, 2], blows: ['1d3'], saves: [2, 2, 2, 4, 1, 1, 1] });
  });
  it('hits SRD AC 15 half the time at any rank, by the roll and its forecast alike', () => {
    for (const level of [1, 4, 9]) {
      const rat = Effects.combatant(fighter(content.createCreature(`h${level}`, { raceId: 'rat/cellar', level })));
      const mark = { ...rat, armorAc: 4, dexterity: 10, modifiers: {}, fixedToHit: undefined };
      expect([level, Fighting.chance(rat, mark)]).toEqual([level, 0.5]);
      expect([level, Fighting.attack(rat, mark, () => 10).need]).toEqual([level, 11]);
    }
  });
  it('comes back from a save as it went', () => {
    const rat = content.createCreature('kept', { raceId: 'rat/cellar', level: 4 });
    const again = JSON.parse(JSON.stringify(rat)) as Creature;
    expect(() => CreatureSchema.validate(again)).not.toThrow();
    expect(sheet(again)).toEqual(sheet(rat));
  });
  it('leaves an ordinary rat to its level', () => {
    const low = saves(content.createCreature('o1', { raceId: 'rat', level: 1 }));
    expect(saves(content.createCreature('o6', { raceId: 'rat', level: 6 }))).not.toEqual(low);
  });
});

const variations = CreatureVariants.variations as Record<string, Variation>;
afterAll(() => { delete variations.t_loose; });
describe('a fixed stat block\'s saves and attack bonus', () => {
  it('are refused without Hit Dice beside them, and unless the saves are the three', () => {
    variations.t_loose = { axis: 'breed', word: 'loose', says: 'as the book has it', kinds: ['animal'],
      saves: { fortitude: 0, reflex: 2 } as never, attackBonus: 1, unplaced: true };
    const problems = CanonValidation.problems();
    expect(problems.some(p => p.includes('t_loose') && p.includes('saves are Fortitude, Reflex and Will'))).toBe(true);
    expect(problems.some(p => p.includes('t_loose') && p.includes('want its Hit Dice beside them'))).toBe(true);
  });
});
