import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// At the place the aim followed names, gold is on what brings about what the aim waits on, not on whatever has an act
// of its own there (M21's playability list, PL-05): a town's trouble set at the old place a debt was to be paid from,
// the cairn of offerings at Seolforfyrd, had taken the gold from the debt (and at Tenebraetumulo from the oxen), and
// mending it did nothing for either. The road the father went out by: ruts to follow, which a rule says lead to the
// cart (what the aim waits on), and a wayside cairn kicked over, which is someone else's story.
const road = `
  Place road "the old road" is wilderness at 0, 0.
  Place verge "the verge of the old road" is room within road at 0, 0 outdoors.
  Company party "You" of 1 at verge.
  Entity found_cart: fact "Your father's cart went off the road in the night.".
  Thing ruts "the fresh ruts" at verge {
    State fresh "Fresh ruts run off the edge of the road here.".
    State followed "The ruts go over the edge of the road and down the bank.".
    Change follow "Follow the ruts over the edge" from fresh to followed.
  }
  Rule ruts_followed when state(ruts, followed) and not knows(party, found_cart) says "Below the road a cart lies on its side in the ditch." teaches found_cart { }
  Thing cairn "the wayside cairn" at verge {
    State fallen "A cairn of stones lies kicked over at the roadside.".
    State mended "The cairn has been built up again.".
    Change mend "Build the cairn up again" from fallen to mended.
  }
  Objective father when not knows(party, found_cart) toward road "Your father went out by {road} with the cart.".
  Goal false.`;
const golden = (t: Tiny) => t.gold.map(a => a.label);

describe('gold at the place the aim names', () => {
  it('is on the act that brings about what the aim waits on, never on another story there', async () => {
    const t = await Tiny.start(road);
    t.follow('father');
    expect(golden(t)).toEqual([expect.stringMatching(/ruts/i)]);
    await t.play('Build the cairn up again');
    expect(golden(t)).toEqual([expect.stringMatching(/ruts/i)]);
  });
  // A debt to be paid from what the old place holds: nothing at the cairn pays it, and nothing there is gold.
  it('is not on another story at the place an aim short of coin is to be paid from', async () => {
    const t = await Tiny.start(road.replace(/Objective father[^\n]*/,
      'Objective debt when quantity(party, gold) < 50 toward verge "You owe fifty coin: what is at {verge} could pay it.".'));
    t.follow('debt');
    expect(golden(t)).toEqual([]);
  });
});
