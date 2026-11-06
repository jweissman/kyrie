import { describe, expect, it } from 'bun:test';
import { Gaunt, phases } from './support/gaunt';

// The campaign as shipped (a lone bard, Wren): the cleric's reading of the first leaf is not hers, so she takes it down
// by ear from the clerks. Played by the labels a player sees, from the Penitent's Cross through Carth and the Row to
// the Penitentiary; no teleport, no assert, no give.
describe('A Winter in Carth as shipped (a lone bard)', () => {
  it('cannot read the rubric, takes it down by ear, and gives the woodmen the grant wrong: a year and a day', async () => {
    const g = await Gaunt.start();
    const p = phases('above');
    await g.play(...p.road, ...p.carth, ...p.row, 'Into the Penitentiary');
    expect(g.j.offers('read the first leaf of the Register')).toBe(false);
    expect(g.j.offers('Lay the nine lines of the first leaf before Dame Hawise')).toBe(false);
    await g.play('Have Wren sit with the clerks');
    expect(g.knows('first_leaf_ear')).toBe(true);
    expect(g.knows('first_leaf')).toBe(false);
    expect(g.page).toMatch(/It does not carry/);
    await g.play('>gaunt__wood_edge');
    expect(g.at('woodmen')).toBe('wood_edge');
    await g.play('Sing the Wood-reeve');
    expect(g.page).toMatch(/Ever, my father said/);
    expect(g.holds('grantYear', 'party')).toBe(true);
    expect(g.at('woodmen')).toBe('limbo');
    await g.until();
    expect(g.page).toMatch(/a stranger who sang it wrong/);
  }, 600000);
});
