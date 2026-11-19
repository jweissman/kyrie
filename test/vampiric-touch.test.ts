import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Amounts } from '../src/rules/amounts';
import type { CombatEvent, Fighter } from '../src/model';

// Vampiric Touch by the SRD's numbers (doc/architecture/mission-22/srd-proving-cases.md, case 52), Orsino's Life
// Drain: third level, a melee touch, 1d6 necrotic every two casting levels to ten, mending its caster, no save.
const c = new Content('vampiric-touch');
const touch = Content.abilities.find(a => a.id === 'life_drain')!;
const hardy = (f: Fighter, level: number): Fighter => ({ ...f, level, hp: 300, maxHp: 300 });
const cleric = (): Fighter => ({ ...hardy(c.character('cleric', 'cleric', 'fighters'), 6), hp: 100,
  abilities: ['life_drain'], maxSlots: [0, 0, 1], slots: [0, 0, 1], prepared: [[], [], ['life_drain']],
  ready: [[], [], ['life_drain']] });
const battle = (seed: string) => {
  const b = new Battle({ id: 'vt', combatants: [cleric(), hardy(c.character('warrior', 'g1', 'goblins'), 1)],
    abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'cleric'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
const drained = (events: CombatEvent[]) => events.flatMap(e => e.type === 'damage' && e.target === 'g1' ? [e] : []);
describe('Vampiric Touch, by the SRD\'s numbers', () => {
  it('is a third-level necromancy, 1d6 every two casting levels to ten, at a melee touch, with no save', () => {
    expect(touch.spell).toEqual({ tradition: 'divine', level: 3, domain: 'death', school: 'necromancy',
      resistance: true });
    const e = touch.effects[0]!, expression = e.kind === 'drain' && e.amount.kind === 'deem' ? e.amount.expression : '';
    expect([1, 2, 6, 20, 30].map(castingLevel => Amounts.mean(expression, { castingLevel })))
      .toEqual([0, 3.5, 10.5, 35, 35]);
    expect([e.touch, e.save, e.kind === 'drain' && e.damageType]).toEqual(['melee', undefined, 'necrotic']);
    expect(touch.resist).toBeUndefined();
  });
  it('draws only where the touch lands, and what it draws mends the caster', () => {
    let hits = 0;
    for (const seed of 'abcdefghijkl'.split('')) {
      const b = battle(seed), hp = b.state.combatants.find(f => f.id === 'cleric')!.hp;
      const events = b.step({ actor: 'cleric', ability: 'life_drain', target: 'g1' });
      const landed = events.find(e => e.type === 'attack' && e.touch);
      const success = landed?.type === 'attack' && landed.success;
      expect(drained(events).length).toBe(success ? 1 : 0);
      expect(events.some(e => e.type === 'save')).toBe(false);
      if (success) {
        const dealt = drained(events)[0]!.amount;
        expect(b.state.combatants.find(f => f.id === 'cleric')!.hp).toBe(hp + dealt);
        hits++;
      }
    }
    expect(hits).toBeGreaterThan(0);
  });
});
