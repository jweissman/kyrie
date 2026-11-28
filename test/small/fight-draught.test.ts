import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Runner, type Said } from '../../src/cli/runner';
import { RunnerFind } from '../support/runner-find';

// What the company carries to use up is offered in a fight, to the runner's players as on the page (cold play 3,
// CL-14: a warrior died in the vault with the priest's two healing draughts in her pack, never offered).
const cellar = `
  Place cellar "the cellar" is room at 0, 0.
  Person priest "the priest" at cellar { Role "a priest". Ancestry human. Peaceable. Pronouns she. }
  Topic gift with priest "Ask the priest for the bottles" when true once {
    Says "'For after,' she says.". On discuss { Give 2 minor_healing_potion to actor. } }
  Person foe "an owlbear" at cellar { Role "what is in the cellar". Species owlbear. }
  Company party "You" of 1 at cellar.`;
describe('a draught carried into a fight', () => {
  it('is offered to drink, as the page offers it', async () => {
    const t = await Tiny.start(cellar, { horizon: ['belongings', 'inhabitants'],
      party: [{ name: 'Wat', raceId: 'human', classId: 'warrior', level: 2 }] });
    const r = new Runner(t.session);
    let s = await RunnerFind.act(r, r.said(), /^(Ask the priest|Talk to the priest — ask) for the bottles/);
    s = await RunnerFind.act(r, s, /^Attack/);
    const all = (x: Said) => [...x.offer.primary, ...x.offer.rest].map(o => o.label);
    expect(s.moment).toBe('fight');
    expect(all(s)).toContain('Use a minor potion of healing on Wat');
  }, 60000);
});
