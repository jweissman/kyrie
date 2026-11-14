import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// Someone held against their will is not a host (the second blind playtest, BL-10: a shepherd's boy penned among stolen
// sheep, his hands tied, greeted the company "Now then! A new face. What can I do for you?").
describe('a greeting', () => {
  it('from one penned is a troubled one, whatever their manner', async () => {
    const t = await Tiny.start(`Place pens "the pens" is room at 0, 0 indoors.
      Company party "You" of 1 at pens.
      Person boy "the shepherd's boy" at pens { Role "a boy taken off the farms". Ancestry human. Peaceable.
        State penned "A boy sits among the stolen sheep with his hands tied, trying not to cry.".
        State loose "The boy rubs his wrists.". Change untie "Untie the boy" from penned to loose. }`);
    const e = await t.session.leg('talk_to(t__boy)');
    expect((e.voiced ?? []).find(v => v.kind === 'address')?.id).toMatch(/^address\.troubled\./);
  });
});
