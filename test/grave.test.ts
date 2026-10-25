import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList, type Choice } from '../src/ui/choice-list';

// Nothing that cannot be undone is done by a slip (Mission 15's brief; the Road's F12: telling the Grounders' hall was
// one click). An act its author calls grave carries what it costs to the page, which asks before it is done
// (test/grave-browser.test.ts); the engine does it when it is asked to.
describe('a grave act', () => {
  const probe = 'test/fixtures/probes/grave/probe.campaign.json';
  const leaves = (list: Choice[]): Choice[] => list.flatMap(c => c.children ? leaves(c.children) : [c]);
  it('is offered with what it costs, and done when it is chosen', async () => {
    const j = await Journey.start(probe, 'grave');
    const choice = ChoiceList.explore(ScreenModel.build(j.campaign)).flatMap(s => leaves(s.choices))
      .find(c => c.label === 'Break the founder\'s statue')!;
    expect(choice.grave).toBe('The statue has stood here since the town was founded; broken, it stays broken.');
    expect(await j.play('Break the founder')).toContain('it goes over, and breaks');
    expect(j.holds('state', 'p__statue', 'p__broken')).toBe(true);
  }, 60000);
});
