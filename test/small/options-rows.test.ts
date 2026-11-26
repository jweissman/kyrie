import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { OptionsPage } from '../../web/reader/options-page';
import { OpeningPages } from '../../src/creation/opening-pages';
import type { ReaderApp } from '../../web/reader/reader-app';

// The options page (OR-143, the owner's playtest of 20 November: "Too many similar items; no icons on grouping…
// Why is the handbook here at all? It seems chaotic"): each setting one row with its emblem, what it is now beside
// it, taken to go on to the next; a save file opened; the encyclopedia, opening apart (the title's row until OR-1072);
// Back. No handbooks: they are an author's. No two rows share an emblem (Letters and Dice had both been an eye).
// The encyclopedia only once the game in play has earned it, by a library stood in (compactification, OR-1243).
describe('the options page', () => {
  const app = { state: { options: { size: 'usual', rolls: 'shown' } }, props: { query: new URLSearchParams() } } as
    unknown as ReaderApp;
  const html = renderToStaticMarkup(createElement(OptionsPage.View, { app }));
  it('is four rows, each with its own emblem, and no handbooks', () => {
    const rows = [...html.matchAll(/<(button|a)\b[^>]*class="choice-row[^>]*>([\s\S]*?)<\/\1>/g)];
    expect(rows.map(r => /data-action="(\w[\w-]*)"/.exec(r[0])![1]))
      .toEqual(['option', 'option', 'load-file', 'back']);
    expect(rows.map(r => /class="row-glyph"/.test(r[2]!))).toEqual([true, true, true, true]);
    // The encyclopedia's row once it is earned, and only then (OR-1243).
    const now = { size: 'usual', rolls: 'shown' } as const;
    expect(OpeningPages.options(now, true).rows.map(r => r.id)).not.toContain('encyclopedia');
    expect(OpeningPages.options(now, true, true).rows.map(r => r.id)).toContain('encyclopedia');
    const glyphs = OpeningPages.options({ size: 'usual', rolls: 'shown' }, false).rows.flatMap(r => r.glyph ?? []);
    expect(new Set(glyphs).size).toBe(glyphs.length);
    expect(html).not.toMatch(/handbook/i);
  });
  it('says what each setting is now, and goes on to the next, round again after the last', () => {
    expect(html).toContain('data-key="size" data-id="larger"');
    expect(html).toContain('data-key="rolls" data-id="hidden"');
    expect(html).toMatch(/Usual/);
    const next = (size: 'smaller' | 'usual' | 'larger') => OpeningPages.options({ size, rolls: 'shown' }, false).rows[0]!.id;
    expect((['smaller', 'usual', 'larger'] as const).map(next))
      .toEqual(['option:size:usual', 'option:size:larger', 'option:size:smaller']);
  });
});
