import { describe, expect, it } from 'bun:test';
import { Typography } from '../src/presentation/typography';

// Marks curled as a compositor sets them; a word that has lost its head keeps an apostrophe there ("'em" had become
// an opening quote: Hessel friction 11).
describe('the page set as a book is', () => {
  it('opens and closes quotations, and keeps an apostrophe where a word lost its head', () => {
    expect(Typography.curl(`'Leave 'em be,' she said. "Go on."`)).toBe('‘Leave ’em be,’ she said. “Go on.”');
    expect(Typography.curl(`'Tis the season; rock 'n' roll; the winter of '86`))
      .toBe('’Tis the season; rock ’n’ roll; the winter of ’86');
    expect(Typography.curl(`the word 'bell', and the miller's son`)).toBe('the word ‘bell’, and the miller’s son');
  });
});
