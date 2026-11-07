import { describe, expect, it } from 'bun:test';
import { Pellam } from './support/pellam';

// Jennet Fosdyke, a mariner's wife at the head of Hay Stairs: she waits
// for a husband in the Tolleth packet, asks the company to carry a letter (a map-kind item, as Mother Jago's is) toward
// Captain Bascom, and reacts to a company that carries something from the rock the packet calls at.
describe('The Liberty of the Ice: the mariner\'s wife', () => {
  it('is met at the head of Hay Stairs, says what she waits for, and gives a letter for Captain Bascom at Tolleth, once', async () => {
    const g = await Pellam.start();
    await g.play('go:hay_stairs');
    expect(g.at('fosdyke')).toBe('pellam__hay_stairs');
    expect(g.j.holds('holding', 'party', 'map')).toBe(false);
    expect(g.j.offers('Ask Jennet Fosdyke whether she has a letter to go south')).toBe(false);
    await g.play('Ask Jennet Fosdyke what she is looking at');
    expect(g.page).toMatch(/Dorothea, Captain Bascom/);
    expect(g.knows('fosdyke_packet')).toBe(true);
    await g.play('Ask Jennet Fosdyke whether she has a letter to go south');
    expect(g.page).toMatch(/Captain Bascom will have it/);
    expect(g.j.holds('holding', 'party', 'map')).toBe(true);
    expect(g.j.offers('Ask Jennet Fosdyke whether she has a letter to go south')).toBe(false);
  }, 240000);

  it('says nothing of the rock to a company that has not been where the packet calls, and reads it from one that has', async () => {
    const g = await Pellam.start();
    await g.play('go:hay_stairs');
    expect(g.j.offers('Tell Jennet Fosdyke you have been to the rock')).toBe(false);
    g.j.give('pharos_rubbing');
    expect(g.j.offers('Tell Jennet Fosdyke you have been to the rock')).toBe(true);
    await g.play('Tell Jennet Fosdyke you have been to the rock');
    expect(g.page).toMatch(/Skerrow/);
    expect(g.holds('fosdykeEased', 'fosdyke')).toBe(true);
    await g.play('=+1');
    expect(g.page).toMatch(/Someone has written, with a finger in the snow/);
  }, 240000);

  it('hears a world event of the lens fitted to a ship, if the company has not already told her', async () => {
    const g = await Pellam.start();
    await g.play('go:hay_stairs');
    g.j.assert('befell', 'remainder_steadied');
    await g.play('=+1');
    expect(g.page).toMatch(/a lens went from a rock to a ship/);
  }, 240000);
});
