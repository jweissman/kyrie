import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Amounts } from '../src/rules/amounts';
import type { CombatEvent, Fighter } from '../src/model';

// Ghoul Touch by the SRD's numbers (doc/architecture/mission-22/srd-proving-cases.md, case 36), Orsino's Paralyzing
// Touch: second level, necromancy, one humanoid a melee touch lands on (case 35's touch), paralysed six rounds (the
// SRD's 1d6+2, its mean rounded up) unless a Fortitude save at case 7's difficulty negates it. Its play-identity test.
const c = new Content('ghoul-touch');
const touch = Content.abilities.find(a => a.id === 'paralyzing_touch')!;
const hardy = (f: Fighter, level = 3): Fighter => ({ ...f, level, hp: 300, maxHp: 300 });
const mage = (): Fighter => ({ ...hardy(c.character('mage', 'mage', 'fighters')), intelligence: 16,
  abilities: ['paralyzing_touch'], maxSlots: [0, 1], slots: [0, 1], prepared: [[], ['paralyzing_touch']],
  ready: [[], ['paralyzing_touch']] });
const battle = (seed: string, foe: Fighter) => {
  const b = new Battle({ id: 'ghoul-touch', combatants: [mage(), foe], abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'mage'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
const cast = (seed: string, foe: Fighter) => {
  const b = battle(seed, foe);
  return { b, events: b.step(b.legalCommands().find(x => x.ability === 'paralyzing_touch' && x.target === foe.id)!) };
};
const of = (events: CombatEvent[], type: 'attack' | 'save' | 'status') => events.filter(e => e.type === type);
describe('Ghoul Touch, by the SRD\'s numbers', () => {
  it('is a second-level necromancy on one humanoid, six rounds, a Fortitude save at the SRD\'s difficulty', () => {
    const e = touch.effects[0]!;
    expect(touch.spell).toEqual({ tradition: 'arcane', level: 2, school: 'necromancy' });
    expect([e.kind, e.target, e.targetTrait, e.touch, e.save?.kind]).toEqual(['apply', 'enemy', 'humanoid', 'melee',
      'fortitude']);
    expect(e.kind === 'apply' && e.duration).toBe(6);
    const d = e.save!.difficulty;
    expect(Amounts.mean(d.kind === 'deem' ? d.expression : '', { castingLevel: 3, castingScore: 16, bonusSpellDC: 0 }))
      .toBe(16);
  });
  it('touches first: a miss lays nothing and asks no save; a hit is saved against, and held for six rounds', () => {
    const outcomes = new Set<string>();
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p']) {
      const { b, events } = cast(seed, hardy(c.character('warrior', 'g1', 'goblins'), 1));
      const [attack] = of(events, 'attack'), saves = of(events, 'save'), held = of(events, 'status');
      expect(attack).toMatchObject({ touch: 'melee', target: 'g1', weapon: '' });
      expect(b.state.combatants.find(f => f.id === 'mage')!.slots).toEqual([0, 0]);
      if (attack?.type !== 'attack' || !attack.success) {
        expect([saves.length, held.length]).toEqual([0, 0]);
        outcomes.add('missed');
        continue;
      }
      const [save] = saves;
      expect(save).toMatchObject({ kind: 'fortitude', stat: 'constitution', difficulty: 16 });
      const laid = held.flatMap(e => e.type === 'status' && e.detail === 'paralyzed' ? [e.amount] : []);
      expect(laid).toEqual(save?.type === 'save' && save.success ? [] : [6]);
      expect(b.state.combatants.find(f => f.id === 'g1')!.statuses.some(s => s.id === 'paralyzed')).toBe(laid.length > 0);
      outcomes.add(save?.type === 'save' && save.success ? 'saved' : 'held');
    }
    expect([...outcomes].sort()).toEqual(['held', 'missed', 'saved']);
  });
  it('is not offered at a creature that is not a person', () => {
    const b = battle('wolf', hardy(c.creature('wolf', 'g1', 'goblins', 1), 1));
    expect(b.legalCommands().some(x => x.ability === 'paralyzing_touch')).toBe(false);
  });
});
