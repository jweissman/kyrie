import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ColourCensus } from '../support/colour-census';

// A row's words are never cut short (the owner's play, 27 November, OR-1681: "three blue items that are all
// conversation options … I can't tell what any of them actually are because they're cut off"). The one choice row
// (menu.css) had held one line at a fixed height, its words cut to "…" at a desk's width and clamped to two lines on a
// phone's; now a row too narrow for its words grows a line at every width, and only what it says of itself beside them
// (an aside, why it is shut, what it risks) gives way, whole or not at all (RowAside). The page's style sheets read, as
// the colour grammar reads them: no rule on a row's words cuts them, and no choice row is held to one height.
const sheets = readdirSync(ColourCensus.dir).filter(f => f.endsWith('.css'))
  .map(f => [f, ColourCensus.strip(readFileSync(join(ColourCensus.dir, f), 'utf8'))] as const);
// Every rule, its selector and its body, with the @media blocks opened.
const rules = sheets.flatMap(([f, css]) => [...css.replace(/@media[^{]*\{/g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(m => ({ f, selector: m[1]!.trim(), body: m[2]! })));
const cut = /text-overflow:\s*ellipsis|line-clamp|white-space:\s*nowrap/;
describe('a row\'s words', () => {
  it('are cut short by no rule, at any width', () => {
    expect(rules.filter(r => /\.row-label(?![-\w])(?!\s*(small|>|\.))/.test(r.selector) && cut.test(r.body))
      .map(r => `${r.f}: ${r.selector}`)).toEqual([]);
  });
  it('take another line where the row is too narrow, the row growing to hold them', () => {
    const row = rules.filter(r => /\.choice-row\.choice-row\s*$/.test(r.selector.split(',').at(-1)!)
      && /all:\s*unset/.test(r.body));
    expect(row.length).toBe(1);
    expect(row[0]!.body).toMatch(/min-height:\s*var\(--choice-h\)/);
    expect(row[0]!.body).not.toMatch(/(^|[;\s])height:\s*var\(--choice-h\)/);
    const label = rules.filter(r => /\.choice-row\.choice-row > \.row-label\s*$/.test(r.selector)
      && /white-space/.test(r.body));
    expect(label.map(r => /white-space:\s*normal/.test(r.body))).toEqual([true]);
  });
});
