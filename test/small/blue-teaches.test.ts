import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// Blue promises something to learn, and the act it is drawn for teaches the company something it did not make so
// itself (the owner, 12 November: "a blue pip with no blue reply"; M21's playability list, PL-03). The road's meetings
// keep what the company did as a thing it knows (`Assert wayIn(cart_bargained). Assert knows(actor, cart_bargained)`),
// and that had drawn the wagoner's "Offer him a hand" blue in every origin's opening: a sack and a coin, and nothing
// learned. A verge with a wagoner: a deed to be done for him, and a question that teaches.
const verge = `
  Place vale "the vale" is settlement.
  Place verge "the verge" is room within vale at 0, 0 outdoors.
  Company party "You" of 1 at verge.
  Relation wayIn(entity).
  Person carter "the wagoner" at verge { Role "a wagoner with a wheel in the ditch". Ancestry human. Peaceable. Pronouns he. }
  Entity hand_given: fact "On the road you got a wagoner out of the ditch for a coin.".
  Entity mill_burned: fact "The mill at the ford burned in the spring, and nobody knows who lit it.".
  Action lend_hand(actor: group, site: place) "Offer the wagoner a hand, for a coin" {
    Speaker carter.
    Requires able(actor) and company(actor) and at(actor, site) and at(carter, site) and not wayIn(hand_given).
    Time 3.
    On success { Assert wayIn(hand_given). Assert knows(actor, hand_given). Increase quantity(actor, gold) by 1. }
    Result "'A coin, then,' says the wagoner, and the cart comes up out of the ditch.".
  }
  Topic ask_mill with carter "Ask the wagoner about the mill" when true once {
    Says "'Burned in the spring,' he says. 'Nobody knows who lit it.'".
    On discuss { Assert knows(actor, mill_burned). }
  }
  Observe verge_scene at verge when true "A cart stands canted in the ditch, the wagoner's shoulder to the wheel.".
  Goal false.`;

describe('blue on someone, beside a deed done for them', () => {
  it('is for the question that teaches, and that question teaches', async () => {
    const t = await Tiny.start(verge);
    const talk = t.glance.acts.find(a => a.subject === 't__carter')!;
    expect(talk.aspects).toContain('knowledge');
    expect(talk.inside!.filter(i => i.aspects.includes('knowledge')).map(i => i.command)).toEqual(['t__ask_mill']);
    await t.perform('t__ask_mill');
    expect(t.world.test({ kind: 'call', name: 'knows', args: [t.campaign.playerActor!, 't__mill_burned'] })).toBe(true);
  });
  it('is gone once the question is asked: the hand is a deed, not something to learn', async () => {
    const t = await Tiny.start(verge);
    await t.perform('t__ask_mill');
    const talk = t.look().glance.acts.find(a => a.subject === 't__carter');
    expect(talk?.aspects ?? []).not.toContain('knowledge');
    expect((talk?.inside ?? []).filter(i => i.aspects.includes('knowledge'))).toEqual([]);
  });
});
