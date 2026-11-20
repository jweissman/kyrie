import { afterEach, describe, expect, it } from 'bun:test';
import { DigitSettle } from '../../web/reader/digit-settle';

// A digit in a conversation is the reply beside it as the rows stand, and only once they have stood a moment (R11-01:
// the replies renumber after each answer, and a number pressed for what had been there did what took its place,
// once informing on Heian). Ruled under talk's four in view (OR-03, ruling 2): the numbers are places, so a digit is
// safe only if it cannot land on rows that changed under it; a digit pressed as they change is refused.
describe('a digit in a conversation', () => {
  afterEach(() => DigitSettle.reset());
  const before = '1=ask_heian|2=ask_road|3=leave', after = '1=inform_on_heian|2=ask_road|3=leave';
  it('is taken on rows that have stood', () => {
    DigitSettle.seen(before, 1000);
    expect(DigitSettle.settled(before, 1000 + DigitSettle.ms)).toBe(true);
  });
  it('is refused on rows an answer has just changed, and taken once they have stood', () => {
    DigitSettle.seen(before, 1000);
    // The answer comes, the rows renumbered, and the key goes down a moment after: refused.
    DigitSettle.seen(after, 5000);
    expect(DigitSettle.settled(after, 5000 + 120)).toBe(false);
    expect(DigitSettle.settled(after, 5000 + DigitSettle.ms)).toBe(true);
  });
  it('is refused where the rows the key goes down on are not the ones last drawn', () => {
    DigitSettle.seen(before, 1000);
    // Drawn anew and not yet seen by the page's effect: the key's own reading of them is their change.
    expect(DigitSettle.settled(after, 9000)).toBe(false);
  });
});
