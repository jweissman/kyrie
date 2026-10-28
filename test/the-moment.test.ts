import { describe, expect, it } from 'bun:test';
import { Battle, createArena } from '../src/arena';
import type { Fighter, Moment, Scenario } from '../src/model';

// A fight that came at the company, seen as it began, gives it a moment: it acts first, and running then gets it
// back the way it came for certain (PT-10: a five-hit-point mage died before acting). Running at any other time is
// Orsino's even chance, and surer each time it is tried and fails (PT-24: flight failed again and again).
class Fights {
  static scenario(moment?: Moment, quick: Fighter['team'] = 'goblins'): Scenario {
    const s = createArena('moment');
    // One side quicker than the other, as a rule: in the moment, whoever saw the other first still goes first.
    s.combatants.forEach(f => {
      f.equipment = { ...f.equipment, modifiers: { initiative: f.team === quick ? 50 : 0 } };
    });
    return { ...s, ...moment ? { moment } : {} };
  }
  static run(b: Battle) { return b.legalCommands().find(c => c.ability === 'flee')!; }
}

describe('the moment before a fight closes', () => {
  it('lets the company act first, and get away for certain', () => {
    for (const seed of ['m1', 'm2', 'm3', 'm4', 'm5', 'm6']) {
      const b = new Battle(Fights.scenario('seen'), seed);
      expect(b.state.combatants.find(f => f.id === b.state.actor)?.team).toBe('fighters');
      expect([b.opening, b.flight()]).toEqual(['seen', 1]);
      b.step(Fights.run(b));
      expect(b.state.outcome).toBe('escaped');
    }
  });
  it('comes after the first blows of one sprung from hiding, and the company still gets away for certain', () => {
    for (const seed of ['s1', 's2', 's3', 's4']) {
      const b = new Battle(Fights.scenario('sprung', 'fighters'), seed);
      expect(b.state.combatants.find(f => f.id === b.state.actor)?.team).toBe('goblins');
      while (b.state.combatants.find(f => f.id === b.state.actor)?.team !== 'fighters') {
        b.step(b.legalCommands().find(c => c.ability === 'wait') ?? b.legalCommands()[0]!);
      }
      expect([b.opening, b.flight()]).toEqual(['sprung', 1]);
      b.step(Fights.run(b));
      expect(b.state.outcome).toBe('escaped');
    }
  });
  it('is not given in a fight the company chose, where running is an even chance, and surer each time', () => {
    const held: number[] = [];
    for (const seed of ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8']) {
      const b = new Battle(Fights.scenario(), seed);
      expect(b.opening).toBeUndefined();
      let tries = 0;
      while (!b.state.outcome) {
        const ours = b.state.combatants.find(f => f.id === b.state.actor)?.team === 'fighters';
        if (ours) { expect(b.flight()).toBe([0.5, 0.75, 1][Math.min(tries, 2)]!); tries++; }
        b.step(ours ? Fights.run(b) : b.legalCommands().find(c => c.ability === 'wait') ?? b.legalCommands()[0]!);
      }
      held.push(tries);
    }
    // Never more than three tries: the third is sure.
    expect(Math.max(...held)).toBeLessThanOrEqual(3);
  });
});
