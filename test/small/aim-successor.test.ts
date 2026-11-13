import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Undertakings } from '../../src/presentation/undertakings';

// What pulls once an aim followed is seen through (M21's playability list, PL-06; the lead's ruling of 13 November,
// ranks 1 and 2): said once, as it ends, and offered, never followed for the player. a1's oxen seen through had left
// "No aim is held", the drover's yoke among the bones, and Odo's "I want the yoke back" led nowhere. The oxen in
// miniature (data/goings-on/drover/oxen): a den, the yoke lying in it, and the drover's wife at her hearth in Hythe.
const oxen = `
  Place hythe "Hythe" is settlement.
  Place hearth "the drover's kitchen" is room within hythe at 0, 0.
  Place lane "the lane at Hythe" is room within hythe at 1, 0 outdoors.
  Place den "the den" is room at 2, 0 outdoors.
  Passage kitchen_door "the kitchen door" is door between hearth and lane.
  Passage track "the track to the den" is path between lane and den.
  Company party "You" of 1 at den.
  Person wife "Hild" at hearth { Role "the drover's wife". Ancestry human. Peaceable. Pronouns she. }
  Relation hung(group).
  Thing bones "the bones" at den { State fresh "Bones lie at the back of the den.". State read "The bones are the oxen's.".
    Change read "Go over the bones" from fresh to read. }
  Kind ox_yoke "an ox-yoke" is treasure worth 2 weighing 8 described "An old ox-yoke of ash.".
  Item yoke "the drover's ox-yoke" is ox_yoke at den.
  Action hang_yoke(actor: group, carrier: member, site: place) "Hang the yoke over the hearth, where it always hung" {
    Requires able(actor) and at(actor, site) and at(wife, site) and memberOf(carrier, actor) and ownedItem(yoke, carrier)
      and not hung(actor).
    Resolve drop(yoke, carrier).
    On success { Assert at(yoke, site). Assert hung(actor). }
  }
  Objective oxen when not state(bones, read) "Whatever took the drover's oxen dens at {den}.".
  Goal false.`;
// Two aims held, one seen through: the other is offered, to be followed, and is not.
const two = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Thing well "the well" at yard { State foul "The well is foul.". State clean "The well is clean.".
    Change clean "Clear the well" from foul to clean. }
  Objective well when state(well, foul) "The well in {yard} is foul.".
  Objective bell when true "The chapel's bell was stolen, and is somewhere in the hold.".
  Goal false.`;
// None held, a thing known that leads to a place not yet been to: the way there is offered.
const lead = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place tower "the lone tower" is room at 3, 0 outdoors.
  Passage track "the long track" is path between yard and tower.
  Company party "You" of 1 at yard.
  Entity green_light: fact "A green light burns at night in the lone tower.".
  Initially Assert established(green_light). Initially Assert knows(party, green_light). Initially Assert leadsTo(green_light, tower).
  Thing well "the well" at yard { State foul "The well is foul.". State clean "The well is clean.".
    Change clean "Clear the well" from foul to clean. }
  Objective well when state(well, foul) "The well in {yard} is foul.".
  Goal false.`;

describe('what pulls after an aim', () => {
  it('offers the deed\'s own consequence: the yoke to take, then to be hung at Hythe, never followed', async () => {
    const t = await Tiny.start(oxen);
    t.follow('oxen');
    await t.perform('change_thing(t__bones_read)');
    expect(t.glance.next).toMatchObject({ kind: 'consequence', text: 'Hang the yoke over the hearth, where it always hung',
      at: 'Hythe' });
    expect(t.glance.next?.command).toMatch(/^take_item\(t__yoke,/);
    await t.perform(t.glance.next!.command!);
    expect(t.glance.next).toMatchObject({ kind: 'consequence', command: 'travel:t__hythe', label: 'To Hythe' });
    expect(Undertakings.followed(t.campaign)).toBeUndefined();
    // Said once: the next act tells nothing of it.
    await t.perform('wait');
    expect(t.glance.next).toBeUndefined();
  });
  it('offers the strongest aim not followed, to follow', async () => {
    const t = await Tiny.start(two);
    t.follow('well');
    await t.perform('change_thing(t__well_clean)');
    expect(t.glance.next).toEqual({ kind: 'lead', text: 'The chapel\'s bell was stolen, and is somewhere in the hold.',
      aim: 't__bell' });
    expect(Undertakings.followed(t.campaign)).toBeUndefined();
  });
  it('offers the way to where a thing known leads, with no aim held', async () => {
    const t = await Tiny.start(lead);
    t.follow('well');
    await t.perform('change_thing(t__well_clean)');
    expect(t.glance.next).toMatchObject({ kind: 'lead', text: 'A green light burns at night in the lone tower.',
      command: 'travel:t__tower' });
  });
  it('says nothing while the aim followed is held', async () => {
    const t = await Tiny.start(two);
    t.follow('bell');
    await t.perform('change_thing(t__well_clean)');
    expect(t.glance.next).toBeUndefined();
  });
});
