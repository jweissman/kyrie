import { describe, expect, it } from 'bun:test';
import { Tiny } from './support/tiny';
import { Undertakings } from '../src/presentation/undertakings';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { PlayerView } from '../src/presentation/player-view';

// An aim set aside for another is followed again when that one is done (OR-179, undertaking continuity): the warrior's
// walk let Bran out, his sale followed, then chose the cold boat at the pans, and once it was fetched nothing was
// followed while the sale still waited. The player's own choice resumed, never one they had not made: the rumours
// heard as the boat is fetched (two, so neither is its one next part) are not followed for them.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Relation sold(group). Relation fetched(group). Relation heard(group).
  Objective sale when not sold(party) "Help with the sale.".
  Objective boat when not fetched(party) "Fetch the boat.".
  Objective rumour_mill when heard(party) "Look into the rumour at the mill.".
  Objective rumour_ford when heard(party) "Look into the rumour at the ford.".
  Action fetch(actor: group, site: place) "Fetch the boat" {
    Requires able(actor) and at(actor, site) and at(actor, yard) and not fetched(actor).
    On success { Assert fetched(actor). Assert heard(actor). }
  }
  Goal false.`;
describe('an aim set aside', () => {
  it('is followed again once the one chosen over it is done, and said as the aim now', async () => {
    const t = await Tiny.start(yard), c = t.campaign;
    Undertakings.follow(c, 't__sale');
    Undertakings.follow(c, 't__boat');
    const before = PlayerView.observe(c);
    await t.perform('t__fetch(party,t__yard)');
    expect(Undertakings.followed(c)?.id).toBe('t__sale');
    expect(Undertakings.chosen(c)).toBe(true);
    expect(ActionFeedbackView.aims(before, PlayerView.observe(c)).amended).toEqual(['Help with the sale.']);
  });
  it('is not one never chosen: with nothing set aside, nothing is followed when the aim followed is done', async () => {
    const t = await Tiny.start(yard), c = t.campaign;
    Undertakings.follow(c, 't__boat');
    await t.perform('t__fetch(party,t__yard)');
    expect(Undertakings.followed(c)).toBeUndefined();
  });
  it('is dropped from those set aside once it is done itself', async () => {
    const t = await Tiny.start(yard.replace('Objective sale when not sold(party)',
      'Objective sale when not sold(party) and not heard(party)')), c = t.campaign;
    Undertakings.follow(c, 't__sale');
    Undertakings.follow(c, 't__boat');
    await t.perform('t__fetch(party,t__yard)');
    expect(Undertakings.followed(c)).toBeUndefined();
    expect(c.tickState.current.following).toBeUndefined();
  });
});
