import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A person's own deed beside their talk has a reason to be led with, as any of the place's own acts has (ST-03, CL-31:
// Affordances had read only the talk's replies, and an act someone speaks that is not a Topic, standing beside the
// talk, had no candidate at all: Ifan's boat let through the sea-gate was had only under `all`). One for each person
// still: their talk or their deed, not both, where someone else is here too.
const verge = `
  Place vale "the vale" is settlement.
  Place verge "the verge" is room within vale at 0, 0 outdoors.
  Company party "You" of 1 at verge.
  Relation helped(group).
  Person carter "the wagoner" at verge { Role "a wagoner with a wheel in the ditch". Ancestry human. Peaceable. Pronouns he. }
  Person drover "Owain" at verge { Role "a drover". Ancestry human. Peaceable. Pronouns he. }
  Entity mill_burned: fact "The mill at the ford burned in the spring.".
  Action lend_hand(actor: group, site: place) "Put your shoulder to the wagoner's wheel" {
    Speaker carter.
    Requires able(actor) and company(actor) and at(actor, site) and at(carter, site) and not helped(actor).
    Time 3.
    On success { Assert helped(actor). }
    Result "The cart comes up out of the ditch.".
  }
  Topic ask_mill with carter "Ask the wagoner about the mill" when true once {
    Says "'Burned in the spring,' he says.".
    On discuss { Assert knows(actor, mill_burned). }
  }
  Entity road_wet: fact "The road west is under water at the rhyne.".
  Topic ask_road with drover "Ask Owain about the road" when true once {
    Says "'Wet at the rhyne,' he says.".
    On discuss { Assert knows(actor, road_wet). }
  }
  Objective wheel when not helped(party) "The wagoner's wheel is in the ditch.".
  Goal false.`;
describe('a person\'s own deed', () => {
  it('is led with for its own sake, one row for the person', async () => {
    const t = await Tiny.start(verge);
    const deed = t.glance.acts.find(a => a.command === 't__lend_hand');
    expect(deed?.why).toBe('own');
    expect(deed?.subject).toBe('t__carter');
    expect(t.glance.acts.filter(a => a.subject === 't__carter')).toHaveLength(1);
  });
  // The aim waiting on it, the talk is led for it already: once in the four, not the talk and the deed both (cold play
  // 7, T25: Holgar's charcoal).
  it('is led once where the aim waits on it', async () => {
    const t = await Tiny.start(verge);
    t.follow('wheel');
    const led = t.glance.offer!.primary.filter(o => o.command === 't__lend_hand' || o.for === 't__lend_hand');
    expect(led).toHaveLength(1);
  });
  it('is not led with once done', async () => {
    const t = await Tiny.start(verge);
    await t.perform('t__lend_hand');
    expect(t.glance.acts.some(a => a.command === 't__lend_hand')).toBe(false);
  });
});
