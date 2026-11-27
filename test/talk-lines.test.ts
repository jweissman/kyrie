import { describe, expect, it } from 'bun:test';
import { TalkLines } from '../src/frame/talk-lines';
import { Words } from '../src/presentation/words';
import type { Frame } from '../src/creation/protocol';
import type { Choice } from '../src/ui/choice-list';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TalkStage } from '../web/reader/stage/talk-stage';
import type { TalkLine } from '../src/frame/talk-lines';

// What a conversation keeps of each thing said or done in it: the company's words, then what came of them. An act
// whose telling says it again is said once (the Bushweald play read "Give healing herbs to Erevan" over "Aldith
// gives healing herbs to Erevan").
describe('a conversation\'s lines', () => {
  const frame = (said: string, ...lines: string[]) => ({ leaf: { exchange: { said, notes: [], tone: 'act',
    lines: lines.map(text => ({ text, kind: 'telling' })) } } }) as unknown as Frame;
  const choice = (id: string) => ({ id, label: '' }) as Choice;
  // A thing learned in the very words of the aim it took up is said once, as the aim (the second blind playtest,
  // BL-09: one sentence under "You know now" and again under "Noted, further off").
  it('says once what was learned in the words of an aim taken up', () => {
    const text = 'The sister was last seen on the Hollow road.';
    const f = { leaf: { exchange: { said: 'Ask about the sister', tone: 'act', lines: [], notes: [text], learned: [text],
      aims: [{ id: 'sister', text }] } } } as unknown as Frame;
    expect(TalkLines.lines(f, choice('ask'), '').map(l => [l.kind, l.text])).toEqual([['you', 'Ask about the sister'],
      ['aim', text]]);
  });
  // Asked again, what was said back word for word earlier in the conversation is told as said again, its words still
  // above (BL-09: "Ask again" replayed the whole speech); a new answer is said whole.
  it('says an answer heard already in this conversation as said again', () => {
    const speech = (said: string, text: string) => ({ leaf: { exchange: { said, notes: [], tone: 'act',
      lines: [{ text, kind: 'speech' }] } } }) as unknown as Frame;
    const answer = '‘The ford went in the spring floods, and the alders with it, and nobody has crossed since,’ says Osric.';
    const first = TalkLines.lines(speech('Ask about the ford', answer), choice('ask'), '');
    const again = TalkLines.lines(speech('Ask about the ford again', answer), choice('ask_again'), '', first);
    const other = TalkLines.lines(speech('Ask about the eels', '‘Fat this year,’ says Osric.'), choice('eels'), '', first);
    expect(again.map(l => [l.kind, l.text])).toEqual([['you', 'Ask about the ford again'],
      ['telling', TalkLines.again]]);
    expect(other.map(l => l.kind)).toEqual(['you', 'speech']);
  });
  it('keeps the company\'s words over an answer', () => {
    const lines = TalkLines.lines(frame('Ask about the child', '‘Three days,’ says Erevan.'), choice('ask'), '');
    expect(lines.map(l => l.kind)).toEqual(['you', 'telling']);
  });
  it('says an act once, by its telling, which names who did it', () => {
    const lines = TalkLines.lines(frame('Give healing herbs to Erevan', 'Aldith gives healing herbs to Erevan.',
      'Erevan takes the herbs inside without a word.'), choice('give'), '');
    expect(lines.map(l => l.text)).toEqual(['Aldith gives healing herbs to Erevan.',
      'Erevan takes the herbs inside without a word.']);
    // Told in another verb, it is the same act ("You collect the dyke-reeve's rod for Aldith." over "Aldith takes").
    expect(TalkLines.lines(frame('Collect the dyke-reeve’s rod for Aldith', 'Aldith takes the dyke-reeve’s rod.'),
      choice('take'), '').map(l => l.kind)).toEqual(['telling']);
  });
  // The whole conversation on one page, scrolled as one (OR-149, the owner's playtest: no nested scroll regions; it
  // had folded away what was said before the last three things said, round 7's ever-growing log).
  it('keeps what was said whole, nothing folded away above', () => {
    const lines: TalkLine[] = [1, 2, 3, 4, 5].flatMap(n => [{ kind: 'you', text: `Question ${n}` },
      { kind: 'speech', text: `Answer ${n}` }]);
    const html = renderToStaticMarkup(createElement(TalkStage.Lines, { lines }));
    expect(html).not.toContain('details');
    expect(['Question 1', 'Answer 2', 'Question 5'].every(t => html.includes(t))).toBe(true);
  });
});

// What a close look found becomes part of how a thing is told, and is not told again as what came of looking (the
// Bushweald play read the cart's gouged bed twice on one page).
describe('a thing\'s page', () => {
  it('tells what a close look found once, as part of the thing', () => {
    const seen = ['A cart stands under a tarpaulin with its shafts down. The cart is built for more than wool: its axle '
      + 'would carry a millstone.'];
    const lines = [{ text: 'You look closely at the cart.' }, { text: 'The cart is built for more than wool: its axle '
      + 'would carry a millstone.' }];
    expect(Words.untold(lines, seen).map(l => l.text)).toEqual(['You look closely at the cart.']);
  });
});
