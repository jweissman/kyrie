import { ItemCatalog } from '../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import barrow from '../data/generation/deep/barrow.json';
import { Battle } from '../src/arena';
import { Canon } from '../src/canon/canon';
import { CombatProjection } from '../src/combat-projection';
import { Content } from '../src/content';
import { CreatureFidelity } from '../src/cli/srd-creature-fidelity';
import { CreatureSchema, type Creature } from '../src/creature';
import { Effects } from '../src/effects';
import { KindDefenses } from '../src/kind-defenses';
import { Fighting } from '../src/rules/fighting';
import { Tactics } from '../src/tactics';
import { Parties } from '../src/world/parties';

// The king under the mound by the SRD mummy's numbers (mission-22/srd-proving-cases.md, case 30): the keeper of the
// king-barrow, the golden route's crown, a breed of Orsino's mummy (mummy/royal) placed by hand. 55 hit points at any
// rank; one slam a turn for 1d6+10, struck at the SRD's +11; AC 20 as Westernesse 1; saves of +4, +2 and +8; five off
// every blow, and fire half again; and despair, which holds whoever fails a fear save against 16 still for two rounds.
// Until 18 November it was Orsino's mummy at the twelfth level: 48 hit points, two slams of 1d6 by its Strength,
// cloth, half of every blow turned, regeneration, and Curse, Scream, Life Drain, Mass Curse and Reckless Attack.
const content = new Content('royal-mummy');
const kinds = ['fortitude', 'reflex', 'will'];
const sheet = (c: Creature) => {
  const f = CombatProjection.fighter(ItemCatalog.canon, c, 'goblins'), scores = Effects.scores(f) as Record<string, number>;
  return { hp: c.base.maxHp, armour: Fighting.armorClass(Effects.combatant(f)),
    blows: (f.equipment.routine ?? [f.equipment.weapon]).map(w => w.damage), abilities: f.abilities,
    saves: kinds.map(k => Fighting.statMod(scores[Canon.rules.saveKinds[k]!]!) + f.level
      + Effects.saveModifier(f, k)) };
};
const blow = (kind: string, amount: number, type: string) => {
  const f = content.creature(kind, 'k', 'goblins', 12);
  return Fighting.mitigate(amount, type, { bonus: 0, defender: Effects.modifiers(f),
    physical: Content.rules.physicalDamage, defenses: KindDefenses.of(f) }).amount;
};
describe('the king under the mound by the SRD mummy\'s numbers', () => {
  it('is the same mummy at every rank it is met at: 55, AC 1, one slam of 1d6+3 and its Strength, +4/+2/+8', () => {
    const ranks = [1, 8, 12].map(level => sheet(content.createCreature(ItemCatalog.canon, `m${level}`, { raceId: 'mummy/royal', level })));
    expect(ranks[1]).toEqual(ranks[0]!);
    expect(ranks[2]).toEqual(ranks[0]!);
    expect(ranks[0]).toEqual({ hp: 55, armour: 1, blows: ['1d6+3'], abilities: ['despair'], saves: [4, 2, 8] });
    expect(Battle.actionsOf(content.creature('mummy/royal', 'one', 'goblins', 12))).toBe(1);
    expect(Battle.actionsOf(content.creature('mummy', 'two', 'goblins', 12))).toBe(2);
  });
  it('strikes SRD AC 15 seventeen times in twenty at any rank, by the roll and its forecast alike', () => {
    for (const level of [1, 12]) {
      const m = Effects.combatant(content.creature('mummy/royal', `h${level}`, 'goblins', level));
      const mark = { ...m, armorAc: 4, dexterity: 10, modifiers: {}, fixedToHit: undefined };
      expect([level, Fighting.chance(m, mark), Fighting.attack(m, mark, () => 10).need]).toEqual([level, 0.85, 4]);
    }
  });
  it('turns five of every blow, not half, and takes fire half again; Orsino\'s mummy, the halls\', still halves', () => {
    expect([blow('mummy/royal', 12, 'slashing'), blow('mummy/royal', 4, 'piercing'), blow('mummy/royal', 10, 'fire')])
      .toEqual([7, 0, 15]);
    expect([blow('mummy', 12, 'slashing'), blow('mummy', 10, 'fire')]).toEqual([6, 15]);
  });
  it('holds whoever fails its despair still for two rounds, once a fight', () => {
    const us = [0, 1, 2].map(i => CombatProjection.fighter(ItemCatalog.canon, content.createCreature(ItemCatalog.canon, `w${i}`,
      { raceId: 'human', classId: 'warrior', level: 3 }, `d:${i}`), 'fighters'));
    const b = new Battle({ id: 'd', combatants: [...us, content.creature('mummy/royal', 'king', 'goblins', 12)],
      abilities: Content.abilities }, 'despair:1');
    for (let s = 0; !b.state.outcome && s < 2000; s++) { b.step(Tactics.choose(b.state, b.plain(b.legalCommands()))); }
    type Told = { type: string; actor?: string; target?: string; kind?: string; detail?: string; difficulty?: number;
      amount?: number; success?: boolean };
    const told = b.events as unknown as Told[];
    const saves = told.filter(e => e.type === 'save' && e.actor === 'king' && e.kind === 'fear');
    const held = told.filter(e => e.type === 'status' && e.actor === 'king' && e.detail === 'paralyzed');
    expect(saves.map(e => e.difficulty)).toEqual([16, 16, 16]);
    expect(held.map(e => [e.target, e.amount])).toEqual(saves.filter(e => !e.success).map(e => [e.target, 2]));
  });
  it('is the barrow\'s king alone: placed by hand, never drawn, and comes back from a save as it went', () => {
    expect([barrow.keeper.species, barrow.keeper.variations]).toEqual(['mummy', ['royal']]);
    expect(Parties.kinds()).not.toContain('mummy/royal');
    const m = content.createCreature(ItemCatalog.canon, 'kept', { raceId: 'mummy/royal', level: 12 });
    const again = JSON.parse(JSON.stringify(m)) as Creature;
    expect(() => CreatureSchema.validate(again, ItemCatalog.canon)).not.toThrow();
    expect(sheet(again)).toEqual(sheet(m));
  });
  it('passes the census in structure and resolution; mummy rot is the one special it lacks', () => {
    const row = CreatureFidelity.row('mummy/royal');
    expect(row.grades).toMatchObject({ structural: 'pass', resolution: 'pass' });
    expect(row.specials).toEqual({ verdict: 'differs', ours: 'despair', theirs: 'despair, mummy rot' });
    expect(CreatureFidelity.row('mummy').grades.resolution).toBe('fail');
  });
});
