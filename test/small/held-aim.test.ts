import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../src/cli/play-tool';
import { ScreenModel } from '../../src/ui/screen-model';
import { Narrator } from '../../src/presentation/narrator';
import { Undertakings } from '../../src/presentation/undertakings';

// Promise fidelity's held why (the lead's ruling on PF-03): someone another aim names is led for that aim only by what
// serves it, and says which aim. Two errands in a yard: the lane followed, Halm's lost ring held; Halm is led for the
// ring, by the question that teaches where it was lost, not the first question he has (where the road goes).
describe('an aim held beside the one followed', () => {
  it('leads its person for it, by the question that serves it, and says which aim', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['test/fixtures/single/errands.kyr', '--as',
      'human/warrior/Wynn']));
    const c = journey.session.campaign;
    Undertakings.follow(c, 'errands__walk');
    const halm = Narrator.leaf(c, ScreenModel.build(c)).glance!.acts.find(a => a.subject === 'errands__halm')!;
    expect([halm.why, halm.aim, halm.for]).toEqual(['held', 'errands__ring', 'errands__ring']);
  });
});
