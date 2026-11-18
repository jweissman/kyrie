import { describe, expect, it } from 'bun:test';
import { Atlas } from '../support/atlas';
import { Runner } from '../../src/cli/runner';

// Each turn of a fight chosen through the runner is a turn of its own: the turn number had stood still through a whole
// fight, every fight turn and the outcome after it said as the turn the fight began on (cold play 2, CL-11).
describe('a fight\'s turns through the runner', () => {
  it('counts each turn chosen in the fight, and the outcome after it', async () => {
    const r = new Runner((await Atlas.start('danger', 'green')).session), turns: number[] = [];
    let out = await r.ask(JSON.stringify({ act: 'attack(t__rats)' }));
    while (!('error' in out)) {
      turns.push(out.turn);
      if (out.moment !== 'fight') { break; }
      out = await r.ask(JSON.stringify({ act: out.offer.primary[0]!.id }));
    }
    expect(turns.length).toBeGreaterThan(2);
    expect(turns).toEqual(turns.map((_, i) => turns[0]! + i));
  });
});
