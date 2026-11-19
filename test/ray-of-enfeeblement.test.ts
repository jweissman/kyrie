import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Effects } from '../src/effects';
import { ConditionAmount } from '../src/rules/condition-amount';
import type { Fighter } from '../src/model';

// Ray of Enfeeblement by the SRD's resolution (doc/architecture/mission-22/srd-proving-cases.md, case 58), and a
// condition laid with an amount its caster throws (ConditionAmount): one foe a ranged touch lands on, no save, 1d6 off
// its Strength and a point each two casting levels to five, a minute a casting level; Orsino's second level kept.
const c = new Content('ray-of-enfeeblement');
const ray = Content.abilities.find(a => a.id === 'weakness')!;
const hardy = (f: Fighter, level = 5): Fighter => ({ ...f, level, hp: 400, maxHp: 400 });
const mage = (): Fighter => ({ ...hardy(c.character('mage', 'mage', 'fighters')), abilities: ['weakness'],
  maxSlots: [0, 0, 1], slots: [0, 0, 1], prepared: [[], [], ['weakness']], ready: [[], [], ['weakness']] });
const battle = (seed: string, foe: Fighter) => {
  const b = new Battle({ id: 'ray', combatants: [mage(), foe], abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 20 && b.state.actor !== 'mage'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
describe('a condition laid with an amount', () => {
  it('counts its perAmount that many times, and adds nothing held without one', () => {
    const per = { attributes: { strength: -1 } };
    expect(ConditionAmount.added(per, { id: 'enfeebled', remaining: 3, amount: 4 })).toEqual({ attributes: { strength: -4 } });
    expect(ConditionAmount.added(per, { id: 'enfeebled', remaining: 3 })).toEqual({});
  });
});
describe('Ray of Enfeeblement, by the SRD\'s resolution', () => {
  it('is a ranged touch at one foe, no save, spell resistance answering it, at Orsino\'s second level', () => {
    const e = ray.effects[0]!;
    expect([ray.name, ray.spell!.level, ray.spell!.school, ray.spell!.resistance, e.touch, e.save])
      .toEqual(['Ray of Enfeeblement', 2, 'necromancy', true, 'ranged', undefined]);
  });
  it('takes 1d6 and two from a wolf\'s Strength at the fifth casting level, for fifty rounds, where the touch lands', () => {
    let landed = 0;
    for (const seed of 'abcdefghijkl'.split('')) {
      const wolf = hardy(c.creature('wolf', 'g1', 'goblins', 1), 1), before = Effects.scores(wolf).strength;
      const b = battle(seed, wolf);
      b.step({ actor: 'mage', ability: 'weakness', target: 'g1' });
      const held = b.state.combatants.find(f => f.id === 'g1')!;
      const laid = held.statuses.find(s => s.id === 'enfeebled');
      if (!laid) { continue; }
      landed++;
      expect(laid.amount).toBeGreaterThanOrEqual(3);
      expect(laid.amount).toBeLessThanOrEqual(8);
      expect(laid.remaining).toBe(50);
      expect(Effects.scores(held).strength).toBe(Math.max(1, before - laid.amount!));
    }
    expect(landed).toBeGreaterThan(0);
  });
});
