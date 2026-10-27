import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';

// A thing's state is told on the page in the thing's own words ("The sluice is wound down."). Authors name states as
// identifiers ("wound_up", since a state's name shares the module's namespace), and the id is not set beside the
// thing's name as well: the M16 free play read "worn" under the steward's key, and "hung" (PRE-07).
describe('a thing\'s state on the page', () => {
  it('is told in its own words, not as its identifier beside its name', async () => {
    const j = await Journey.start('test/fixtures/probes/state-note/probe.campaign.json', 'note');
    const screen = () => ScreenModel.build(j.campaign);
    const told = () => [screen().things.find(t => t.name === 'the sluice')?.note, screen().observed.map(o => o.text)];
    expect(told()).toEqual([undefined, expect.arrayContaining(['The sluice is wound down.'])]);
    await j.play('Wind the sluice up');
    expect(told()).toEqual([undefined, expect.arrayContaining(['The sluice is wound up.'])]);
  }, 60000);
});
