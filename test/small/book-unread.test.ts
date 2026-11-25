import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

// The Book's mark says something is unread by a pip in ivory, or nothing; never a count (the owner, 25 November,
// OR-513: "just a pip or not, no counter"), and never a pip of the Atlas's tones: what is written down is no
// opportunity to act (the owner's trust contracts, 18 November, D: its blue or violet pip read as a lens's promise).
describe('the Book\'s unread mark', () => {
  it('is a pip or none, with no count, no Atlas pip nor tone', () => {
    const news = readFileSync('web/reader/news.tsx', 'utf8');
    const mark = news.slice(news.indexOf('static Pip('), news.indexOf('static Read('));
    expect(mark).toContain('className="unread"');
    expect(mark).not.toMatch(/Pip\.View|--tone-|\{news\.length\}<\/span>|news\.length\} new/);
    expect(readFileSync('web/reader/rest.css', 'utf8')).not.toMatch(/\.unread \{[^}]*font:/);
  });
});
