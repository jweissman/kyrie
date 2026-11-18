import { describe, expect, it } from 'bun:test';
import { Glob } from 'bun';
import { readFileSync } from 'fs';

// One button on the page: the row every menu draws (ChoiceRow), or an act's glyph (Act.View's other variant). The
// older boxed button with a diamond before its words (reader.css's bare .act) is gone from every page (the owner, 18
// November, OR-81: the Options page "uses our outdated button style (we should trace any instance of this button or
// somehow forbid it globally)"): a class list naming act names choice-row or act-glyph beside it, or is not written.
describe('the page has no button of the older style', () => {
  it('gives the act class to nothing but a row or an act glyph', () => {
    const found: string[] = [];
    for (const f of new Glob('web/reader/**/*.tsx').scanSync('.')) {
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        for (const m of line.matchAll(/className=\{?\s*(["'`])((?:(?!\1).)*)\1/g)) {
          const classes = m[2]!.replace(/\$\{[^}]*\}/g, ' ').split(/\s+/);
          if (classes.includes('act') && !classes.some(c => c === 'choice-row' || c === 'act-glyph')) {
            found.push(`${f}:${i + 1}`);
          }
        }
      });
    }
    expect(found).toEqual([]);
  });
});
