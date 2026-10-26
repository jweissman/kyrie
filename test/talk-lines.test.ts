import { describe, expect, it } from 'bun:test';
import { Conversation } from '../web/reader/conversation';
import { Words } from '../web/reader/words';
import type { Frame } from '../web/engine/protocol';
import type { Choice } from '../src/ui/choice-list';

// What a conversation keeps of each thing said or done in it: the company's words, then what came of them. An act
// whose telling says it again is said once (the Bushweald play read "Give healing herbs to Erevan" over "Aldith
// gives healing herbs to Erevan").
describe('a conversation\'s lines', () => {
  const frame = (said: string, ...lines: string[]) => ({ leaf: { exchange: { said, notes: [], tone: 'act',
    lines: lines.map(text => ({ text, kind: 'telling' })) } } }) as unknown as Frame;
  const choice = (id: string) => ({ id, label: '' }) as Choice;
  it('keeps the company\'s words over an answer', () => {
    const lines = Conversation.lines(frame('Ask about the child', '‘Three days,’ says Erevan.'), choice('ask'), '');
    expect(lines.map(l => l.kind)).toEqual(['you', 'telling']);
  });
  it('says an act once, by its telling, which names who did it', () => {
    const lines = Conversation.lines(frame('Give healing herbs to Erevan', 'Aldith gives healing herbs to Erevan.',
      'Erevan takes the herbs inside without a word.'), choice('give'), '');
    expect(lines.map(l => l.text)).toEqual(['Aldith gives healing herbs to Erevan.',
      'Erevan takes the herbs inside without a word.']);
    // Told in another verb, it is the same act ("You collect the dyke-reeve's rod for Aldith." over "Aldith takes").
    expect(Conversation.lines(frame('Collect the dyke-reeve’s rod for Aldith', 'Aldith takes the dyke-reeve’s rod.'),
      choice('take'), '').map(l => l.kind)).toEqual(['telling']);
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
