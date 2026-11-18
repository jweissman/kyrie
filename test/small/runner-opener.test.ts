import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Atlas } from '../support/atlas';
import { Runner, type Said } from '../../src/cli/runner';

// What a headless client is offered is called by what it does (promise fidelity: the promise-fidelity walk, 14
// November). A look at a thing on a way opens onto its tries on the page; the runner had done the first of them,
// offered as "To the old corn-store — look at the corn-store padlock", pushing at it and saying nothing of a look.
// Now it lists the opener with its rows (TB-12: Doable): taken, it opens, and each try is offered by its own words.
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
describe('an opener the runner lists with its rows', () => {
  it('does nothing of its own, its tries each called by what it does', async () => {
    const t = await Tiny.start(Atlas.ground.replace('of 1 at green.', 'of 1 at yard.'));
    const r = new Runner(t.session), offer = r.said().offer;
    const all = [...offer.primary, ...offer.rest].flatMap(o => [o, ...o.opens ?? []]);
    const opener = all.find(o => o.opens?.some(k => k.id === 'push(t__lock)'))!;
    expect(opener.id).not.toBe('push(t__lock)');
    expect(all.find(o => o.id === 'push(t__lock)')?.label).toBe('Push and pull at the padlock');
    // Taken, it opens: its rows, no time.
    const opened = said(await r.ask(JSON.stringify({ act: opener.id })));
    expect([opened.moment, opened.turn]).toEqual(['inspect', 0]);
    expect(opened.offer.primary.map(o => o.id)).toContain('push(t__lock)');
  });
});
