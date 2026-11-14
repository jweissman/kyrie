import { describe, expect, it } from 'bun:test';
import { PromiseFidelity } from '../scripts/promise-fidelity';

// Promise fidelity over authored content (the owner, 15 November: experiential pins by family): a curious walk of
// thirty turns through the laboratory (scripts/laboratory.ts, the first town and its undertown), every facet the
// glance draws on every turn done in a copy of the world. None may be drawn for what its act does not bring; a check
// is judged apart, its promise its success's. Its finds before it was kept: an opener done by its first act under its
// own words (PF-02), ways back out of the undertown drawn worth a look for an aim not followed (PF-03), a held topic
// that taught nothing.
describe('the laboratory\'s promises', () => {
  it('are kept, every facet drawn on a thirty-turn walk', async () => {
    const { tally, broken } = await PromiseFidelity.walk('laboratory', 30);
    expect(Object.values(tally).reduce((n, t) => n + t.drawn, 0)).toBeGreaterThan(20);
    expect(broken.filter(b => !b.includes('(chance)'))).toEqual([]);
  }, 120000);
});
