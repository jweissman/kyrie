import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// The aim's own next step has a place among what the scene leads with, though dangers and the way back have taken the
// three (M21's playability list, PL-19): at Gefeohtgaet's door the hobs' parley and slipping past them and the way back
// had filled them, and the search under the door-stone the dead man's map marks was only under `all`, while the gold
// went to the parley for standing at the aim's place. A door with a box under its stone, and three dangers watching it.
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
  it('is led, and gold, though the dangers and the way back have taken the three places', async () => {
    const t = await Tiny.start(door);
    await t.follow('marked').play('Into Gefeohtgaet');
    const led = t.glance.acts;
    expect(led.filter(a => a.aspects.includes('danger')).length).toBeGreaterThanOrEqual(3);
    expect(led.filter(a => a.continues).map(a => a.label)).toEqual([expect.stringMatching(/^Search/)]);
  });
});
