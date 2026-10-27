import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { Narrator } from '../src/presentation/narrator';
import { ScreenModel } from '../src/ui/screen-model';

// What a rule says in the moment stands for the fact it teaches, and the fact's own text is the journal's (Low
// Water's friction 4, What Tessary Owes' W11, the register's NAR-10): the page read "The bell of the yard rang at the
// first hour, once." before "Somewhere across the yard a bell rings, once."
describe('a rule that teaches as it speaks', () => {
  it('is told in its own words, the fact noted for the journal', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'tq/site.kyr': `Module tq "Teach" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard.
        Entity bell_rang: fact "The bell of the yard rang at the first hour, once.".
        Rule bell when watch(clock) >= 1 and not knows(party, bell_rang)
          says "Somewhere across the yard a bell rings, once." teaches bell_rang { } }`,
      'tq/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'tq.campaign.json': JSON.stringify({ version: 1, name: 'tq', modules: [{ id: 'p', bundle: 'tq/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const s = await PlaySession.start(source.resolve('tq.campaign.json'), 'tq', source);
    const before = PlayerView.observe(s.campaign), event = await s.perform('wait');
    const feedback = ActionFeedbackView.read(s.campaign, event, before);
    const told = Narrator.leaf(s.campaign, ScreenModel.build(s.campaign), { event, feedback, moved: false }).exchange!;
    const lines = told.lines.map(l => l.text);
    expect(lines).toContain('Somewhere across the yard a bell rings, once.');
    expect(lines).not.toContain('The bell of the yard rang at the first hour, once.');
    expect(told.notes.join(' ')).toContain('bell of the yard rang');
  }, 60000);
});
