import { ItemCatalog } from '../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import { CombatProjection } from '../src/combat-projection';
import { Content } from '../src/content';
import { CreatureFidelity } from '../src/cli/srd-creature-fidelity';
import { CreatureSchema, type Creature } from '../src/creature';
import { Effects } from '../src/effects';
import { Fighting } from '../src/rules/fighting';
import { Canon } from '../src/canon/canon';

// The barrow ghoul by the SRD ghoul's numbers (mission-22/srd-proving-cases.md, case 25): the keeper of the vault under
// the first town, the one SRD stat block a1 places, met alone and told before it is joined. Thirteen hit points at any
// rank; a bite at +2 for 1d6+1 and two claws at +0 for 1d3, each paralysing as it lands; AC 14 as
// Westernesse 7; saves of +0, +2 and +5. Until 18 November it wore hide (AC 6), clawed for 1d4 and was struck by its
// Strength, half again as likely to hit, and saved by its scores and level.
const content = new Content('barrow-ghoul');
const kinds = ['fortitude', 'reflex', 'will', 'paralyze', 'charm'];
const sheet = (c: Creature) => {
  const f = CombatProjection.fighter(ItemCatalog.canon, c, 'goblins'), scores = Effects.scores(f) as Record<string, number>;
  return { hp: c.base.maxHp, armour: Fighting.armorClass(Effects.combatant(f)),
    blows: (f.equipment.routine ?? [f.equipment.weapon]).map(w => w.damage.replace(/[+-]\d+$/, '')),
    saves: kinds.map(k => Fighting.statMod(scores[Canon.rules.saveKinds[k]!]!) + f.level
      + Effects.saveModifier(f, k)) };
};
describe('the barrow ghoul by the SRD\'s numbers', () => {
  it('is the same ghoul at every rank it is met at: 13, AC 7, bite 1d6 and claws 1d3, saves +0, +2, +5', () => {
    const ranks = [1, 2, 6].map(level => sheet(content.createCreature(ItemCatalog.canon, `g${level}`, { raceId: 'ghoul/barrow', level })));
    expect(ranks[1]).toEqual(ranks[0]!);
    expect(ranks[2]).toEqual(ranks[0]!);
    expect(ranks[0]).toEqual({ hp: 13, armour: 7, blows: ['1d6', '1d3', '1d3'], saves: [0, 2, 5, 0, 5] });
  });
  it('strikes SRD AC 15 two times in five at any rank, by the roll and its forecast alike', () => {
    for (const level of [1, 2, 5]) {
      const g = Effects.combatant(content.creature('ghoul/barrow', `h${level}`, 'goblins', level));
      const mark = { ...g, armorAc: 4, dexterity: 10, modifiers: {}, fixedToHit: undefined };
      expect([level, Fighting.chance(g, mark)]).toEqual([level, 0.4]);
      expect([level, Fighting.attack(g, mark, () => 10).need]).toEqual([level, 13]);
    }
  });
  it('strikes with the bite and secondary claws separately while retaining their paralysis riders', () => {
    for (const level of [1, 5]) {
      const g = content.creature('ghoul/barrow', `g${level}`, 'goblins', level);
      const combatant = Effects.combatant(g), mark = { ...combatant, armorAc: 4, dexterity: 10, modifiers: {} };
      const strikes = g.equipment.routine!;
      expect(strikes.map(w => [w.attackBonus, w.damageBonus])).toEqual([[2, 1], [0, 0], [0, 0]]);
      expect(strikes.map(w => Fighting.attack({ ...combatant, weapon: w }, mark, () => 10).need))
        .toEqual([13, 15, 15]);
      expect(strikes.map(w => Fighting.weaponDamage({ ...combatant, weapon: w }, 1, false).amount))
        .toEqual([2, 1, 1]);
      expect(strikes.map(w => w.onHit?.[0]?.kind)).toEqual(['apply', 'apply', 'apply']);
    }
  });
  it('comes back from a save as it went', () => {
    const g = content.createCreature(ItemCatalog.canon, 'kept', { raceId: 'ghoul/barrow', level: 2 });
    const again = JSON.parse(JSON.stringify(g)) as Creature;
    expect(() => CreatureSchema.validate(again, ItemCatalog.canon)).not.toThrow();
    expect(sheet(again)).toEqual(sheet(g));
  });
  it('passes the census in structure and resolution; ghoul fever is the one special it lacks', () => {
    const row = CreatureFidelity.row('ghoul/barrow');
    expect(row.grades).toMatchObject({ structural: 'pass', resolution: 'pass' });
    expect(row.specials).toEqual({ verdict: 'differs', ours: 'paralysis', theirs: 'ghoul fever, paralysis' });
    // Orsino's ghoul, the dens' and the ossuary's, keeps its own body (case 25's census).
    expect(CreatureFidelity.row('ghoul').grades.resolution).toBe('fail');
  });
});
