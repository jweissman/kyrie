import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';

// What someone else is seen to do is told in its author's words, or not at all (NP-13, UNT-108): an act with no Seen of
// its own had gone into the story under its label, the player's imperative after whoever did it ("The raiding party:
// Fall on You"). The shared rules' assail now says it; an author's act that says nothing leaves its doing to the scene.
const yard = (pursuit: string) => `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Relation marked(place).
  Action mark(actor: group, site: place) "Chalk a sign on {site}" {
    Requires able(actor) and at(actor, site) and not marked(site).
    On success { Assert marked(site). }
  }
  Person raiders "the raiding party" at yard {
    Role "raiders". Ancestry goblin. Calling thief. Level 1. Numbers 3. Uses go, assail, mark. Plans 6 steps. }
  ${pursuit}
  Goal false.`;
const told = (t: Tiny) => PlayerView.chronicle(t.campaign).filter(e => e.kind === 'npc').map(e => e.text);

describe('what others are seen to do', () => {
  it('is told in the words of the act: the raiding party closes to attack, not "Fall on You"', async () => {
    const t = await Tiny.start(yard('Pursuit hunt for raiders "hunting" priority 10 when true seeks assails(raiders, party) using assail.'));
    await t.perform('wait(party)');
    expect(t.campaign.events[0]!.npc?.map(n => n.action)).toEqual(['assail(t__raiders,party,t__yard)']);
    expect(told(t)).toEqual(['The raiding party closes to attack.']);
  });
  it('is not told by its label where its author gave it no words', async () => {
    const t = await Tiny.start(yard('Pursuit sign for raiders "marking" priority 10 when true seeks marked(yard) using mark.'));
    await t.perform('wait(party)');
    expect(t.campaign.events[0]!.npc?.map(n => n.action)).toEqual(['t__mark(t__raiders,t__yard)']);
    expect(told(t)).toEqual([]);
  });
});
