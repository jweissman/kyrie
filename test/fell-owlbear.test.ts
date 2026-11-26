import { ItemCatalog } from '../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import { CombatProjection } from '../src/combat-projection';
import { Content } from '../src/content';
import { CreatureFidelity } from '../src/cli/srd-creature-fidelity';
import { CreatureSchema, type Creature } from '../src/creature';
import { Effects } from '../src/effects';
import { Fighting } from '../src/rules/fighting';
import { Canon } from '../src/canon/canon';
import { AbilityUse } from '../src/ability-use';
import { AttackRoutine } from '../src/attack-routine';
import { Expressions } from '../src/expressions';
import { StatBlockCheck } from '../src/canon/stat-block-check';
import type { EffectContext } from '../src/effects';

// The fell owlbear by the SRD owlbear's numbers (mission-22/srd-proving-cases.md, case 62): a breed of Orsino's,
// placed where it is warned of and can be gone round or baited (Tallow's scrub, the arcology's foot). Fifty-two hit
// points at any rank; two claws at +9 for 1d6+5 and a bite at +4 for 1d8+2; AC 15 as
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
  it('executes each projected strike at its own bonus and restores the primary weapon', () => {
    const melee = Content.abilities.find(a => a.id === 'melee')!;
    for (const level of [1, 5]) {
      const actor = content.creature('owlbear/fell', `o${level}`, 'goblins', level);
      const target = { ...content.character('warrior', 'mark', 'fighters'), dexterity: 10, hp: 1000, maxHp: 1000,
        traits: [], statuses: [], equipment: { armorAc: 4, modifiers: {}, hooks: {},
          weapon: { id: 'fist', name: 'fist', damage: '1d3', type: 'bludgeoning' } } };
      const routine = actor.equipment.routine!, original = actor.equipment.weapon;
      expect(routine.map(w => [w.attackBonus, w.damageBonus])).toEqual([[9, 5], [9, 5], [4, 2]]);
      expect(routine.map(w => Fighting.weaponDamage({ ...Effects.combatant(actor), weapon: w }, 1, false).amount))
        .toEqual([6, 6, 3]);
      const expressions = new Expressions(`fell-${level}`);
      const ctx: EffectContext = { actor, fighters: [actor, target], turn: 1, events: [], content,
        abilities: [], retreat: false, location: null, expressions };
      AttackRoutine.strike(actor, 'melee', ctx.events, () => {
        AbilityUse.perform(melee, target.id, expressions, ctx);
        return false;
      });
      expect(ctx.events.flatMap(e => e.type === 'attack' ? [e.need] : [])).toEqual([6, 6, 11]);
      expect(ctx.events.filter(e => e.type === 'action')).toHaveLength(1);
      expect(actor.equipment.weapon).toEqual(original);
    }
  });
  it('rejects incomplete or unbound strike bonuses', () => {
    const valid = { hitDice: '1d8', attacks: ['claws'], strikes: [{ attackBonus: 0, damageBonus: -1 }] };
    expect(StatBlockCheck.refused(valid)).toEqual([]);
    for (const invalid of [{ ...valid, hitDice: undefined }, { ...valid, attacks: [] },
      { ...valid, strikes: [] }, { ...valid, strikes: [{ attackBonus: 1.5, damageBonus: 0 }] },
      { ...valid, strikes: [{ attackBonus: 1, damageBonus: NaN }] }]) {
      expect(StatBlockCheck.refused(invalid)).toContain('strikes want Hit Dice and one pair of whole bonuses for each natural attack');
    }
  });
  it('uses a wielded weapon instead of the natural routine', () => {
    const creature = content.createCreature('armed', { raceId: 'owlbear/fell', level: 2 });
    creature.state.inventory = [{ id: 'blade', definition: 'longsword', equipped: true }];
    const equipped = CombatProjection.fighter(creature, 'goblins').equipment;
    expect(equipped.weapon.id).toBe('longsword');
    expect(equipped.weapon.attackBonus).toBeUndefined();
    expect(equipped.routine).toBeUndefined();
  });
  it('stops a routine when its target falls and restores the primary weapon', () => {
    const actor = content.creature('owlbear/fell', 'o', 'goblins', 2);
    const original = actor.equipment.weapon;
    const used: string[] = [];
    AttackRoutine.strike(actor, 'melee', [], () => {
      used.push(actor.equipment.weapon.id);
      return used.length === 2;
    });
    expect(used).toEqual(['claws', 'claws']);
    expect(actor.equipment.weapon).toEqual(original);
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
