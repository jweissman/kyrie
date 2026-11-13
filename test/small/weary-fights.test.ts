import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlaySession } from '../../src/session/play-session';
import { ModuleWriter } from '../../src/lang/module-writer';

// What a fight is fought under (a company's weariness) is the fight's, and goes with it (Battle.held): before, a weary
// fight wrote the weariness onto whoever fought, for good, and the next weary fight added it again: "Invalid creature
// conditions" (the owner, attacking in a cave gallery; What Tessary Owes's E3). A weary company fights in one gallery,
// goes on into the next, and fights again; and the game is the same kept and opened, and played again from its
// commands. Two galleries with a wolf in each; test/weary-fights.test.ts keeps the same in wren's workings.
const galleries = `
  Place fell "the fellside" is room at 0, 0 outdoors.
  Place first "the first gallery" is room at 1, 0 underground.
  Place second "the second gallery" is room at 2, 0 underground.
  Passage mouth "the adit mouth" is path between fell and first.
  Passage crossing "the crossing" is path between first and second.
  Company party "You" of 1 at fell.
  Person w1 "a grey wolf" at first { Role "a wolf that lairs in the adit". Species wolf. }
  Person w2 "a lean wolf" at second { Role "a wolf further in". Species wolf. }
  Goal false.`;
const weary = (s: PlaySession) => {
  const r = s.campaign.readout;
  return r.creatures.filter(c => r.partyIds.includes(c.id)).flatMap(c => c.state.conditions.map(x => x.id))
    .filter(id => id === 'weary');
};
const attack = (t: Tiny) => t.journey.choices().find(c => /^attack\(/.test(c.command))!.command;

describe('a weary company\'s fights, in two galleries', () => {
  it('fights in one, walks on into the next, and fights again, kept and replayed alike', async () => {
    const t = await Tiny.start(galleries);
    for (const wait of ['wait_for_dark', 'wait_watch']) { await t.perform(wait); }
    expect(t.world.test(ModuleWriter.call('weary', 'party'))).toBe(true);
    await t.perform('go(t__mouth,t__first)');
    await t.perform(attack(t));
    expect(weary(t.session)).toEqual([]);
    await t.perform('light_item(t__party_1__torch)');
    await t.perform('go(t__crossing,t__second)');
    const second = await t.session.leg(attack(t));
    expect(second.combat.some(e => e.type === 'end')).toBe(true);
    expect(weary(t.session)).toEqual([]);
    expect(PlaySession.resume(t.session.checkpoint()).canonical()).toBe(t.session.canonical());
    const replay = await Tiny.start(galleries);
    await replay.session.replay(t.session.transcript.steps);
    expect(replay.session.canonical()).toBe(t.session.canonical());
  });
});
