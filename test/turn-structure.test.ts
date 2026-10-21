import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import type { Fighter } from '../src/model';

// Orsino's turn structure: how many times a creature acts in its turn (haste, slow), whether it chooses what it does
// (confusion), whose side it takes (charm), and who commands it (domination).
class Fight {
  static readonly content = new Content('turns');
  static make(statuses: { a?: string[]; b?: string[] } = {}) {
    // The company with plain weapons only, so nobody is knocked down before their turn comes round.
    const a = { ...this.content.character('warrior', 'a', 'fighters'), abilities: [],
      statuses: (statuses.a ?? []).map(id => ({ id, remaining: 3 })) };
    const a2 = { ...this.content.character('warrior', 'a2', 'fighters'), abilities: [] };
    // Wolves hardy enough to last until their turns come round.
    const b = { ...this.content.creature('wolf', 'b', 'goblins'), hp: 80, maxHp: 80,
      statuses: (statuses.b ?? []).map(id => ({ id, remaining: 3 })) };
    const b2 = { ...this.content.creature('wolf', 'b2', 'goblins'), hp: 80, maxHp: 80 };
    return new Battle({ id: 'turns', combatants: [a, a2, b, b2] as Fighter[], abilities: Content.abilities }, 'turns');
  }
  // Steps until the named creature is the one to act.
  static until(battle: Battle, id: string) {
    for (let i = 0; i < 20 && battle.state.actor !== id; i++) { battle.step(battle.chosen()); }
    expect(battle.state.actor).toBe(id);
  }
}

describe('turn structure', () => {
  it('lets a hasted creature act twice before its turn ends, and a slowed one still once', () => {
    const hasted = Fight.make({ a: ['haste'] });
    Fight.until(hasted, 'a');
    hasted.step(hasted.chosen());
    expect(hasted.state.actor).toBe('a');
    const slowed = Fight.make({ a: ['slow'] });
    Fight.until(slowed, 'a');
    slowed.step(slowed.chosen());
    expect(slowed.state.actor).not.toBe('a');
  });
  it('gives a confused creature one thing to do, fallen on at random, and says so', () => {
    const battle = Fight.make({ a: ['confused'] });
    Fight.until(battle, 'a');
    const [only, ...rest] = battle.legalCommands();
    expect(rest).toHaveLength(0);
    expect(battle.legalCommands()).toEqual([only!]);
    expect(battle.events.some(e => e.type === 'random' && e.actor === 'a')).toBe(true);
  });
  it('turns a charmed wolf on its own pack, and takes a charmed companion out of the company\'s command', () => {
    const wolf = Fight.make({ b: ['charmed'] });
    Fight.until(wolf, 'b');
    const bites = wolf.legalCommands().filter(c => c.ability === 'melee').map(c => c.target);
    expect(bites).toEqual(['b2']);
    const friend = Fight.make({ a: ['charmed'] });
    expect([friend.playerControls('a'), friend.playerControls('a2')]).toEqual([false, true]);
  });
  it('puts a dominated foe under the company\'s command, against its own side', () => {
    const battle = Fight.make({ b: ['dominated'] });
    expect([battle.playerControls('b'), battle.playerControls('b2')]).toEqual([true, false]);
    Fight.until(battle, 'b');
    expect(battle.legalCommands().filter(c => c.ability === 'melee').map(c => c.target)).toEqual(['b2']);
  });
});
