import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TitlePage } from '../../web/reader/title-page';

// The title says only Play (the owner, 23 November, OR-160): its menu is the one row, and Options and the encyclopedia
// stand at its foot, rows of the same grammar, each marked at its left (the owner, 18 November, OR-86: "there
// shouldn't be icons for the encyclopedia; I just meant the left atlas-indicator should be blue"): the Encyclopedia's
// mark is the knowledge blue, and no row carries an icon.
describe("the title's ways in", () => {
  const opening = { play: () => undefined, kept: () => undefined };
  const app = { state: {}, props: { query: new URLSearchParams() }, opening } as never;
  const html = renderToStaticMarkup(createElement(TitlePage.View, { app }));
  const row = (way: string) => new RegExp(`<a [^>]*data-way="${way}"[^>]*>(.*?)</a>`).exec(html)?.[1] ?? '';
  it('offers Play alone in its menu', () => {
    const menu = /<nav class="title-menu"[^>]*>(.*?)<\/nav>/s.exec(html)?.[1] ?? '';
    expect([...menu.matchAll(/data-action="([^"]+)"/g)].map(m => m[1])).toEqual(['begin']);
    expect(menu).toContain('>Play<');
  });
  it('marks the Encyclopedia in the knowledge blue at its left, with no icon', () => {
    expect(row('encyclopedia')).toMatch(/^<i class="prism-bar row-mark" style="--prism:var\(--tone-blue\)"/);
    expect(row('encyclopedia')).not.toContain('<svg');
    expect(html).not.toContain('way-glyph');
  });
});
