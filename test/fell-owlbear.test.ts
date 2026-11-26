import { ItemCatalog } from '../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import { CombatProjection } from '../src/combat-projection';
import { Content } from '../src/content';
import { CreatureFidelity } from '../src/cli/srd-creature-fidelity';
import { CreatureSchema, type Creature } from '../src/creature';
import { Effects } from '../src/effects';
import { Fighting } from '../src/rules/fighting';
import { Canon } from '../src/canon/canon';

// The fell owlbear by the SRD owlbear's numbers (mission-22/srd-proving-cases.md, case 62): a breed of Orsino's,
// placed where it is warned of and can be gone round or baited (Tallow's scrub, the arcology's foot). Fifty-two hit
// points at any rank; two claws of 1d6 and a bite of 1d8 with its Strength, struck at the SRD's +9; AC 15 as
// Westernesse 6; saves of +9, +5 and +2; none of Orsino's Maul, Charge, Enrage, Poison Bite, Stomp or wild aspect.
const content = new Content('fell-owlbear');
const kinds = ['fortitude', 'reflex', 'will'];
const sheet = (c: Creature) => {
  const f = CombatProjection.fighter(ItemCatalog.canon, c, 'goblins'), scores = Effects.scores(f) as Record<string, number>;
  return { hp: c.base.maxHp, armour: Fighting.armorClass(Effects.combatant(f)),
    blows: (f.equipment.routine ?? [f.equipment.weapon]).map(w => w.damage.replace(/[+-]\d+$/, '')),
    saves: kinds.map(k => Fighting.statMod(scores[Canon.rules.saveKinds[k]!]!) + f.level + Effects.saveModifier(f, k)),
    abilities: c.base.abilities };
};
describe('the fell owlbear by the SRD\'s numbers', () => {
  it('is the same owlbear at every rank: 52, AC 6, claws 1d6 and bite 1d8, saves +9, +5, +2, nothing of Orsino\'s', () => {
    const ranks = [1, 2, 6].map(level => sheet(content.createCreature(ItemCatalog.canon, `o${level}`, { raceId: 'owlbear/fell', level })));
    expect(ranks[1]).toEqual(ranks[0]!);
    expect(ranks[2]).toEqual(ranks[0]!);
    expect(ranks[0]).toMatchObject({ hp: 52, armour: 6, blows: ['1d6', '1d6', '1d8'], saves: [9, 5, 2] });
    expect(ranks[0]!.abilities.filter(a => ['maul', 'charge', 'enrage', 'poison_bite', 'stomp'].includes(a)))
      .toEqual([]);
  });
  it('strikes SRD AC 15 three times in four at any rank, by the roll and its forecast alike', () => {
    for (const level of [1, 2, 5]) {
      const o = Effects.combatant(content.creature('owlbear/fell', `h${level}`, 'goblins', level));
      const mark = { ...o, armorAc: 4, dexterity: 10, modifiers: {}, fixedToHit: undefined };
      expect([level, Fighting.chance(o, mark)]).toEqual([level, 0.75]);
      expect([level, Fighting.attack(o, mark, () => 10).need]).toEqual([level, 6]);
    }
  });
  it('comes back from a save as it went', () => {
    const o = content.createCreature(ItemCatalog.canon, 'kept', { raceId: 'owlbear/fell', level: 2 });
    const again = JSON.parse(JSON.stringify(o)) as Creature;
    expect(() => CreatureSchema.validate(again, ItemCatalog.canon)).not.toThrow();
    expect(sheet(again)).toEqual(sheet(o));
  });
  it('passes the census in structure and resolution; improved grab is the one special it lacks', () => {
    const row = CreatureFidelity.row('owlbear/fell');
    expect(row.grades).toMatchObject({ structural: 'pass', resolution: 'pass' });
    expect(row.specials).toEqual({ verdict: 'differs', ours: '', theirs: 'improved grab' });
    // Orsino's owlbear, the hive's and the circus's, keeps its own body until those placements are fought.
    expect(CreatureFidelity.row('owlbear').grades.resolution).toBe('fail');
  });
});
