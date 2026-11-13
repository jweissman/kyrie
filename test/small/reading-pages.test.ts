import { describe, expect, it } from 'bun:test';
import { PrologueStage } from '../../web/reader/stage/prologue-stage';

// A page with nothing to decide on it goes on by itself once read (the owner, 14 November, CN-09: "Go on" after the
// road meeting is no act at all): given a reader's pace over its words, never less than a few seconds nor more than
// a few more.
describe('a page that is only read', () => {
  it('is given time by its words, within bounds', () => {
    const words = (n: number) => Array.from({ length: n }, () => 'word').join(' ');
    expect(PrologueStage.reading('')).toBe(3500);
    expect(PrologueStage.reading(words(20))).toBe(2000 + 20 * 240);
    expect(PrologueStage.reading(words(30))).toBeGreaterThan(PrologueStage.reading(words(20)));
    expect(PrologueStage.reading(words(500))).toBe(14000);
  });
});
