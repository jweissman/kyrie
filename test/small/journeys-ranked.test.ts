import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Itineraries } from '../../src/ui/itinerary';

// Journeys led with what the company pursues (TP-06: the a1 camp had offered 36 set-outs by distance alone): toward
// an aim held or followed first, though another told-of place is nearer; then the rest, nearest first.
const country = (aimed: boolean) => `
  Place town "Hythe" is settlement. Place green "the green" is room within town at 0, 0 outdoors.
  Place track "the track" is room at 1, 0 outdoors.
  Place near "the near barrow" is site. Place near_door "the barrow door" is room within near at 2, 1 outdoors.
  Place far "the far tower" is site. Place far_door "the tower foot" is room within far at 9, 0 outdoors.
  Passage p1 "the lane" is path between green and track.
  Passage p3 "a sheep-track" is path between track and near_door. Passage p4 "the old road" is path between track and far_door.
  Company party "You" of 1 at green.
  Entity near_told: fact "There is a barrow off the track.". Entity far_told: fact "A tower stands past the moor.".
  Initially Assert established(near_told). Initially Assert established(far_told).
  Initially Assert leadsTo(near_told, near). Initially Assert knows(party, near_told).
  Initially Assert leadsTo(far_told, far). Initially Assert knows(party, far_told).
  ${aimed ? 'Objective tower when not at(party, far_door) toward far "Go to the far tower.".' : ''}`;
describe('journeys', () => {
  it('lead with the aim, though another is nearer, and are otherwise nearest first', async () => {
    const order = async (aimed: boolean) => {
      const t = await Tiny.start(country(aimed));
      return Itineraries.destinations(t.campaign).map(d => d.name);
    };
    expect(await order(false)).toEqual(['the near barrow', 'the far tower']);
    expect(await order(true)).toEqual(['the far tower', 'the near barrow']);
  });
});
