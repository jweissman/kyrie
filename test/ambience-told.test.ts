import { describe, expect, it } from 'bun:test';
import { Tiny } from './support/tiny';

// Ambience, a place's passing life, told the first time each line of it is seen (GR-26: the second stage of what is
// afoot in a town, holding on its green on day 3, had gone untold because the green was known, where the same line as
// a sign was told). The barn going up in a town (data/generation/town/afoot.kyrt's barn), its second stage written as
// ambience, as Wrackham's day-3 stage: not told on day 1, told when the company comes back to the green on day 3, and
// not told again on the next return, as seen; a sign beside it is told each time, as before.
const town = `
  Place town "the town" is settlement at 0, 0.
  Place green "the green" is room within town at 0, 0 outdoors.
  Place lane "the lane" is room within town at 1, 0 outdoors.
  Passage lane_end "the lane's end" is path between green and lane taking 5 minutes.
  Company party "You" of 1 at green.
  Observe green_scene at green as fixture when true "A green with a well, and lanes going off it. Geese graze the far side of it. A cart stands by the smithy with its shafts up. Smoke goes straight up from every chimney.".
  Observe barn_two at green as ambience when watch(clock) >= 288 and watch(clock) < 576 "Three men on the new barn's frame are pegging rafters, a pair of hands short for the last truss.".
  Observe pump_sign at green as sign when watch(clock) >= 288 "Someone has chalked a mark on the pump.".
  Goal false.`;
// What the page tells of the place: at a glance (its sight, its life, what changed, the scene's told paragraphs), and
// on a deliberate look (what the scene's budget holds).
const told = (t: Tiny) => JSON.stringify({ glance: [t.glance.sight, t.glance.life, t.glance.changed],
  told: [t.leaf.glanced?.situation, t.leaf.glanced?.presence] });
const looked = (t: Tiny) => JSON.stringify([told(t), t.leaf.glanced?.held]);
describe("a town's passing life", () => {
  it('is told the first time a line of it holds, in a place already known, and not again once seen', async () => {
    const t = await Tiny.start(town);
    // Day 1 on the green, a while there (the green known, seen as an act sees it); then away, and back on day 3.
    await t.play('Wait a while');
    expect(looked(t)).not.toContain('pegging rafters');
    await t.play('To the lane', '=day 3 09:00', 'To the green');
    // New on the green, the barn is what changed there: told at a glance, as the sign is.
    expect(told(t)).toContain('pegging rafters');
    expect(told(t)).toContain('chalked a mark on the pump');
    await t.play('To the lane', 'To the green');
    // Seen, it is the green's passing life again: not told again at a glance; the sign still is.
    expect(told(t)).not.toContain('pegging rafters');
    expect(told(t)).toContain('chalked a mark on the pump');
  }, 60000);
});
