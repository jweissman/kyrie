import { describe, expect, it } from 'bun:test';
import { PlayTranscript } from '../../web/engine/transcript';
import { PlayerView } from '../../src/presentation/player-view';
import { ActionFeedbackView } from '../../src/presentation/action-feedback';
import { Atlas } from '../support/atlas';

// How a fight ended is told in the Story after its blows (OR-259, the first blind cold play's P90): the Story wrote
// "The fight is won." before the badger bled and fell, the act's outcome put first, as an act's result is, and the
// fight's own end line then dropped as said. The two rats on the green, fought through as the page's act is.
describe('a fight in the Story', () => {
  it('tells how it ended after the last of its blows, once', async () => {
    const t = await Atlas.start('danger', 'green');
    const c = t.campaign, before = PlayerView.observe(c), event = await t.session.leg('attack(t__rats)');
    const f = ActionFeedbackView.read(c, event, before);
    const { lines } = PlayTranscript.entry(event, f, { id: 0, said: 'Attack the rats', move: false, moved: false,
      place: 'green', placeName: 'the green', elapsed: event.elapsed });
    const won = lines.indexOf('The fight is won.'), fell = lines.findLastIndex(l => / falls\.$/.test(l));
    expect([f.ended, fell >= 0]).toEqual([true, true]);
    expect(won).toBeGreaterThan(fell);
    expect(lines.filter(l => l === 'The fight is won.')).toHaveLength(1);
  });
});
