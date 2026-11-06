import { describe, expect, it } from 'bun:test';
import { Pellam, home } from './support/pellam';

// The campaign as shipped (a lone bard, Tamsin): the office for the drowned is a cleric's. The bard's way is a wake-song at
// the black hole, for a price. Played by the labels a player sees; no put, no assert, no give.
describe('The Liberty of the Ice as shipped (a lone bard)', () => {
  it('learns of Davy from the widow at the hole, sings the wake-song, pays three coin, and the searchers still stop at her light', async () => {
    const g = await Pellam.start(home, 'lisk');
    await g.play('go:swan_lane', 'Shake on a penny a stair', 'go:freezeland', 'Ask her for your purse back', '=84', 'go:black_reach');
    expect(g.at('saffery')).toBe('pellam__black_reach');
    expect(g.j.offers('say the office for the drowned')).toBe(false);
    await g.play('Talk to Widow Saffery', 'Ask Widow Saffery why she walks the Reach at night');
    expect(g.knows('saffery_davy')).toBe(true);
    const gold = g.j.measure('quantity', 'party', 'gold');
    await g.play('sing a wake-song for Davy Saffery');
    expect(g.page).toMatch(/That is a wake-song/);
    expect(g.page).not.toMatch(/a second light comes up/);
    expect(g.j.measure('quantity', 'party', 'gold')).toBe(gold - 3);
    expect(g.holds('officeSung', 'lisk')).toBe(true);
    expect(g.holds('safferyAffronted', 'saffery')).toBe(true);
    await g.until(232);
    expect(g.holds('searchersDiverted', 'lisk')).toBe(true);
    await g.until(420);
    expect(g.page).toMatch(/the lantern-hook in her window is empty/);
  }, 600000);
});
