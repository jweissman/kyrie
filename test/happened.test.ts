import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Happened } from '../src/cli/happened';
import { ReachTool } from '../src/cli/reach-tool';

// What of an adventure never happened across its plays (the Grand Tour's 09 and 11, GTR-X16: a rule that could never
// fire was found by reading): the rules that say something and were never told, the endings never reached, and the
// rest; `kyrie reach --detail` and `kyrie verify` say it of a curious player's plays and of the kept traces.
const probe = 'test/fixtures/probes/journey-driver/probe.campaign.json';
describe('what never happened', () => {
  it('is what no play told or came to, across every play added', async () => {
    const early = await Journey.start(probe);
    await early.play('Turn the wheel');
    const seen = new Happened().add(early);
    expect(seen.never()).toEqual({ rules: ['p__bell'], endings: ['p__drowning'], milestones: [], promises: [],
      silent: 1 });
    expect(seen.lines()[0]).toBe('never told: bell (and 1 rules that say nothing, not judged)');
    const late = await Journey.start(probe);
    await late.play('=40');
    expect(seen.add(late).never()).toMatchObject({ rules: [], endings: [] });
  }, 60000);
  it('is said by kyrie reach in detail', async () => {
    const lines: string[] = [];
    await ReachTool.main([probe, '--steps', '3'], l => lines.push(l));
    expect(lines).toContain('  endings never reached: drowning');
  }, 60000);
});
