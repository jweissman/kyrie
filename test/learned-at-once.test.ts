import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Endings } from '../src/lang/endings';

// The Grand Tour's friction 23 (GTR-23): what the company learned by seeing or reading something was known only after
// the world's rules had run for the command, so a rule that drew a conclusion from it (the Courant's printed account
// set against Kittiwake's memory) fired a command late, when the company had done something else, and an ending on
// what that taught came later still. The rules answer what was learned in the command that taught it.
const probe = 'test/fixtures/probes/inference/probe.campaign.json';

describe('what the company has just learned', () => {
  it('is answered in the command that taught it: the inference told with the reading, and the ending reached',
    async () => {
      const j = await Journey.start(probe);
      const turned = j.measure('p__musings', 'party');
      const told = await j.play('the Courant: Examine');
      expect(told).toContain('The Courant reports the barque came in at dawn');
      expect(told).toContain('That is not what Kittiwake saw: the Courant is lying about the barque.');
      expect(j.taken.at(-1)!.event.perceptions!.map(p => p.id)).toContain('p__infer');
      expect(j.holds('knows', 'party', 'p__lie')).toBe(true);
      expect(told).toContain('Here the story ends.');
      expect([j.campaign.running, Endings.reached(j.campaign.world)?.title]).toEqual([false, 'The Lie Found Out']);
      // Kittiwake's account, known from the first, is turned over once for the one pass of the rules the reading
      // took, and not again for what the reading taught.
      expect(j.measure('p__musings', 'party') - turned).toBe(1);
    }, 30000);
});
