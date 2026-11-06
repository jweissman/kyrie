import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Quiet in the Sky, revised against doc/imbar/14-bible.md (see doc/imbar/adventures/the-quiet-in-the-sky.md): a
// company of five, what each calling sees (data/adventures/quiet-in-the-sky/fellowship.kyr), the ranger's word with the
// bear, and a grave that a warrior and a cleric disagree about.
const five = 'test/fixtures/quiet-in-the-sky/revised.campaign.json';
const k = (id: string) => `larum__${id}`;
const coats = ['?Buy a sheepskin coat', '?Buy a sheepskin coat', '?Buy a sheepskin coat', '?Buy a sheepskin coat', '?Buy a sheepskin coat'];
describe('The Quiet in the Sky: the Account, kept', () => {
  it('Larum: the hollows a smith made, the passing bell, the ballad with a patch in its middle, the eleven notches and a blank', async () => {
    const j = await Journey.start(five, 'q1');
    await j.play('^To Larum street', 'Into the Hark');
    expect(j.page).toMatch(/Somebody put a middle in a ballad/);
    await j.play('Out to Larum street', 'Into Larum chapel');
    expect(j.page).toMatch(/That is a passing bell/);
    expect(j.page).toMatch(/HUME CART, NINE/);
    expect(j.page).toMatch(/left foot forward/);
    expect(j.holds('knows', 'party', k('bell_is_passing'))).toBe(true);
    await j.play('Out to Larum street', "Into the guide's house");
    expect(j.page).toMatch(/eleven notches in a row/);
    await j.play('Out to Larum street');
    expect(j.page).toMatch(/Sixways/);
  }, 300000);

  it('the ranger answers the bear in the bear\'s own voice, with no meat and no climb; a company without one has neither', async () => {
    const j = await Journey.start(five, 'q1');
    await j.play('^To Larum street', "Into the guide's house", ...coats, 'Pay Jory Whitlock six coin', '>larum__ice_stair');
    expect(j.page).toMatch(/It has been on duty for nine hundred years/);
    expect(j.matches('speak to the bear').length).toBe(1);
    await j.play('speak to the bear');
    expect(j.holds('tolerates', k('bear'), 'party')).toBe(true);
    // A lone cleric, for contrast, is given no such choice.
    const c = await Journey.start('test/fixtures/quiet-in-the-sky/cleric.campaign.json', 'q1');
    await c.play('^To Larum street', "Into the guide's house", '?Buy a sheepskin coat', 'Pay Jory Whitlock six coin', '>larum__ice_stair');
    expect(c.matches('speak to the bear').length).toBe(0);
  }, 300000);

  it('Trophy Row has no locks and the watch has forgotten what it watches for; the grave is chosen by siding with the warrior, and the cleric says the office anyway', async () => {
    const j = await Journey.start(five, 'q2');
    await j.play('^To Larum street', 'Into the Hark', 'Ask Bet Garside about the chapel bell', 'Out to Larum street', "Into the guide's house", ...coats, 'Pay Jory Whitlock six coin', '>larum__halt_cross');
    expect(j.page).toMatch(/There isn.t a lock/);
    await j.play('>larum__the_ring');
    expect(j.page).toMatch(/Forty days/);
    await j.play('Talk to Torold', 'Ask Torold Hame who lies', '=18:10', 'Ask Torold Hame why he wants', 'Ask Torold Hame what Halvard was', '^Take your leave');
    // The grave in the ice is the Sitters' to tell: past the bear, and Aulus's board.
    await j.play('>larum__ice_stair', 'speak to the bear', '?Search the back of the ice shelf', '?Search the back of the ice shelf', '?Search the back of the ice shelf', '>larum__sitters_cave', 'Talk to Aulus', '^Take your leave');
    for (let i = 0; i < 4 && !j.holds('knows', 'party', k('ice_burial')); i++) { await j.play('Play Aulus a game'); }
    expect(j.holds('knows', 'party', k('ice_burial'))).toBe(true);
    await j.play('>larum__the_ring', 'Talk to Torold', 'Offer to help Torold Hame bury', '^Take your leave');
    expect(j.page).toMatch(/a bell down there that rings three and three/);
    expect(j.matches('Tell Dori that Bran is right').length).toBe(1);
    expect(j.matches('Tell Bran that Dori is right').length).toBe(1);
    await j.play('Tell Dori that Bran is right');
    expect(j.holds('larum__sidedUp', 'party')).toBe(true);
    expect(j.holds('larum__iceChosen', k('torold'))).toBe(true);
    expect(j.matches('Tell Bran that Dori is right').length).toBe(0);
    await j.play('Carry Halvard Eld to the Old Ice');
    expect(j.holds('larum__buriedIce', k('torold'))).toBe(true);
    expect(j.page).toMatch(/said the lowland office over a man of the Field/);
  }, 600000);
});
