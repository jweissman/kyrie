import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Doable } from '../../src/presentation/doable';
import { Promises } from '../../src/presentation/promises';

// One with nothing to be said to them but a blow is not someone to talk to (OR-698, cold plays 1 and 4: goblins
// talked round, then talked to, held "Attack the goblins" alone, drawn twice under their talk's id). The blow stands
// at the place, done, not said.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Person gobs "the goblins" at yard { Role "goblins who have made a home of the yard". Ancestry goblin. Calling thief. Numbers 3. Level 1. Temperament wary. }
  Initially Assert tolerates(gobs, party).
  Goal false.`;
const rows = (t: Tiny) => Doable.flat(Doable.of(t.glance as never, t.screen))
  .filter(r => /gobs/.test(`${r.id} ${r.does ?? ''}`)).map(r => `${r.id} | ${r.label} | ${r.does ?? ''}`);
describe('one with nothing to be said to them but a blow', () => {
  it('is not talked to: the blow stands at the place, once', async () => {
    const t = await Tiny.start(yard, { horizon: ['inhabitants'] });
    await t.perform('talk_to(t__gobs)');
    const said = rows(t);
    expect(said.filter(r => /#talk/.test(r))).toEqual([]);
    expect(said.filter(r => /^attack\(t__gobs\)/.test(r)).length).toBe(1);
  });
});

// And one the company is held from while a threat warns it off is not shown as one nothing can be done toward: the
// goblins at the crossing, while a blasting charge stood across the way (OR-698, cold play 4, T51: "the goblins is
// here, and nothing can be done toward them"). What answers the charge is what is offered; the goblins wait.
const crossing = `
  Place adit "the adit" is room at 0, 0 underground.
  Place crossing "the crossing" is room at 1, 0 underground.
  Passage gallery "the gallery" is passage between adit and crossing.
  Company party "You" of 1 at adit.
  Person gobs "the goblins" at crossing { Role "goblins who have made a home of the galleries". Ancestry goblin. Calling thief. Numbers 3. Level 1. Temperament wary. }
  Person charge "a blasting charge" at crossing { Role "a charge set to keep the way". Device bomb. Level 1. Temperament obedient. Lair crossing. }
  Goal false.`;
describe('one the company is held from by a threat', () => {
  it('is held, not broken', async () => {
    const t = await Tiny.start(crossing, { horizon: ['inhabitants', 'belongings'],
      party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] });
    await t.perform('light_item(t__party_1__torch)');
    await t.perform('go(t__gallery,t__crossing)');
    expect(t.screen.warned?.id).toBe('t__charge');
    const gobs = t.screen.people.find(p => p.id === 't__gobs')!;
    expect(gobs.acts).toEqual([]);
    expect(gobs.held).toBe(true);
    expect(Promises.broken(t.screen)).toEqual([]);
  });
});
