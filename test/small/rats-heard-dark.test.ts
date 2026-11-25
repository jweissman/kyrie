import { describe, expect, it } from 'bun:test';
import { Laboratory } from '../../scripts/laboratory';
import { PlayTool } from '../../src/cli/play-tool';
import { ScreenModel } from '../../src/ui/screen-model';

// Where the rats get in is heard in the dark (OR-423's re-landing, seed c3 of test/no-lead-round): a company whose
// candle had burned out on the long way round under the town came up into the rat-runs in the dark, killed the rats
// there, and was led to and fro between the runs, the cellar and the nest for where they got in, the worn path in the
// dirt being a sign, which is seen, and so unseen. The laboratory's town, written by the same generator: in the runs,
// with nothing to see by, the company learns it by ear.
describe('the rats\' run', () => {
  it('is heard in the dark, and so where they get in is learnt with nothing to see by', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse([Laboratory.file, '--as', 'human/warrior/Brann']));
    const c = j.session.campaign, knows = () => c.world.related('knows')
      .some(r => r.args[0] === 'party' && r.args[1] === 'lab__low_u_rats_source');
    j.put('party', 'lab__low_u_cellar');
    expect(knows()).toBe(false);
    await j.session.perform('go(party,lab__low_u_runs,lab__low_u_cellar,lab__low_u_warren)');
    expect(ScreenModel.build(c).dark).toBeTruthy();
    expect(knows()).toBe(true);
  }, 10000);
});
