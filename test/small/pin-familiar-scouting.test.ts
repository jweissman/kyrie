import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A Paragon pin (doc/architecture/mission-21/paragon-pins.md), kept failing: familiar scouting. A mage's owl is sent
// over the wall into the yard the company cannot see into, and comes back knowing who stands there; the company
// then knows it too. Today nothing sends a companion apart from the company, nor lets one perceive or learn alone,
// nor passes what it learned to the company: perception and knowledge belong to the company whole (`noticed`,
// `visibleTo`, `knows(party, …)`). The generic capability wanted, for M22: a member or companion acting apart, with
// a place and a perception of its own, its knowledge passed on rejoining or by an act. Not to be made green by a case
// for owls.
const keep = `
  Place gate "outside the gate" is room at 0, 0 outdoors.
  Place yard "the yard" is room at 1, 0 outdoors.
  Passage wall "the wall" is door between gate and yard.
  Thing gatedoor "the yard gate" on wall { State barred blocking "The yard gate is barred from within.". }
  Company party "You" of 1 at gate.
  Person hob "Hob" at gate { Role "the mage's owl". Species owl. Peaceable. Pronouns he. }
  Initially Assert acceptsEscort(hob, party). Initially Assert following(hob, party).
  Person sentry "a sentry" at yard { Role "a sentry with a crossbow". Ancestry human. Calling warrior. Temperament territorial. }
  Entity sentry_seen: fact "A sentry with a crossbow stands in the yard.". Initially Assert established(sentry_seen).
  Observe yard_sentry at yard when at(sentry, yard) "A sentry with a crossbow stands in the yard." teaches sentry_seen.`;
describe('familiar scouting', () => {
  it.failing('sends the owl over the wall, and learns from it who stands in the yard', async () => {
    const t = await Tiny.start(keep, { party: [{ name: 'Aud', raceId: 'human', classId: 'mage' }] });
    expect(t.journey.holds('knows', 'party', 't__sentry_seen')).toBe(false);
    // The missing act: nothing sends a companion somewhere the company does not go.
    await t.play('Send Hob .*yard');
    await t.play('Wait › A while');
    expect(t.journey.holds('knows', 'party', 't__sentry_seen')).toBe(true);
  });
});
