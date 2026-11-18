import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

// The Book's mark says what is unread by a count in ivory, never by a pip of the Atlas's tones: what is written down is
// no opportunity to act (the owner's trust contracts, 18 November, D: its blue or violet pip read as a lens's promise).
describe('the Book\'s unread mark', () => {
  it('is a count, with no Atlas pip nor tone', () => {
    const news = readFileSync('web/reader/news.tsx', 'utf8');
    const mark = news.slice(news.indexOf('static Pip('), news.indexOf('static Read('));
    expect(mark).toContain('className="unread"');
    expect(mark).not.toMatch(/Pip\.View|--tone-/);
  });
});
