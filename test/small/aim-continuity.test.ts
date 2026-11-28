import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// Gold continuity (the owner's trust contracts, 18 November, B): with an aim followed, the glance always says how it
// goes on from here: its step gold, or what stands (Glance.continuance), never a silent nothing. The gold walks of
// scripts/gold-continuity.ts had found gold gone out at Ironkeep's gate (a1), at the strongroom's door (b2) and in
// the gate-well (iscoed), each where the lead named a step and no act was gold. A hold off the moor.
const hold = (aim: string, more = '') => `
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
  ${more}
  ${aim}
  Goal false.`;
const debt = 'Objective debt when quantity(party, gold) < 50 toward hold "You owe fifty coin: what is in such places could pay it.".';
const words = 'Relation read(entity). Objective words when not read(writing) toward writing "Copy the old writing in {hold}.".';
describe('how the aim followed goes on', () => {
  it('is its step, gold, where an act here is the step', async () => {
    const t = await Tiny.start(hold(words), { horizon: ['probing', 'inhabitants'] });
    await t.follow('words').play('To the hall');
    expect(t.glance.continuance).toMatchObject({ kind: 'step' });
    expect(t.gold.map(a => a.choice)).toEqual([(t.glance.continuance as { witness: string }).witness]);
  });
  // The counterexample: the debt's gold may not walk the hold's rooms (PL-23), and it had then said nothing.
  it('says a frontier, never nothing, where nothing within is known to hold what it waits on', async () => {
    const t = await Tiny.start(hold(debt), { horizon: ['probing', 'inhabitants'] });
    await t.follow('debt').play('To the hall');
    expect(t.gold).toEqual([]);
    expect(t.glance.continuance).toEqual({ kind: 'frontier',
      said: 'Nothing here is known to hold what your aim waits on: the hold is still to be explored.' });
  });
  // A bar across the way to the step: what is done to it is the step, gold (b2's strongroom door, with nothing to do
  // to it, says "… bars the way, and nothing here opens it yet": scripts/gold-continuity.ts).
  it('is gold on what bars the way to the step', async () => {
    const t = await Tiny.start(hold(words,
      'Thing grille "an iron grille" on cleft { State down blocking "An iron grille is down across the cleft.". }'),
    { horizon: ['probing', 'inhabitants'] });
    await t.follow('words').play('To the hall');
    expect(t.gold.map(a => a.command)).toEqual(['push(t__grille)']);
    expect(t.glance.continuance?.kind).toMatch(/^(step|gilded)$/);
  });
  // At the place the aim names, what its words are about is the step: the pawl to be brought up out of the gate-well,
  // lying there, is taken for it, gold (cold play 5, CL-33: "Collect the sea-gate's pawl" unmarked, and the frontier
  // saying nothing here bore on the aim).
  it('is gold on taking what the aim is about, at the place it names', async () => {
    const t = await Tiny.start(`
      Place well "the gate-well" is room at 0, 0 indoors.
      Company party "You" of 1 at well.
      Kind pawl_kind "the sea-gate's pawl" is gear worth 6 weighing 6 described "A tooth of iron.".
      Item pawl "the sea-gate's pawl" is pawl_kind at well.
      Objective bring when not holding(party, pawl_kind) toward well "Bring the sea-gate's pawl up out of the gate-well.".
      Goal false.`, { horizon: ['belongings', 'inhabitants'] });
    t.follow('bring');
    expect(t.gold.map(a => a.command)).toEqual([expect.stringMatching(/^take_item\(t__pawl,/)]);
    expect(t.glance.continuance?.kind).toMatch(/^(step|gilded)$/);
  });
});
