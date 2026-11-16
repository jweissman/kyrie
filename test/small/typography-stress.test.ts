import { describe, expect, it } from 'bun:test';
import { Typography } from '../../src/presentation/typography';

// CO-10: a stress mark is an author's, not the player's: a line drawn plainly reads without asterisks.
describe('typography', () => {
  it('never lets a stress mark through as an asterisk, and keeps the word', () => {
    expect(Typography.curl("'a book being *written*,' she says")).toBe('‘a book being written,’ she says');
    expect(Typography.curl('What everything is *for*, and *what it is for*.')).toBe('What everything is for, and what it is for.');
  });
  it('leaves a lone or spaced asterisk alone', () => {
    expect(Typography.curl('2 * 3 = 6')).toBe('2 * 3 = 6');
  });
});
