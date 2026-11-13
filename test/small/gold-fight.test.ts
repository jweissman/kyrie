import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// Where the aim waits on a fight, the fight is its next step, led red for its danger and gold for the aim; the way
// back to the place the aim's words name is not (M21's playability list, PL-11). In the corn-store's rat-runs the
// rats the job is to clear stood in front of the company, and the gold was on the hole back to the cellar it had just
// searched by torchlight: the job waits on the rats (`Rule … when not able(rats)`), and a fight's end was not reckoned
// as anything an act brings about. The corn-store job in miniature (data/generation/town/undertown.kyrt).
const store = `
  Place town "Millholm" is settlement.
  Place cellar "the corn-store cellar" is room within town at 0, 0 indoors.
  Place runs "the rat-runs" is room within town at 1, 0 indoors.
  Passage hole "a hole gnawed through the cellar wall" is path between cellar and runs.
  Company party "You" of 1 at cellar.
  Relation given(entity). Relation done(entity).
  Entity job: fact "Clear the rats out of the corn-store cellar.".
  Initially Assert given(job).
  Person rats "the rats under the corn-store" at runs {
    Role "rats, fat and bold". Species rat. Numbers 3. Level 1. Lair runs.
  }
  Rule cleared when not able(rats) and not done(job) { Assert done(job). }
  Objective clear when given(job) and not done(job) toward cellar "Clear the rats out of {cellar}, and find where they get in.".
  Goal false.`;

describe('gold where the aim waits on a fight', () => {
  it('is on the fight in front of the company, not the way back to the place the aim names', async () => {
    const t = await Tiny.start(store);
    t.follow('clear');
    await t.play('To the rat-runs');
    expect(t.where()).toBe('t__runs');
    const gold = t.glance.acts.filter(a => a.continues);
    expect(gold.map(a => a.label)).toEqual([expect.stringMatching(/^Attack/)]);
    expect(gold[0]!.aspects).toContain('danger');
    expect(t.glance.acts.find(a => /cellar/.test(a.label))?.continues).toBeUndefined();
  });
});
