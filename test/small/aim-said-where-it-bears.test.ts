import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// The aim followed is said on coming somewhere new only where it bears on that place (the terminal line's second
// play: "Following: …" had been said again at a landing, a taproom, a keep and its gate-passage, one after another).
const country = `
  Place town "Hythe" is settlement. Place green "the green" is room within town at 0, 0 outdoors.
  Place track "the track" is room at 1, 0 outdoors.
  Place far "the far tower" is site. Place far_door "the tower foot" is room within far at 2, 0 outdoors.
  Passage p1 "the lane" is path between green and track. Passage p2 "the old road" is path between track and far_door.
  Company party "You" of 1 at green.
  Entity hoard_found: fact "The tower's hoard is under its floor.". Initially Assert established(hoard_found).
  Objective tower when not knows(party, hoard_found) toward far "Find what is hidden in the far tower.".`;
describe('the aim followed', () => {
  it('is not said again on coming to a place it has nothing to do with, and is said at the place it names', async () => {
    const t = (await Tiny.start(country)).follow('tower');
    const go = (to: RegExp) => t.perform(t.journey.choices().find(c => to.test(c.full))!.command);
    await go(/To the track/);
    expect(t.glance.arrival).toBe('first');
    expect(t.glance.aim).toBeUndefined();
    await go(/Into the far tower/);
    expect(t.glance.aim).toMatch(/far tower/);
  });
});
