import { describe, expect, it } from 'bun:test';
import { Journey } from '../../src/session/journey';
import { Digest } from '../../src/session/digest';
import { Tiny } from '../support/tiny';

// A copy of a game played on beside it (PlaySession.copy: a what-if, as a spec turns to someone to see what the page
// then draws) is its own: what is done in the copy is not done in the game it was copied from, and the game goes on
// as if no copy had been made, to the same world as one never copied.
const kyr = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place barn "the barn" is room at 1, 0.
  Passage door "the barn door" is door between yard and barn.
  Person ada "Ada" at yard { Role "a carter". Ancestry human. Peaceable. Pronouns she. }
  Topic ada_road with ada "Ask Ada about the road" when true once { Says "'Muddy,' says Ada.".
    On discuss { Assert knows(actor, road_told). } }
  Discovery road_told "The road is muddy.".
  Company party "You" of 1 at yard.`;

describe('a copy of a game', () => {
  it('is played on without changing the game, which goes on to the same world as one never copied', async () => {
    const a = (await Tiny.start(kyr, { seed: 'copy' })).journey, b = (await Tiny.start(kyr, { seed: 'copy' })).journey;
    const before = Digest.of(a.campaign), copy = Journey.of(a.session.copy());
    await copy.play('Ask Ada about the road', 'To the barn');
    expect(copy.at('party')).toBe('t__barn');
    expect(copy.holds('knows', 'party', 'road_told')).toBe(true);
    expect(Digest.of(a.campaign)).toBe(before);
    expect(a.at('party')).toBe('t__yard');
    expect(a.holds('knows', 'party', 'road_told')).toBe(false);
    expect(a.campaign.history.length).toBeLessThan(copy.campaign.history.length);
    await a.play('Ask Ada about the road', 'Wait a while');
    await b.play('Ask Ada about the road', 'Wait a while');
    expect(Digest.of(a.campaign)).toBe(Digest.of(b.campaign));
  });
});
