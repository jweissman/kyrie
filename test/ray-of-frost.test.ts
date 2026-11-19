import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Creation } from '../src/rules/creation';
import type { CombatEvent, Fighter } from '../src/model';

// Ray of Frost by the SRD's numbers (doc/architecture/mission-22/srd-proving-cases.md, case 45): a cantrip, a ranged
// touch for 1d3 cold, spell resistance answering it, its cold setting off none of Orsino's freezing.
const c = new Content('ray-of-frost');
const ray = Content.abilities.find(a => a.id === 'ray_of_frost')!;
const hardy = (f: Fighter): Fighter => ({ ...f, hp: 300, maxHp: 300 });
const battle = (seed: string) => {
  const mage = { ...hardy(c.character('mage', 'mage', 'fighters')), level: 1, abilities: ['ray_of_frost'] };
  const b = new Battle({ id: 'ray', combatants: [mage, hardy(c.character('warrior', 'g1', 'goblins'))],
    abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'mage'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
const cold = (events: CombatEvent[]) => events.flatMap(e => e.type === 'damage' && e.damageType === 'cold' ? [e] : []);
describe('Ray of Frost, by the SRD\'s numbers', () => {
  it('is an evocation cantrip every evoker knows, which spell resistance answers', () => {
    expect(ray.spell).toEqual({ tradition: 'arcane', level: 0, school: 'evocation', resistance: true });
    expect(Creation.spellbook('arcane', 0, 'evocation')).toContain('ray_of_frost');
  });
  it('is a ranged touch for 1d3 cold, spending nothing, and freezes no one', () => {
    let hits = 0, misses = 0;
    for (const seed of 'abcdefghijklmnop'.split('')) {
      const b = battle(seed), events = b.step({ actor: 'mage', ability: 'ray_of_frost', target: 'g1' });
      const touch = events.find(e => e.type === 'attack' && e.touch);
      expect(touch).toMatchObject({ touch: 'ranged', target: 'g1' });
      const hit = touch?.type === 'attack' && touch.success;
      expect(cold(events).length).toBe(hit ? 1 : 0);
      for (const e of cold(events)) { expect([1, 2, 3]).toContain(e.rolled); }
      expect(events.some(e => e.type === 'status' && e.detail === 'frozen')).toBe(false);
      if (hit) { hits++; } else { misses++; }
    }
    expect(hits).toBeGreaterThan(0);
    expect(misses).toBeGreaterThan(0);
  });
});
