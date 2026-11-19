import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Effects } from '../src/effects';
import { Amounts } from '../src/rules/amounts';
import { Fighting } from '../src/rules/fighting';
import { CombatTelling } from '../src/ui/combat-telling';
import type { Fighter } from '../src/model';

// Bane by the SRD's numbers (doc/architecture/mission-22/srd-proving-cases.md, case 39), Orsino's Mass Curse: first
// level, enchantment beside Death, every foe, a Will save to negate (the fear save, made with Wisdom) at case 7's
// difficulty; whoever fails is baned for a minute, ten rounds: −1 to hit and −1 on saves against fear. Orsino's −1 to
// every score for three rounds, at the third level, gone. Its play-identity test.
const c = new Content('bane');
const bane = Content.abilities.find(a => a.id === 'mass_curse')!;
const hardy = (f: Fighter): Fighter => ({ ...f, level: 1, hp: 300, maxHp: 300 });
const cleric = (): Fighter => ({ ...hardy(c.character('cleric', 'cleric', 'fighters')), wisdom: 16,
  abilities: ['mass_curse'], maxSlots: [1], slots: [1], prepared: [['mass_curse']], ready: [['mass_curse']] });
const cast = (seed: string) => {
  const foes = ['g1', 'g2', 'g3'].map(id => hardy(c.character('warrior', id, 'goblins')));
  const b = new Battle({ id: 'bane', combatants: [cleric(), ...foes], abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'cleric'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return { b, events: b.step(b.legalCommands().find(x => x.ability === 'mass_curse')!) };
};
describe('Bane, by the SRD\'s numbers', () => {
  it('is a first-level enchantment of Death at every foe, saved against as fear at the SRD\'s difficulty', () => {
    expect(bane.name).toBe('Bane');
    expect(bane.spell).toEqual({ tradition: 'divine', level: 1, domain: 'death', school: 'enchantment',
      resistance: true });
    const e = bane.effects[0]!, d = e.save!.difficulty;
    expect([e.kind, e.target, e.kind === 'apply' && e.status, e.kind === 'apply' && e.duration, e.save!.kind])
      .toEqual(['apply', 'enemies', 'baned', 10, 'fear']);
    expect(Amounts.mean(d.kind === 'deem' ? d.expression : '', { castingLevel: 1, castingScore: 16, bonusSpellDC: 0 }))
      .toBe(14);
  });
  it('banes each foe who fails, for ten rounds: one worse to hit and against fear; who stands firm is untouched', () => {
    const outcomes = new Set<boolean>();
    for (const seed of ['a', 'b', 'c', 'd']) {
      const { b, events } = cast(seed);
      const saves = new Map(events.flatMap(e => e.type === 'save' ? [[e.target, e]] : []));
      expect([...saves.keys()].sort()).toEqual(['g1', 'g2', 'g3']);
      for (const [id, save] of saves) {
        const foe = b.state.combatants.find(f => f.id === id)!, baned = foe.statuses.find(s => s.id === 'baned');
        expect([save.kind, save.stat, save.difficulty]).toEqual(['fear', 'wisdom', 14]);
        expect(baned?.remaining).toBe(save.success ? undefined : 10);
        outcomes.add(save.success);
        if (save.success) { continue; }
        const plain = { ...foe, statuses: [] };
        expect(Fighting.toHit(Effects.combatant(foe))).toBe(Fighting.toHit(Effects.combatant(plain)) - 1);
        expect(Effects.saveModifier(foe, 'fear')).toBe(Effects.saveModifier(plain, 'fear') - 1);
        expect(CombatTelling.exchanges(events, b.state).map(t => t.text).join(' ')).toContain('A dread settles on');
      }
      expect(b.state.combatants.find(f => f.id === 'cleric')!.slots).toEqual([0]);
    }
    expect([...outcomes].sort()).toEqual([false, true]);
  });
});
