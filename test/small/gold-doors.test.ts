import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// At the place an aim is about, a door off it is not the aim's for being a door not yet gone through (M21's
// playability list, PL-12): at Gothgiba's bailey, where the fevered child is, the gold had gone through every door on
// the green in turn, the general store, the chandlery and back, and none had herbs. An aim gone to by a place on the
// way to what it is about is another matter: the stair down from the churchyard to the crypt the dead are in is its
// way on (`toward … by …`, AimRoute.onward).
const green = `
  Place hythe "Hythe" is settlement.
  Place green "the green at Hythe" is room within hythe at 0, 0 outdoors.
  Place store "the general store" is room within hythe at 1, 0 indoors.
  Place forge "the forge" is room within hythe at 0, 1 indoors.
  Place yard "the churchyard" is room within hythe at 1, 1 outdoors.
  Place crypt "the crypt" is room within hythe at 1, 2 underground 1 down.
  Passage store_door "the store's door" is door between green and store.
  Passage forge_door "the forge door" is door between green and forge.
  Passage gate "the lych-gate" is gate between green and yard.
  Passage stair "the crypt stair" is stair between yard and crypt.
  Company party "You" of 1 at green.
  Person dead "the restless dead" at crypt { Role "the dead, up out of their graves". Species zombie. }
  Objective fever when true "A child on {green} has a fever, and needs herbs.".
  Objective crypt when true toward dead by yard "Lay the dead under {yard}.".
  Goal false.`;
const gold = (t: Tiny) => t.gold.map(a => a.label);

describe('gold at the place an aim is about', () => {
  it('is on no door off it for being a door not yet taken', async () => {
    const t = await Tiny.start(green);
    t.follow('fever');
    expect(gold(t)).toEqual([]);
  });
  it('is on the way on from the place an aim is gone to by', async () => {
    const t = await Tiny.start(green);
    await t.follow('crypt').play('To the churchyard');
    expect(t.where()).toBe('t__yard');
    expect(gold(t)).toEqual([expect.stringMatching(/crypt/)]);
  });
});
