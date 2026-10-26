import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';

// A thing's state is told on the page beside its name. Authors name states as identifiers ("wound_up", since a state's
// name shares the module's namespace); the page says them as words.
describe('a thing\'s state on the page', () => {
  it('is said as words, not as its identifier', async () => {
    const j = await Journey.start('test/fixtures/probes/state-note/probe.campaign.json', 'note');
    const note = () => ScreenModel.build(j.campaign).things.find(t => t.name === 'the sluice')?.note;
    expect(note()).toBe('wound down');
    await j.play('Wind the sluice up');
    expect(note()).toBe('wound up');
  }, 60000);
});
