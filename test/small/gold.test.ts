import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// Gold is the next step of the one aim the player chose to follow, and nothing else (the owner, 12 November; M20's
// rounds 9–11, "gold everywhere and meaning nothing"): none before Follow this, one act once followed, the other aim's
// way never gold, following the other moves it, letting go takes it away. The rule on an inn-yard with a way to each
// aim's place; test/gold-follow.test.ts keeps the same on a generated country's own errand and notices.
// Gold goes only by ways the company knows (Glance.toward): a place two unseen ways off is not pointed at.
const world = `
  Place reedham "Reedham" is settlement.
  Place yard "the inn-yard" is room within reedham at 0, 0 outdoors.
  Place lane "the lane" is room within reedham at 1, 0 outdoors.
  Place bridge "the bridge over the Reed" is room within reedham at 0, 1 outdoors.
  Passage yard_lane "the gate" is path between yard and lane.
  Passage yard_bridge "the bridge road" is path between yard and bridge.
  Place barrow "Lacrimerecs" is site at 2, 0.
  Place mouth "a door of stone in a long mound" is room within barrow at 0, 0 outdoors.
  Passage yard_mouth "the fen track" is path between yard and mouth.
  Company party "You" of 1 at yard.
  Objective father when true "Your father went out by {bridge} with the cart.".
  Objective crown when true "Bring the crown of the first king out from under {barrow}.".
  Goal false.`;
const ways = (t: Tiny) => t.gold.map(a => a.label);

describe('gold, by Follow this', () => {
  it('is on one act of the aim followed, only once one is followed, and moves with the choice', async () => {
    const t = await Tiny.start(world);
    expect(ways(t)).toEqual([]);
    expect(ways(t.follow('father'))).toEqual([expect.stringMatching(/bridge/i)]);
    expect(ways(t.follow('crown'))).toEqual([expect.stringMatching(/Lacrimerecs|mound|fen/i)]);
    expect(ways(t.follow())).toEqual([]);
  });
  // From a step aside, the walk about the town to the aim's place (travel:…), and taken, the company is there.
  it('leads on from a step aside to the aim\'s place, and the other aim\'s way is never gold', async () => {
    const t = await Tiny.start(world);
    await t.follow('father').play('To the lane');
    expect(t.where()).toBe('t__lane');
    expect(ways(t)).toEqual([expect.stringMatching(/bridge/i)]);
    expect(ways(t)).not.toContainEqual(expect.stringMatching(/Lacrimerecs|mound|fen/i));
    await t.perform(t.gold[0]!.command!);
    expect(t.where()).toBe('t__bridge');
  });
});
