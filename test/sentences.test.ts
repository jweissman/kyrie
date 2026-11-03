import { describe, expect, it } from 'bun:test';
import { Sentences } from '../src/presentation/sentences';

// One way of finding where a sentence ends, for the whole page (the Grand Tour's friction 17: "Mr. Pumphrey" was cut at
// its "Mr.").
describe('sentences', () => {
  it('end at a stop before a capital, not after a title, and keep a closing quote with their sentence', () => {
    expect(Sentences.split('The office of Mr. Pumphrey is shut. A gull sits on the step.'))
      .toEqual(['The office of Mr. Pumphrey is shut.', 'A gull sits on the step.']);
    expect(Sentences.split("'Go on,' says Peg. 'He bites.' Nobody moves."))
      .toEqual(["'Go on,' says Peg.", "'He bites.'", 'Nobody moves.']);
    expect(Sentences.first('St. Aine\'s well is dry. It has been dry a year.')).toBe('St. Aine\'s well is dry.');
    expect(Sentences.split('One line only')).toEqual(['One line only']);
  });
});
