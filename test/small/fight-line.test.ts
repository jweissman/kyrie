import { describe, expect, it } from 'bun:test';
import '../support/tiny';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FightLog } from '../../web/reader/fight-log';

// A fight told one line per actor, cause then effect (the owner, 26 November, the combat experiment's legibility;
// OR-1352): what they did, then what came of it, a breath apart on one line; what anyone said of it a quiet line of
// its own, never run into the blow; an exchange told as one sentence drawn as it was.
describe('a fight\'s line', () => {
  it('is the cause then the effect, and the bark apart', () => {
    const html = renderToStaticMarkup(createElement(FightLog.Line, { exchange: { n: 0, round: 1, detail: '',
      text: 'Hamo hits the first rat, for 2. It falls. Hamo breathes hard.', cause: 'Hamo hits the first rat, for 2.',
      effect: 'It falls.', bark: 'Hamo breathes hard.' } }));
    expect(html).toBe('<p class="exchange"><span class="cause">Hamo hits the first rat, for 2.</span> '
      + '<span class="effect">It falls.</span></p><p class="bark">Hamo breathes hard.</p>');
  });
  it('draws an exchange told as one sentence as that sentence', () => {
    const html = renderToStaticMarkup(createElement(FightLog.Line, { exchange: { n: 0, round: 1, detail: '',
      text: 'The fight is won.' } }));
    expect(html).toBe('<p>The fight is won.</p>');
  });
});
