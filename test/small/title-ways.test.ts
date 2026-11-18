import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TitlePage } from '../../web/reader/title-page';

// The title's ways in are rows of one grammar, each marked at its left (the owner, 18 November, OR-86: "there
// shouldn't be icons for the encyclopedia; I just meant the left atlas-indicator should be blue"): the Encyclopedia's
// mark is the knowledge blue, and no row carries an icon.
describe("the title's ways in", () => {
  const opening = { carryOn: () => undefined, anew: () => undefined };
  const app = { state: {}, props: { query: new URLSearchParams() }, opening } as never;
  const html = renderToStaticMarkup(createElement(TitlePage.View, { app }));
  const row = (way: string) => new RegExp(`<a [^>]*data-way="${way}"[^>]*>(.*?)</a>`).exec(html)?.[1] ?? '';
  it('marks the Encyclopedia in the knowledge blue at its left, with no icon', () => {
    expect(row('encyclopedia')).toMatch(/^<i class="prism-bar row-mark" style="--prism:var\(--tone-blue\)"/);
    expect(row('encyclopedia')).not.toContain('<svg');
    expect(html).not.toContain('way-glyph');
  });
});
