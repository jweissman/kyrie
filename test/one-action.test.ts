import { afterEach, describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { CampaignGrounding } from '../src/campaign/campaign-grounding';
import { FreshSeeds } from '../src/world/fresh-seeds';
import { AutoplayRun } from '../src/autoplay/run';
import { AsMeant } from './support/as-meant';
import { GoldenWalk } from './support/golden-walk';

// An act is checked by its own schema alone, not by every action of the world grounded (OR-725: Campaign.action had
// worked out the whole legal list of the world before it to find the one it was asked, 24 ms of a journey's leg).
// Held to the whole list: with CampaignGrounding.checking, every action asked for is also looked for among all the
// world offers, and the two must agree, accepted or refused, over the warrior's golden walk, two seeded worlds by an
// expedition's temper (a1, b2) and two of the reference game's by the gold (s0, a new life's fresh seed).
describe('an act asked for', () => {
  afterEach(() => { CampaignGrounding.checking = false; });
  it('is accepted or refused as the whole list of what is offered would have it', async () => {
    CampaignGrounding.checking = true;
    CampaignGrounding.checked.asked = 0; CampaignGrounding.checked.differ.length = 0;
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session);
    for (const line of GoldenWalk.lines()) { await AsMeant.ask(r, line); }
    let n = 0;
    const runs = [['a1', 'expedition'], ['b2', 'expedition'], ['s0', 'gold'],
      [FreshSeeds.seed(() => `quiet${n++}`), 'gold']] as const;
    for (const [seed, policy] of runs) {
      await AutoplayRun.run({ seed, origin: 'wanderer', policy, steps: 30,
        protagonist: { name: 'Wenna', raceId: 'dwarf', classId: 'cleric' } });
    }
    expect(CampaignGrounding.checked.differ).toEqual([]);
    expect(CampaignGrounding.checked.asked).toBeGreaterThan(150);
  }, 600000);
});
