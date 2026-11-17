import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A search that finds nothing says so (the boredom census, BO-03): a search of a room where nothing is put away had
// ended on "You search the cloth-hall with care, a little at a time." and no more, twenty minutes gone and nothing
// said of what came of them. Where something reads a search of the place, the search is told as before, and what it
// finds is told after it.
const hall = `
  Place town "the town" is settlement.
  Place hall "the cloth-hall" is room within town at 0, 0 indoors.
  Place store "the back store" is room within town at 1, 0 indoors.
  Passage door "the door" is door between hall and store.
  Company party "You" of 1 at hall.
  Entity tally: fact "A tally-stick is pushed into a crack behind the bales, notched for a debt nobody has paid.".
  Observe tally_found at store when searched(party, store) "Behind the bales, a tally-stick, notched for a debt." teaches tally.
  Goal false.`;
describe('a search', () => {
  it('says it found nothing where nothing is put away, and tells what it finds where something is', async () => {
    const t = await Tiny.start(hall);
    expect((await t.session.leg('search(party,t__hall)')).response).toBe(
      'You search the cloth-hall with care, a little at a time. Nothing is put away or hidden here.');
    await t.play('To the back store');
    const found = await t.session.leg('search(party,t__store)');
    expect(found.response).toBe('You search the back store with care, a little at a time.');
    expect(t.world.test({ kind: 'call', name: 'knows', args: ['party', 't__tally'] })).toBe(true);
  });
});
