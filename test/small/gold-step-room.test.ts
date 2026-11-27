import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// The aim's own next step has a place among what the scene leads with, though dangers and the way back have taken the
// three (M21's playability list, PL-19): at Gefeohtgaet's door the hobs' parley and slipping past them and the way back
// had filled them, and the search under the door-stone the dead man's map marks was only under `all`, while the gold
// went to the parley for standing at the aim's place. A door with a box under its stone, and three dangers watching it,
// the boar warning the company off (an engagement: what is in front of it is answered first, OR-163).
const door = `
  Place moor "the moor" is room at 0, 0 outdoors.
  Place keep "Gefeohtgaet" is site at 1, 0.
  Place gate "the door of Gefeohtgaet" is room within keep at 0, 0 outdoors.
  Passage track "the moor track" is path between moor and gate.
  Company party "You" of 1 at moor.
  Person rats "the rats in the gate" at gate { Role "rats, watching". Species rat. Numbers 2. Level 1. Lair gate. }
  Person wolf "a grey wolf" at gate { Role "a wolf that lairs in the gate". Species wolf. Lair gate. }
  Person boar "a boar" at gate { Role "a boar rooting by the wall". Species boar. Lair gate. }
  Discovery cache_found "Under the stone at the door the earth has been dug and filled again." { Found by searching gate. }
  Item cache "the dead man's box" is jeweled_box at gate hidden until cache_found.
  Objective marked when not carries(party, cache) toward gate "The dead man's map marks {gate}, with a cross at its door. Search there.".
  Goal false.`;

describe('the aim\'s next step among dangers', () => {
  it('waits while the boar warns the company off, and is led, and gold, among the dangers once it is answered', async () => {
    const t = await Tiny.start(door, { party: [{ name: 'Ama', raceId: 'human', classId: 'warrior', level: 3 }] });
    await t.follow('marked').play('Into Gefeohtgaet');
    // Warned off by the boar, the company answers it first (OR-163: Engaged): the search is neither an act on it nor a
    // way out, and is not led until the boar is answered; nor are the rats and the wolf, which do not warn, fought.
    expect(t.glance.acts.map(a => a.label)).toEqual(['Attack a boar', 'Out to the moor']);
    await t.play('^Attack');
    const led = t.glance.acts;
    expect(led.filter(a => a.aspects.includes('danger')).length).toBeGreaterThanOrEqual(2);
    expect(led.filter(a => a.continues).map(a => a.label)).toEqual([expect.stringMatching(/^Search/)]);
  }, 60000);
});
