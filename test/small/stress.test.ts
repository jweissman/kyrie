import { describe, expect, it } from 'bun:test';
import { Glob } from 'bun';
import { readFileSync } from 'node:fs';
import { Typography } from '../../src/presentation/typography';

// A word the author stressed, *so*, is set in italics on the page and given plainly by a plain client: "*habit*" had
// been shown as typed, stars and all (round 12, B: T24-19). And every star in the prose the game ships is one of a
// pair: a stray one would be shown as typed.
describe('stress, as the author marks it', () => {
  it('is a run of its own, and plain text keeps the words without the stars', () => {
    expect(Typography.spans('a two-hundred-year *habit* at the stone')).toEqual([{ text: 'a two-hundred-year ' },
      { text: 'habit', stressed: true }, { text: ' at the stone' }]);
    expect(Typography.plain('They *are for* it. 5 * 3, and a lone *.')).toBe('They are for it. 5 * 3, and a lone *.');
    expect(Typography.spans('nothing stressed')).toEqual([{ text: 'nothing stressed' }]);
  });
  it('is paired wherever the shipped prose stresses a word', () => {
    const files = [...new Glob('data/{adventures,situations,generation,goings-on,sites,origins}/**/*.{kyr,kyrt}').scanSync('.')];
    const stray = files.flatMap(f => [...readFileSync(f, 'utf8').matchAll(/"((?:[^"\\]|\\.)*)"/g)]
      .map(m => m[1]!).filter(text => /\*/.test(Typography.plain(text)) && !/\d\s*\*\s*\d|\* *$/.test(text))
      .map(text => `${f}: ${text.slice(0, 80)}`));
    expect(stray).toEqual([]);
  });
});
