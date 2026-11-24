import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Atlas } from '../support/atlas';
import { Runner, type Said } from '../../src/cli/runner';
import { RunnerOffer } from '../../src/cli/runner-offer';

// What a headless client is offered is called by what it does (promise fidelity: the promise-fidelity walk, 14
// November). A look at a thing on a way opens onto its tries on the page; the runner had done the first of them,
// offered as "To the old corn-store — look at the corn-store padlock", pushing at it and saying nothing of a look.
// It had then listed the opener with its rows (TB-12: Doable). Now only a fight, a store and creation unfold (PB-29):
// each try at the padlock is a row of its own, offered by its own words and done by its own command, and none opens.
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
describe('a look at a thing on a way, laid out for the runner', () => {
  it('offers each try a row of its own, called by what it does', async () => {
    const t = await Tiny.start(Atlas.ground.replace('of 1 at green.', 'of 1 at yard.'));
    const r = new Runner(t.session), offer = r.said().offer;
    const all = [...offer.primary, ...offer.rest].flatMap(o => [o, ...o.opens ?? []]);
    expect(all.filter(o => o.opens?.some(k => RunnerOffer.act(k) === 'push(t__lock)'))).toEqual([]);
    const push = all.find(o => RunnerOffer.act(o) === 'push(t__lock)')!;
    expect(push.label).toBe('Push and pull at the padlock');
    const done = said(await r.ask(JSON.stringify({ act: push.id })));
    expect(done.moment).not.toBe('inspect');
  });
});
