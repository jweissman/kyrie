import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// A notice that tells something is something to learn, and the place leads with it (M21's playability list, PL-16):
// on Tessary's Landgate the eel-wife's notice, the adventure's hook, had been only under `all`. Two faults: reading a
// witness keeps its own record (learnedFrom), which PL-03's rule took for the act's own doing, so reading taught
// nothing; and a thing's acts that teach were not reckoned, only someone's questions.
const gate = `
  Place gate "the Landgate" is room at 0, 0 outdoors.
  Place street "Inkhorn Street" is room at 1, 0 outdoors.
  Passage inkhorn "Inkhorn Street" is path between gate and street.
  Company party "You" of 1 at gate.
  Discovery notice_read "Nan Teazle will give her savings for news of her son, who walked into the sea." {
    Source notice "a notice on the Landgate board" at gate readable by party.
  }
  Goal false.`;

describe('a notice to read', () => {
  it('is led with, in blue, and reading it teaches what it says', async () => {
    const t = await Tiny.start(gate);
    const notice = t.glance.acts.find(a => a.subject === 't__notice');
    expect(notice?.aspects).toContain('knowledge');
    await t.perform(notice!.for ?? notice!.inside![0]!.command);
    expect(t.world.test({ kind: 'call', name: 'knows', args: [t.campaign.playerActor!, 't__notice_read'] })).toBe(true);
  });
});
