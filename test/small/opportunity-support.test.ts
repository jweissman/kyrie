import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { SupportCheck } from '../support/support-check';

// Whatever a container promises, something inside it bears (the opportunity architecture, AT-07 §5 step 1; the
// owner's playtest of 19 November, AT-05 and AT-06: a lens's indicator, and a suggestion at a higher level, with no
// row under it). Two tiny worlds hold the measured causes: a thing led for the place's own act ("the cart in the
// ditch", whose act within had borne nothing of it), and the first look at a way barred (the corn-store padlock, led
// worth a look at Porthalen's landing at the first frame, its pushing and listening plain); and a thing read and a
// slate wiped, the lane's (see blue-truthful). The probe's walks (a1 and kite, 25 turns): 49 of 130 led openers.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place store "the store" is room at 1, 0.
  Passage door "the store door" is door between yard and store.
  Thing lock "a padlock" on door { State locked blocking "A padlock holds the store door shut.". }
  Thing cart "a cart in the ditch" at yard {
    State stuck "A cart lies with one wheel in the ditch.".
    State out "The cart stands on the road again.".
    Change heave "Heave the wheel out of the ditch" from stuck to out.
  }
  Company party "You" of 1 at yard.
  Goal false.`;
const lane = `
  Place lane "the lane" is room at 0, 0 outdoors.
  Thing tablet "a wax tablet in a wooden case" at lane {
    State shut "A wax tablet in a wooden case lies on the step, its wax scratched in rows.".
    State read "Rows of notches: so many oaks, felled by night.".
    Change read "Read the strokes on the wax tablet" from shut to read.
  }
  Entity oak: fact "Someone was felling the Hall's oak by night.".
  Observe tablet_learned at lane of tablet as reading when state(tablet, read) "The count of oak cut by night." teaches oak.
  Thing slate "a slate in the wall" at lane {
    State blank "A slate is set in the wall, scratched with lines.".
    State wiped "The slate is wiped clean.".
    Change wipe "Wipe the slate clean" from blank to wiped.
  }
  Company party "You" of 1 at lane.
  Goal false.`;
const party = [{ name: 'Brann', raceId: 'human', classId: 'warrior' }];
const worlds = async () => Promise.all([yard, lane].map(kyr => Tiny.start(kyr, { party })));

describe('what a container promises is borne within it', () => {
  it('every led opener\'s aspects by an act inside it (P1)', async () => {
    for (const t of await worlds()) { expect(SupportCheck.openers(t.glance, t.screen)).toEqual([]); }
  });
  it('every likeness\'s aspects by a row of its subject (P2)', async () => {
    for (const t of await worlds()) { expect(SupportCheck.likenesses(t.glance, t.screen)).toEqual([]); }
  });
  it('every row has words, and does or opens something (P3)', async () => {
    for (const t of await worlds()) { expect(SupportCheck.rows(t.glance, t.screen)).toEqual([]); }
  });
});
