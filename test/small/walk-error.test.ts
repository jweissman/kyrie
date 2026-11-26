import { afterEach, describe, expect, it } from 'bun:test';
import { Curious } from '../../src/autoplay/curious';
import { CampaignTick } from '../../src/campaign/campaign-tick';
import { ReachTool } from '../../src/cli/reach-tool';
import { Tiny } from '../support/tiny';

// An engine's exception in a walk is an error, never an ending (OR-723): a TypeError in the first watch's rules had
// been taken by the curious player as why play stopped, and verify said the adventure "ended" at its first step, its
// topic never offered, with nothing failed. Here the world's rules throw from the second act on: the walk says the
// error, with the step and the act it came on, and the reach line and its detail say it as an error.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place barn "the barn" is room at 1, 0.
  Passage door "the barn door" is door between yard and barn taking 1 minutes.
  Company party "You" of 1 at yard.
  Goal false.`;
const rules = CampaignTick.rules.bind(CampaignTick);
describe('an engine exception in a walk', () => {
  afterEach(() => { CampaignTick.rules = rules; });
  it('is said as an error, with the step and act it came on, not as how the walk ended', async () => {
    const t = await Tiny.start(yard);
    let n = 0;
    CampaignTick.rules = (...a: Parameters<typeof rules>) => {
      if (++n > 1) { throw new TypeError("undefined is not an object (evaluating 'byName.size')"); }
      return rules(...a);
    };
    const reach = await new Curious(t.journey).play(10);
    expect(reach.error).toMatch(/^step \d+, .+: TypeError: undefined is not an object/);
    expect(reach.ended).toMatch(/^error: /);
    const lines: string[] = [];
    ReachTool.detail(reach, { rooms: [], people: [], topics: [], acts: [], observations: [] }, l => lines.push(l));
    expect(lines).toContain(`  ERROR: ${reach.error}`);
  });
});
