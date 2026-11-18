import { describe, expect, it } from 'bun:test';
import { Glob } from 'bun';
import { readFileSync } from 'fs';

// No hover text anywhere (the owner, 18 November, OR-79: Continue on the title page had a tooltip; "in general there
// should be no hovertext anywhere"). What a mark or a row means is said on the page, or to a reader by its aria-label;
// a frame's title, which names it to a reader and is never shown on hover, is the one title the page keeps.
describe('the page has no hover text', () => {
  it('sets no title attribute on anything but a frame', () => {
    const found: string[] = [];
    for (const f of new Glob('web/**/*.tsx').scanSync('.')) {
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        // A component's own title prop (<Literary.Side title=…>) is no attribute of the page.
        if (/\stitle=(\{|")/.test(line) && !/<iframe/.test(line) && !/<[A-Z][\w.]*\s[^<]*title=/.test(line)) {
          found.push(`${f}:${i + 1}`);
        }
      });
    }
    expect(found).toEqual([]);
  });
});
