import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TalkStage } from '../../web/reader/stage/talk-stage';
import { LineMoments } from '../../src/presentation/line-moments';

// A check's dice in a conversation are a disclosure under what came of it, never a line of what was said (the owner's
// ruling 1; M22's deployed recording: "Nest makes the persuasion check (d20 17 + charisma 0 = 17 against 13)." among
// the words); and something seen through is light, not a box, kept with the conversation.
describe('a conversation\'s lines', () => {
  it('folds a check\'s dice into How it fell, and nothing else', () => {
    expect(['Nest makes the persuasion check (d20 17 + charisma 0 = 17 against 13).',
      'Nest fails the stealth check (d20 4 + agility 1 = 5 against 12).',
      'Vance is quiet a long time.', 'You make the bed and lie down.'].map(t => !!LineMoments.of(t).roll))
      .toEqual([true, true, false, false]);
    // The page reads what the engine says the line is (AR-05), never its words.
    const html = renderToStaticMarkup(createElement(TalkStage.Lines, { lines: LineMoments.typed([
      { kind: 'speech' as const, text: 'Vance is quiet a long time.' },
      { kind: 'telling' as const, text: 'Nest makes the persuasion check (d20 17 + charisma 0 = 17 against 13).' }]) }));
    expect(html).toMatch(/<details class="how"><summary>How it fell<\/summary><p>Nest makes the persuasion check/);
  });
});
