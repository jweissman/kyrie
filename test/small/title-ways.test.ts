import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TitlePage } from '../../web/reader/title-page';
import { OptionsPage } from '../../web/reader/options-page';

// The title's ways in are the engine's (OR-300, OR-1072): with nothing kept, New Game alone, then Options and Quit,
// the engine's rows too (OR-382), of the same grammar, and no row carries an icon. The encyclopedia is Options' row
// now, still marked at its left in the knowledge blue and with no icon (the owner, 18 November, OR-86: "there
// shouldn't be icons for the encyclopedia; I just meant the left atlas-indicator should be blue").
describe("the title's ways in", () => {
  const opening = { way: () => undefined, kept: () => undefined };
  const app = { state: {}, props: { query: new URLSearchParams() }, opening } as never;
  const html = renderToStaticMarkup(createElement(TitlePage.View, { app }));
  it('offers New Game alone as a way in with nothing kept, then Options and Quit', () => {
    const menu = /<nav class="title-menu"[^>]*>(.*?)<\/nav>/s.exec(html)?.[1] ?? '';
    expect([...menu.matchAll(/data-action="([^"]+)"/g)].map(m => m[1])).toEqual(['begin', 'options', 'quit']);
    expect(menu).toContain('>New Game<');
    // No row carries an icon (the studio's emblem beside the name is the heading's, not a row's).
    expect([...menu.matchAll(/<li>.*?<\/li>/gs)].some(m => m[0].includes('<svg'))).toBe(false);
  });
  // Once earned, in a game paused, by a library stood in (compactification, OR-1243); never on the title.
  it('keeps the encyclopedia in Options, marked in the knowledge blue at its left, with no icon', () => {
    const options = renderToStaticMarkup(createElement(OptionsPage.View, { app: { state: { options: { size: 'usual',
      rolls: 'shown' }, frame: { screen: { surfaces: ['the_encyclopedia'] } } },
    props: { query: new URLSearchParams() } } as never }));
    const row = /<a [^>]*data-action="encyclopedia"[^>]*>(.*?)<\/a>/.exec(options)?.[1] ?? '';
    expect(row).toMatch(/^<i class="prism-bar row-mark" style="--prism:var\(--tone-blue\)"/);
    expect(row).not.toContain('<svg');
    expect(html).not.toContain('encyclopedia');
  });
});
