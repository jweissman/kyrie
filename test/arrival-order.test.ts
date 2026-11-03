import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Coming somewhere, the place is told first and then what happens in it: Ivo's remark on the handprints had been told
// before the place that showed them (Half the Hive's friction 16). A thing a rule there changes is told after the
// rule's words, not with the place before them: the Lull's chair was ravelled before the Watching that ravelled it
// (its friction 11, LUL-08).
describe('a place come to', () => {
  it('is told before what happens in it, and a thing changed there after what changed it', async () => {
    const j = await Journey.start('test/fixtures/probes/arrival-order/probe.campaign.json', 'k');
    await j.play('>p__hollow');
    expect(j.taken.at(-1)!.page).toBe('Under the brow it is dry. At the back there are handprints in the wax.'
      + ' Ivo kneels by the handprints and puts his hand over one.'
      + ' The Watching passes over the hollow, and what it touches comes undone.'
      + ' The chair at the back has ravelled into loose threads.');
  }, 60000);
});
