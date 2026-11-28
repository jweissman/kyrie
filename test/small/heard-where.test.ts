import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { CampaignLint } from '../../src/cli/campaign-lint';
import { AuthorLint } from '../../src/cli/author-lint';

// What a rule says is heard where it happens (NP-02, M19-229: a parade seen and a conversation overheard from
// indoors): its words at the street, or near the drummer in it, are told to a company in the street and not to one in
// the taproom off it, and nothing at the mill to either. A rule with no anchor is heard anywhere; one that waits on
// someone being in a room and asks nothing of the company is advice in kyrie lint (UNT-216).
const town = (at: string) => `
  Place town "Hythe" is settlement.
  Place street "the high street" is room within town at 0, 0 outdoors.
  Place inn "the taproom" is room within town at 1, 0 indoors.
  Place mill "the mill" is room within town at 5, 5 indoors.
  Passage door "the inn door" is door between street and inn.
  Passage lane "the mill lane" is path between street and mill.
  Company party "You" of 1 at ${at}.
  Person drummer "the drummer" at street { Role "a drummer". }
  Thing bell "the hand-bell" at ${at} {
    State still "A hand-bell.".
    State rung "The hand-bell, rung.".
    Change ring "Ring the hand-bell" from still to rung.
  }
  Rule parade at street when state(bell, rung) says "A parade goes by in the street." { }
  Rule drums near drummer when state(bell, rung) says "The drummer beats a long roll." { }
  Rule wheel at mill when state(bell, rung) says "The mill-wheel stops." { }
  Rule judged when state(bell, rung) and at(drummer, street) says "The drummer is judged the best in Hythe." { }
  Goal false.`;
const heard = async (at: string) => {
  const t = await Tiny.start(town(at), { horizon: ['probing', 'inhabitants'] });
  await t.perform('change_thing(t__bell_ring)');
  const said = JSON.stringify(t.leaf);
  return { t, heard: ['parade goes', 'long roll', 'mill-wheel', 'judged'].filter(w => said.includes(w)) };
};

describe('what a rule says', () => {
  it('is heard where it happens, not indoors off it nor afar', async () => {
    expect((await heard('street')).heard).toEqual(['parade goes', 'long roll', 'judged']);
    expect((await heard('inn')).heard).toEqual(['judged']);
  });
  it('with no anchor, waiting on someone in a room, is advice to anchor it', async () => {
    const lint = new CampaignLint('tiny', (await heard('inn')).t.session);
    AuthorLint.unheard(lint);
    expect(lint.findings.map(f => `${f.level} ${f.check} ${f.message.split(' says')[0]}`))
      .toEqual(['advice unheard t__judged']);
  });
});
