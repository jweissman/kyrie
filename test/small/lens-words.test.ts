import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Doable } from '../../src/presentation/doable';

// Every row a lens offers says what it is (OR-689, cold play 1 of 25 November): the places lens at Reedmere had
// labelled its journeys by their ids, "travel:region__s1_wood_edge" and "travel:region__s1_taproom", since a journey
// the map holds is no choice of the scene's menu, and Doable made its row with the id for words. It takes the lens's
// own words now, for every client (the runner, the terminal, the page). A town of three rooms off its green, the
// company come back to the green from the far end.
const town = `
  Place town "the town" is settlement at 0, 0.
  Place green "the green" is room within town at 1, 1 outdoors.
  Place inn "the inn" is room within town at 1, 0.
  Place lane "the lane" is room within town at 2, 1 outdoors.
  Place mill "the mill" is room within town at 3, 1.
  Passage inn_door "the inn's door" is door between inn and green.
  Passage lane_end "the lane's end" is path between green and lane.
  Passage mill_door "the mill's door" is door between lane and mill.
  Company party "You" of 1 at mill.
  Goal false.`;

describe('a lens\'s rows', () => {
  it('are each said in words, a journey the map holds among them', async () => {
    const t = await Tiny.start(town);
    await t.play('To the lane', 'To the green', 'To the inn', 'To the green');
    const places = t.glance.lenses.places, acts = [...places.promoted, ...places.rest];
    expect(acts.some(a => a.choice.startsWith('travel:'))).toBe(true);
    const rows = acts.map(a => Doable.one(t.glance, t.screen, a.choice, a.command));
    expect(rows.filter(r => r.label === r.id || /^\w+:\S+$/.test(r.label)).map(r => r.label)).toEqual([]);
  });
});
