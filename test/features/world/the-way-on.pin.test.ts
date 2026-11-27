import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › The way on (the owner's playtest of 27
// November: "pointless wandering"; OR-1502). Where every way from where the company stands goes somewhere it has been
// (the shrine with the woods' edge walked, a dead-end recess of the first level), the one that leads on to what it has
// not seen is marked as a way somewhere worth a look: the Atlas's exploration, its icon on that row and on no other,
// inferred from the ways the company knows and where it has been, never written by an author. Every client draws it
// from the same offer.
const rows = (t: Tiny) => [...t.glance.offer!.primary, ...t.glance.offer!.rest];
const marked = (t: Tiny) => rows(t).filter(o => o.aspects.includes('exploration')).map(o => o.label);
describe('World › The way on', () => {
  // A town of a green and a shrine, and the woods beside it: the edge and, beyond, the ride.
  const town = `
    Place mere "Mere" is settlement at 0, 0.
    Place green "the green" is room within mere at 0, 0 outdoors.
    Place shrine "the shrine" is room within mere at 1, 0 indoors.
    Place woods "the old woods" is wilderness at 0, 1.
    Place edge "the edge of the woods" is room within woods at 0, 1 outdoors.
    Place ride "the old ride" is room within woods at 0, 2 outdoors.
    Passage porch "the porch" is door between green and shrine.
    Passage path "the path" is path between green and edge.
    Passage track "the track" is path between edge and ride.
    Person keeper "Ida" at shrine { Role "shrine-keeper". Ancestry human. Peaceable. Pronouns she. }
    Company party "You" of 1 at green.
    Goal false.`;
  it('marks the way from the shrine that leads on to the woods not yet seen, the woods\' edge walked', async () => {
    const t = await Tiny.start(town, { horizon: [] });
    await t.play('>t__edge', '>t__green', '>t__shrine');
    // Every way from the shrine goes somewhere been; the ride, beyond the edge, has not been seen.
    expect(t.screen.exits.every(e => e.visited)).toBe(true);
    const on = rows(t).find(o => o.aspects.includes('exploration'));
    expect(on?.label).toBe('To the green');
    expect(marked(t)).toEqual([on!.label]);
    // Led among the four, and said as where it leads on to.
    expect(t.glance.acts.find(a => a.choice === on!.choice)).toMatchObject({ why: 'leads', note: 'on toward the old ride' });
    // Taken, it brings the company nearer: from the green, the way up into the woods is the way on.
    await t.perform(on!.command!);
    expect(t.where()).toBe('t__green');
    expect(marked(t)).toEqual([rows(t).find(o => o.choice.endsWith('t__edge'))!.label]);
    // With the ride been to, nothing is left unseen, and nothing is marked as leading on.
    await t.play('>t__edge', '>t__ride', '>t__edge', '>t__green', '>t__shrine');
    expect(marked(t)).toEqual([]);
  });
  // A site of three rooms: the hall, a recess off it with no way on, and the gallery beyond the hall, seen from it.
  const hold = `
    Place moor "the moor" is wilderness at 0, 0.
    Place porch "the porch of the hold" is room within moor at 0, 0 outdoors.
    Place hold "the old hold" is site within moor at 1, 0.
    Place hall "the carved hall" is room within hold at 1, 0 indoors.
    Place recess "the recess" is room within hold at 1, 1 indoors.
    Place gallery "the gallery" is room within hold at 2, 0 indoors.
    Passage arch "the arch" is door between porch and hall.
    Passage niche "the niche" is doorway between hall and recess.
    Passage through "the passage" is doorway between hall and gallery.
    Company party "You" of 1 at porch.
    Goal false.`;
  it('marks the way back out of a dead-end recess, toward the gallery not yet entered', async () => {
    const t = await Tiny.start(hold, { horizon: [] });
    await t.play('>t__hall', '>t__recess');
    expect(t.screen.exits.map(e => [e.destination.id, e.visited])).toEqual([['t__hall', true]]);
    const back = rows(t).find(o => o.choice.endsWith('t__hall'))!;
    expect(marked(t)).toEqual([back.label]);
    expect(t.glance.acts.find(a => a.choice === back.choice)?.note).toBe('on toward the gallery');
    // The gallery entered, the hold has nothing unseen: the way back is the way out of it (OR-411), not on.
    await t.play('>t__hall', '>t__gallery', '>t__hall', '>t__recess');
    expect(t.glance.acts.find(a => a.choice === back.choice)?.why).toBe('out');
  });
});
