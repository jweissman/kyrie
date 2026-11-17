import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// The aim followed and its next step are one record, read by every client (US-07, PD-08): the aim, where its next step
// was learned, and the step. At a1's Mistlake the brothers' errand had named only the place the company stood in, and
// nothing said the speaking door was the step: the old writing is read in the hall beyond it (PB-16b). The record says
// so without gilding the door's grave words (the lead's ruling, 15 November; test/speaking-door-business).
const hold = `
  Place moor "the moor" is wilderness at 0, 0.
  Place lane "the drove lane" is room within moor at 0, 1 outdoors.
  Place porch "the porch of the hold" is room within moor at 0, 0 outdoors.
  Place hold "the old hold" is site within moor at 1, 0.
  Place hall "the carved hall" is room within hold at 1, 0 indoors.
  Passage track "the track" is path between lane and porch.
  Passage arch "the arch" is door between porch and hall.
  Company party "You" of 1 at lane.
  Entity history: fact "Who made the hold".
  Thing slab "the fallen slab" on arch {
    State shut blocking "A fallen slab fills the arch.".
    State aside "The slab lies heaved aside, and the arch is open.".
    Change heave "Heave the slab aside" from shut to aside.
  }
  Observe carving at hall when true "Words are cut along the wall, of the hold's makers." teaches history.
  Objective writing when not knows(party, history) toward porch "Read the old writing at {porch}.".
  Goal false.`;
const green = `
  Place hythe "Hythe" is settlement.
  Place green "the green at Hythe" is room within hythe at 0, 0 outdoors.
  Place yard "the churchyard" is room within hythe at 1, 1 outdoors.
  Place crypt "the crypt" is room within hythe at 1, 2 underground 1 down.
  Passage gate "the lych-gate" is gate between green and yard.
  Passage stair "the crypt stair" is stair between yard and crypt.
  Company party "You" of 1 at green.
  Person dead "the restless dead" at crypt { Role "the dead, up out of their graves". Species zombie. }
  Objective crypt when true toward dead by yard "Lay the dead under {yard}.".
  Goal false.`;

describe('the aim followed and its next step', () => {
  it('is what bars the way to what the aim waits on, and then the place beyond', async () => {
    const t = await Tiny.start(hold);
    expect(t.glance.lead).toBeUndefined();
    t.follow('writing');
    expect(t.glance.lead).toEqual({ aim: 't__writing', source: 'toward', next: ['t__porch'] });
    await t.play('To the porch of the hold');
    expect(t.glance.lead).toEqual({ aim: 't__writing', source: 'barred', next: ['t__slab'] });
    await t.perform('change_thing(t__slab_heave)');
    expect(t.glance.lead).toEqual({ aim: 't__writing', source: 'taught', next: ['t__hall'] });
  });
  it('is the way its author says the aim is gone to by, until it is taken', async () => {
    const t = await Tiny.start(green);
    t.follow('crypt');
    expect(t.glance.lead).toEqual({ aim: 't__crypt', source: 'route', next: ['t__yard'] });
    await t.play('To the churchyard');
    expect(t.glance.lead).toEqual({ aim: 't__crypt', source: 'toward', next: ['t__dead'] });
  });
});
