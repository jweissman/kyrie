import { describe, expect, it } from 'bun:test';
import { Curious } from '../../src/autoplay/curious';
import { Tiny } from '../support/tiny';

// A rule that reads nothing (an Ending when false) is idle for good, and the rules woken beside it are unharmed
// (RuleWakes.hold, OR-722): it had been filed under an empty line of the wake index, the line deleted under it when
// another rule on it was freed, and freeing it then threw in the first watch's rules. The author's path's Wellspring
// (test/author-path) had stopped at its first step, its one topic never offered. Wellspring's own module, walked.
const well = `
  Place road "the road into town" is room at 0, 0 outdoors.
  Place square "the square" is room at 1, 0 outdoors.
  Passage gate "the town gate" is road between road and square taking 10 minutes.
  Company party "You" of 1 at road.
  Person mary "Mary Coyle" at square { Role "a woman at the well". Pronouns she. Peaceable. }
  Relation asked(group).
  Topic mary_well with mary "Ask Mary about the well" when true once { Says "'Deep,' says Mary.".
    On discuss { Assert asked(party). } }
  Rule mary_hums when at(party, square) once says "Mary hums at the well." { }
  Ending found "At the well" when asked(party) "You know how deep the well is.".
  Ending opened "The sealed door" when false "The door opens.".`;
describe('a rule that reads nothing', () => {
  it('is idle for good, and the walk beside it goes on to its ending', async () => {
    const t = await Tiny.start(well), reach = await new Curious(t.journey).play(20);
    expect(reach.error).toBeUndefined();
    expect(reach.topicsOffered.has('t__mary_well')).toBe(true);
    expect(t.world.test({ kind: 'call', name: 'reached', args: ['t__found'] })).toBe(true);
  });
});
