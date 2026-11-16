import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

// The one choice row (the owner, 16 November: "a stray square between the atlas indicator and the label"): the old
// act's dot (reader.css, `.act::before`) is never drawn on it, for the only indicator is its own mark.
describe('the choice row is bare but for its mark', () => {
  const css = readFileSync('web/reader/menu.css', 'utf8');
  it('hides the act dot on every surface that draws the row', () => {
    for (const surface of ['.shell', '.world-page', '.talk', '.fight', '.field-map']) {
      expect(css).toMatch(new RegExp(`:is\\([^)]*${surface.replace('.', '\\.')}[^)]*\\) \\.choice-row\\.choice-row::before \\{ display: none; \\}`));
    }
  });
});
