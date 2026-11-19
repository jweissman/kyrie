import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A wonder (a marvel, `Marvel.`, met by a change) is drawn violet, the atlas's uncanny (the owner, 15 November: "there
// are basically no wonders"): the act that meets it carries the wonder aspect, and the aspect's promise
// (RunnerFidelity: it brings its change) holds. (This had pinned the producer as the thing's `wonder_…` id, which only
// the generators write; the marvel is now typed, as its author declares it: AT-01, test/small/marvel-typed.)
const glade = `
  Place glade "the glade" is room at 0, 0 outdoors.
  Company party "You" of 1 at glade.
  Thing wonder_stone "a standing stone humming" at glade is scenery {
    Marvel.
    State unwoken "A standing stone hums, very low, a note you feel in your teeth.".
    State woken "The stone is quiet, and warm to the hand.".
    Change meet "Lay a hand on the humming stone" from unwoken to woken.
  }
  Observe wonder_stone_seen at glade when state(wonder_stone, unwoken) "A standing stone hums, very low.".
  Goal false.`;

describe('a wonder', () => {
  it('is led with its violet aspect, until it is met', async () => {
    const t = await Tiny.start(glade);
    const act = t.leaf.glance?.acts.find(a => /standing stone/.test(a.label));
    expect(act).toBeDefined();
    expect(act!.aspects).toContain('wonder');
  });
});
