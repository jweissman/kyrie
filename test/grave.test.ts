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
  // An oath sworn in talk, not an action beside it (Liberty of the Ice's 13: every handshake had to be one).
  it('may be a topic, said in the talk before it is done', async () => {
    const j = await Journey.start(probe, 'grave');
    const choice = ChoiceList.explore(ScreenModel.build(j.campaign)).flatMap(s => leaves(s.choices))
      .find(c => c.label === 'Swear to Ysolde that the statue will stand')!;
    expect(choice.grave).toBe('An oath sworn to the warden binds you to the statue.');
    expect(await j.play('Swear to Ysolde')).toContain('holds it a moment longer');
    expect(j.holds('p__sworn', 'party')).toBe(true);
  }, 60000);
});
