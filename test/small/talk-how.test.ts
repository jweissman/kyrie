import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TalkStage } from '../../web/reader/stage/talk-stage';

// A check's dice in a conversation are a disclosure under what came of it, never a line of what was said (the owner's
// ruling 1; M22's deployed recording: "Nest makes the persuasion check (d20 17 + charisma 0 = 17 against 13)." among
// the words); and something seen through is light, not a box, kept with the conversation.
describe('a conversation\'s lines', () => {
  it('folds a check\'s dice into How it fell, and nothing else', () => {
    expect(['Nest makes the persuasion check (d20 17 + charisma 0 = 17 against 13).',
      'Nest fails the stealth check (d20 4 + agility 1 = 5 against 12).',
      'Vance is quiet a long time.', 'You make the bed and lie down.'].map(t => TalkStage.check.test(t)))
      .toEqual([true, true, false, false]);
    const html = renderToStaticMarkup(createElement(TalkStage.Lines, { lines: [
      { kind: 'speech', text: 'Vance is quiet a long time.' },
      { kind: 'telling', text: 'Nest makes the persuasion check (d20 17 + charisma 0 = 17 against 13).' }] }));
    expect(html).toMatch(/<details class="how"><summary>How it fell<\/summary><p>Nest makes the persuasion check/);
  });
});
