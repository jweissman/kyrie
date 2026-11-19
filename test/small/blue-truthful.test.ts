import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import type { Promoted } from '../../src/presentation/glance-types';

// Blue promises something to learn, and only what teaches is drawn so (the atlas study, Model A: AT-01). Three false
// producers: a sign seen, or a thing not looked at yet, drawn blue whatever the act it was led for teaches (petting
// the grey dog, audit 11); the first try at a way barred, drawn blue (heaving the portcullis up, audit 15); and an
// authored reading whose success asserts no `knows` of its own, drawn only "worth a look" though its author wrote what
// it teaches (`Observe … as reading when state(tablet, read) … teaches`: the dead man's tablet, audit 12).
const lane = `
  Place lane "the lane" is room at 0, 0 outdoors.
  Place bailey "the bailey" is room at 1, 0 outdoors.
  Passage gate "the gate" is path between lane and bailey.
  Thing portcullis "the portcullis" on gate {
    State down blocking "The portcullis is down across the gate.".
    State up "The portcullis is wedged up.".
    Change heave "Heave the portcullis up and wedge it" from down to up.
  }
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
  Person dog "Fly" at lane { Role "a grey dog". Species dog. Peaceable. }
  Observe dog_wet at lane of dog as sign when true "The grey dog's coat is wet to the shoulder: it has been in the river.".
  Company party "You" of 1 at lane.
  Goal false.`;
// What the glance leads with for a thing (its look, the reading inside it) or a way's first try.
const led = (t: Tiny, by: RegExp): Promoted | undefined =>
  t.glance.acts.find(a => by.test(a.label) || by.test(a.subject ?? '') || by.test(a.choice));

describe('blue, only for what teaches', () => {
  it('draws an authored reading that teaches as something to learn, and reading it teaches it', async () => {
    const t = await Tiny.start(lane);
    const tablet = led(t, /t__tablet/)!;
    expect(tablet.aspects).toContain('knowledge');
    // The reading inside bears the lesson (and, the place's own act, worth a look, which has no tone: AT-07).
    expect(tablet.inside?.find(i => i.command === 'change_thing(t__tablet_read)')?.aspects).toContain('knowledge');
    await t.perform('change_thing(t__tablet_read)');
    expect(t.world.test({ kind: 'call', name: 'knows', args: [t.campaign.playerActor!, 't__oak'] })).toBe(true);
  });
  it('draws a change that teaches nothing, the first try at a way barred, and a sign\'s gentle act, as no lesson', async () => {
    const t = await Tiny.start(lane, { party: [{ name: 'Brann', raceId: 'human', classId: 'warrior' }] });
    expect(led(t, /t__slate/)?.aspects ?? []).not.toContain('knowledge');
    const heave = led(t, /Heave the portcullis/);
    expect(heave).toBeDefined();
    expect(heave!.aspects).not.toContain('knowledge');
    // The dog's sign is worth a look; making much of him teaches nothing.
    const dog = led(t, /t__dog/);
    expect(dog).toBeDefined();
    expect(dog!.aspects).not.toContain('knowledge');
  });
});
