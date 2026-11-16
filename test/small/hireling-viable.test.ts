import { describe, expect, it } from 'bun:test';
import { Gauntlet } from '../support/gauntlet';
import { DangerSense } from '../../src/presentation/danger-sense';

// The first-hour mage (the owner, 16 November: keep the danger and the class asymmetry; do not weaken foes by class;
// make a viable way in that the player can find and take): alone, a level-one mage loses to three rats and the
// forecast says so; with one hireling of any calling beside them it wins, and the forecast says that too. The danger is
// the world's; the way through it is a companion (a hire the opening's inn offers, within a starting purse: see the b2
// walk).
describe('a first-level mage against three rats', () => {
  const bout = (mates?: string[]) => ({ calling: 'mage', foe: 'rat', count: 3, ...mates ? { mates } : {} });
  it('is told the truth alone, and mostly loses', () => {
    expect(['grave', 'deadly']).toContain(DangerSense.of(Gauntlet.encounter(bout(), 'reckon')).danger);
    expect(Gauntlet.wins(bout(), 40)).toBeLessThan(0.5);
  });
  it('wins with a hireling of any calling, and is told it is no longer grave', () => {
    for (const mate of ['warrior', 'thief', 'cleric']) {
      expect(['slight', 'fair', 'hard']).toContain(DangerSense.of(Gauntlet.encounter(bout([mate]), 'reckon')).danger);
      expect([mate, Gauntlet.wins(bout([mate]), 40) >= 0.85]).toEqual([mate, true]);
    }
  });
});
