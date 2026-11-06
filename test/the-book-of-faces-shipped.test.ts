import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The campaign as shipped: a company of one, Wren the warrior. The calling-unique route (a thief feels the second lock) is
// not hers; the lone route is the bar. Played by labels, walking the passages; no j.give, no j.assert, no teleport.
const campaign = 'data/campaigns/the-book-of-faces.campaign.json';
const k = (id: string) => `ombra__${id}`;

describe('The Book of Faces as shipped (a lone warrior)', () => {
  it('cannot feel the lock, forces the case, breaks the mould, and is met cold by the Bursar', async () => {
    const j = await Journey.start(campaign, 'merrow');
    await j.play('>ombra__collegium_hall', 'Ask what the Collegium of Measures does', 'Pay the Bursar the three-coin fee', '>ombra__rv_landing', 'Show the Counterpoise the Bursar', '^To the assay cellar');
    expect(j.matches('feel under the pan').length).toBe(0);
    await j.play('Look the Pound.s case over');
    expect(j.page).toContain('you have not the eye for it');
    await j.play('Have Wren force the Pound.s case with a bar');
    expect(j.holds('carries', 'party', k('rv_page'))).toBe(true);
    expect(j.holds(k('rv_mould_broken'), 'party')).toBe(true);
    expect(j.page).toContain('a ruined note');
    // No thief, no cleric: no quarrel and no sides to take.
    expect(j.matches('keep the leaf for the rest').length).toBe(0);
    await j.play('>ombra__collegium_hall');
    expect(j.page).toContain('The Collegium has nothing to tell you');
    expect(j.matches('Ask about the eleven hooks').length).toBe(0);
    expect(j.matches('Tell the Bursar where the leaf is').length).toBe(0);
    // The leaf can still be shown: Hart will not take it.
    await j.play('>ombra__candid_room', 'Show Orsolya Hart the first leaf');
    expect(j.page).toContain('Do not give it to me');
    // The warrior hears the Stair, and only that.
    await j.play('>ombra__hill_foot');
    expect(j.page).toContain('Worn on the left');
  }, 600000);
});
