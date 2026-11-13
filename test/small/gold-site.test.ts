import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// Gold goes further into a site only when what the aim waits on is known to lie within it (the lead's ruling, 13
// November; M21's playability list, PL-23): the debt's gold had walked the hobs' hold room by room into an empty
// spy-crack, where the debt's coin was nowhere known to be. An aim that names something inside (the brothers' writing
// further into Neblalac, in test/gold-thread) is still led on to it. A hold of three rooms off its door.
const hold = (aim: string) => `
  Place moor "the moor" is room at 0, 0 outdoors.
  Place hold "the hold" is site at 1, 0.
  Place door "the door of the hold" is room within hold at 0, 0 outdoors.
  Place hall "the hall" is room within hold at 1, 0 indoors.
  Place crack "a spy-crack" is room within hold at 2, 0 indoors.
  Passage track "the moor track" is path between moor and door.
  Passage way_in "the way in" is door between door and hall.
  Passage cleft "a cleft in the wall" is path between hall and crack.
  Company party "You" of 1 at door.
  Thing writing "the old writing" at crack { State cut "Letters are cut in the rock.". }
  ${aim}
  Goal false.`;
const golden = (t: Tiny) => t.gold.map(a => a.label);

describe('gold inside a site', () => {
  it('does not walk its rooms for an aim waiting on what is not known to be there', async () => {
    const t = await Tiny.start(hold('Objective debt when quantity(party, gold) < 50 toward hold "You owe fifty coin: what is in such places could pay it.".'));
    await t.follow('debt').play('To the hall');
    expect(golden(t)).toEqual([]);
    expect(t.glance.acts.some(a => /crack/.test(a.label) && a.aspects.includes('exploration'))).toBe(true);
  });
  it('leads on to what the aim names inside it', async () => {
    const t = await Tiny.start(hold('Relation read(entity). Objective words when not read(writing) toward writing "Copy the old writing in {hold}.".'));
    await t.follow('words').play('To the hall');
    expect(golden(t)).toEqual([expect.stringMatching(/crack/)]);
  });
  // What would pay it, once seen lying there, is the debt's next step (spoils, for an aim short of coin).
  it('is on taking what would pay the debt, once it is seen', async () => {
    const t = await Tiny.start(hold('Item casket "a jewelled box" is jeweled_box at hall. Objective debt when quantity(party, gold) < 50 toward hold "You owe fifty coin: what is in such places could pay it.".'));
    await t.follow('debt').play('To the hall');
    expect(golden(t)).toEqual([expect.stringMatching(/jewelled box/)]);
  });
});
