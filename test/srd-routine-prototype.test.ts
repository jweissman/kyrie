import { describe, expect, it } from 'bun:test';
import { Fighting, type Combatant } from '../src/rules/fighting';
import { Content } from '../src/content';
import { AbilityUse } from '../src/ability-use';
import { AttackRoutine } from '../src/attack-routine';
import { Expressions } from '../src/expressions';
import type { EffectContext } from '../src/effects';
import { SrdRoutinePrototype as Prototype } from './support/srd-routine-prototype';

const mark = (ac: number): Combatant => ({ level: 1, strength: 10, dexterity: 10,
  armorAc: Math.max(0, ac - 11), weapon: { id: 'fist', name: 'fist', damage: '1d3', type: 'bludgeoning' },
  modifiers: { ac: Math.max(0, 11 - ac) } });

describe('staged SRD routines, not installed creatures', () => {
  it('preserves every extracted strike at multiple ranks and ACs, without secondary-strength double counting', () => {
    let bodies = 0, strikes = 0, distinct = 0;
    const blocked: Record<string, string> = {};
    for (const [id, body] of Object.entries(Prototype.bodies)) {
      const problem = Prototype.problem(id);
      if (problem) { blocked[id] = problem; continue; }
      const routine = Prototype.routine(id);
      expect(routine).toHaveLength(body.attacks.reduce((sum, a) => sum + a.count, 0));
      bodies++;
      if (new Set(body.attacks.map(a => a.bonus)).size > 1) { distinct++; }
      for (const weapon of routine) {
        strikes++;
        for (const rank of [1, 7, 20]) {
          const attacker = Prototype.combatant(id, weapon, rank);
          expect(Fighting.armorClass(attacker)).toBe(21 - body.ac);
          for (const ac of [5, 15, 25, 60]) {
            let hits = 0;
            for (let die = 1; die <= 20; die++) {
              const expected = die !== 1 && (die === 20 || die + weapon.attackBonus! >= ac);
              expect(Fighting.attack(attacker, mark(ac), () => die).success).toBe(expected);
              if (expected) { hits++; }
            }
            expect(Fighting.chance(attacker, mark(ac))).toBe(hits / 20);
          }
          const [count, sides] = weapon.damage.split('d').map(Number);
          for (const rolled of [count!, count! * sides!]) {
            expect(Fighting.weaponDamage(attacker, rolled, false).amount)
              .toBe(Math.max(1, rolled + weapon.damageBonus!));
          }
        }
      }
    }
    expect(bodies).toBeGreaterThanOrEqual(100);
    expect(distinct).toBeGreaterThanOrEqual(100);
    console.log(`Staged numeric routines: ${bodies} bodies, ${strikes} strikes, ${distinct} distinct-bonus bodies`);
    console.log('Rejected source records:', blocked);
  });
  it('uses an ape bite bonus separately from its claws and preserves signed and zero damage bonuses', () => {
    const [claw, , bite] = Prototype.routine('ape');
    const a = Prototype.combatant('ape', claw!, 4), b = Prototype.combatant('ape', bite!, 4);
    expect(Fighting.attack(a, mark(15), () => 10).need).toBe(8);
    expect(Fighting.attack(b, mark(15), () => 10).need).toBe(13);
    expect(Fighting.weaponDamage(a, 3, false).amount).toBe(8);
    expect(Fighting.weaponDamage(b, 3, false).amount).toBe(5);
    const badger = Prototype.combatant('badger', Prototype.routine('badger')[0]!, 1);
    expect(Fighting.weaponDamage(badger, 1, false).amount).toBe(1);
    expect(Fighting.weaponDamage({ ...a, weapon: { ...claw!, damageBonus: 0 } }, 3, false).amount).toBe(3);
  });
  it('does not let a natural weapon bonus become a touch-spell attack bonus or change legacy weapons', () => {
    const weapon = Prototype.routine('ape')[0]!, a = Prototype.combatant('ape', weapon, 4);
    const legacy = { ...weapon, attackBonus: undefined, damageBonus: undefined };
    const plain = { ...a, weapon: legacy };
    expect(Fighting.touchChance(a, mark(15), true)).toBe(Fighting.touchChance(plain, mark(15), true));
    expect(Fighting.touchChance(a, mark(15), false)).toBe(Fighting.touchChance(plain, mark(15), false));
    expect(Fighting.weaponDamage(plain, 3, false).amount).toBe(8);
    expect(Fighting.attack(plain, mark(60), () => 20).success).toBe(false);
    expect(Fighting.attack({ ...a, modifiers: { toHit: 2 } }, mark(15), () => 10).need).toBe(6);
    const penalized = { ...a, modifiers: { allRolls: -25 } }, boosted = { ...a, modifiers: { allRolls: 25 } };
    expect(Fighting.attack(penalized, mark(60), () => 20).success).toBe(true);
    expect(Fighting.chance(penalized, mark(60))).toBe(0.05);
    expect(Fighting.attack(boosted, mark(15), () => 1).success).toBe(false);
    expect(Fighting.chance(boosted, mark(15))).toBe(0.95);
  });
  it('rejects absent routines and keeps unimplemented specials explicit', () => {
    expect(() => Prototype.routine('not-a-body')).toThrow('Unknown SRD body');
    expect(() => Prototype.routine('bat')).toThrow('No extracted routine');
    expect(() => Prototype.combatant('ape', Prototype.routine('ape')[0]!, 0)).toThrow('Invalid staged');
    expect(Prototype.blockers('boar')).toContain('attack: Ferocity');
    expect(Prototype.blockers('ape')).toContain('quality: scent');
  });
  it('executes all three ape blows through the real routine and effect path, with one action and reproducible events', () => {
    const content = new Content('routine-prototype'), melee = Content.abilities.find(a => a.id === 'melee')!;
    const run = (seed: string) => {
      const routine = Prototype.routine('ape');
      const actor = { ...content.character('warrior', 'ape', 'goblins'), classId: undefined,
        strength: 21, dexterity: 15, level: 4, traits: [], statuses: [],
        equipment: { body: null, armorAc: 0, modifiers: {}, hooks: {}, weapon: routine[0]!, routine } };
      const target = { ...content.character('warrior', 'mark', 'fighters'), dexterity: 10, traits: [], statuses: [],
        hp: 1000, maxHp: 1000, equipment: { body: null, armorAc: 4, modifiers: {}, hooks: {},
          weapon: { id: 'fist', name: 'fist', damage: '1d3', type: 'bludgeoning' } } };
      const expressions = new Expressions(seed), context: EffectContext = { actor, fighters: [actor, target],
        turn: 1, events: [], content, abilities: [], retreat: false, location: null, expressions };
      AttackRoutine.strike(actor, 'melee', context.events, () => {
        AbilityUse.perform(melee, target.id, expressions, context);
        return target.hp === 0;
      });
      return context.events;
    };
    for (const seed of ['routine-a', 'routine-b', 'routine-c']) {
      const events = run(seed), attacks = events.flatMap(e => e.type === 'attack' ? [e] : []);
      expect(attacks.map(a => a.need)).toEqual([8, 8, 13]);
      expect(events.filter(e => e.type === 'action')).toHaveLength(1);
      expect(events.filter(e => e.type === 'damage')).toHaveLength(attacks.filter(a => a.success).length);
      expect(run(seed)).toEqual(events);
    }
  });
});
