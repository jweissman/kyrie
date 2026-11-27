import { describe, expect, it } from 'bun:test';
import { ThreeClients } from './support/three-clients';
import { FocusParity } from '../scripts/focus-parity';

// The page, the terminal and the runner held to one another at every step (OR-1450; engine-focus.md §6): from one
// checkpoint, by the same commands (turning to someone, saying two things to them, taking leave, a wait), the three
// come to the same world and the same place at every step, outright. Whom each attends to, and the question's rows and
// their Atlas marks, are read against the page's: today's differences are the baseline, which only falls
// (`bun scripts/focus-parity.ts --write` after removing one, named in the commit); each step of engine-owned focus
// removes its own, and the last leaves none.
describe('the page, the terminal and the runner, step by step', () => {
  it('come to the same world and place at every step, and differ in nothing new', async () => {
    const { steps, worlds, apart } = await ThreeClients.walk();
    expect(steps).toBeGreaterThanOrEqual(5);
    for (const [i, line] of worlds.entries()) {
      const [page, terminal, runner] = line.split(' | ').map(s => s.replace(/^\w+ /, ''));
      expect({ i, terminal, runner }).toEqual({ i, terminal: page, runner: page });
    }
    const kept = FocusParity.kept();
    expect(apart.filter(d => !kept.includes(d))).toEqual([]);
    expect(kept.filter(d => !apart.includes(d))).toEqual([]);
  }, 300000);
});
