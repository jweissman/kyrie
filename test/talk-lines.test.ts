import { describe, expect, it } from 'bun:test';
import { Conversation } from '../web/reader/conversation';
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
  });
});
