import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Atlas } from '../support/atlas';
import { Runner } from '../../src/cli/runner';

// What a headless client is offered is called by what it does (promise fidelity: the promise-fidelity walk, 14
// November). A look at a thing on a way opens onto its tries on the page; the runner, which the terminal's agents and
// the walkers play through, does the first of them. Offered as "To the old corn-store — look at the corn-store
// padlock", it pushed at it, and said nothing of a look.
describe('an opener the runner does by the act within it', () => {
  it('is called by that act', async () => {
    const t = await Tiny.start(Atlas.ground.replace('of 1 at green.', 'of 1 at yard.'));
    const offer = new Runner(t.session).said().offer, all = [...offer.primary, ...offer.rest];
    expect(all.find(o => o.id === 'push(t__lock)')?.label).toBe('Push and pull at the padlock');
    expect(all.filter(o => /look at the padlock/i.test(o.label))).toEqual([]);
  });
});
