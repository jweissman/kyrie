import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { DocLinks } from '../../scripts/doc-links';

// The documentation stays findable (the owner, 14 November: the README a mess, still naming old missions, and earlier
// consolidations had not reached the cause). Every link in it and every doc/ path the code cites finds what it names;
// and the entry points say only what lasts: neither the README nor the index names a mission or a date, since what is
// current is said in doc/STATUS.md alone, and they had gone stale with every mission.
const months = 'January|February|March|April|May|June|July|August|September|October|November|December';
const dated = new RegExp(`\\b[Mm]ission[- ]\\d+|\\b20\\d\\d-\\d\\d-\\d\\d\\b|\\b\\d{1,2} (${months})\\b`);

describe('the documentation', () => {
  it('finds what every link names, and every path the code cites', () => {
    expect([...DocLinks.broken(), ...DocLinks.uncited()]).toEqual([]);
  });
  it('says only what lasts at its entry points, and where things stand in STATUS.md alone', () => {
    for (const file of ['README.md', 'doc/README.md']) {
      const text = readFileSync(file, 'utf8');
      expect([file, text.split('\n').filter(l => dated.test(l))]).toEqual([file, []]);
      expect(text).toContain('STATUS.md');
    }
  });
});
