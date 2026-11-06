import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import type { CombatEvent } from '../src/model';

// What makes a monster other than a large animal (the owner, 6 November): its own powers by its kind, cast without a
// calling's slots when they are ready and resting after (a ghoul's paralysing touch, a vampire's drain), and what it
// is by nature at the end of its turn (Orsino's regeneration, which had been kept and never run).
const fight = (kind: string, seed: string) => {
  const c = new Content(`powers-${seed}`);
  const foe = { ...c.creature(kind, 'foe', 'goblins', 3), hp: 200, maxHp: 200 };
  const hero = { ...c.character('warrior', 'hero', 'fighters'), level: 3, hp: 300, maxHp: 300 };
  const b = new Battle({ id: 'p', combatants: [hero, foe], abilities: Content.abilities }, seed, 60);
  for (let i = 0; i < 24 && !b.state.outcome; i++) { b.step(b.chosen()); }
  return b.events;
};
const used = (events: CombatEvent[]) => events.flatMap(e => e.type === 'action' && e.command.actor === 'foe'
  ? [e.command.ability] : []);

describe('a monster\'s own powers', () => {
  it('lets a ghoul paralyse with its touch, with a save, between its blows, not every turn', () => {
    const events = fight('ghoul', 'ghoul'), mine = used(events);
    expect(mine).toContain('paralyzing_touch');
    expect(mine).toContain('melee');
    for (let i = 1; i < mine.length; i++) {
      expect([i, mine[i - 1] === 'paralyzing_touch' && mine[i] === 'paralyzing_touch']).toEqual([i, false]);
    }
    expect(events.some(e => e.type === 'save' && e.target === 'hero')).toBe(true);
  });
  it('lets a vampire drain, and regenerate at the end of its turns', () => {
    const events = fight('vampire', 'vampire');
    expect(used(events)).toContain('life_drain');
    expect(events.some(e => e.type === 'heal' && e.target === 'foe')).toBe(true);
  });
});
