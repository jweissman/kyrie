import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Folio } from '../../src/handbook/folio';
import { EncyclopediaHtml } from '../../src/handbook/encyclopedia-html';
import type { Encyclopedia } from '../../src/handbook/encyclopedia';

// The encyclopedia in the game's one register (the owner, 27 November: "a UI that actually harmonizes well with
// itself (the change in tone for the encyclopedia is really galling)"; OR-1830): built beside the game, it is laid
// as the Book's pages are, in the game's own faces and its table's inks, and its words are in the paper's inks alone.
const foundations = readFileSync(join(import.meta.dir, '../../web/reader/foundations.css'), 'utf8');
const token = (name: string): string => new RegExp(`--${name}:\\s*([^;]+);`).exec(foundations)?.[1]?.trim() ?? '';

describe('the encyclopedia in the one register', () => {
  it('speaks in the game\'s two faces', () => {
    expect([Folio.faces.do, Folio.faces.told]).toEqual([token('do'), token('told')]);
    expect(EncyclopediaHtml.css + Folio.book).not.toMatch(/Jost|Futura|Avenir/);
  });
  it('writes on the table in the game\'s table inks', () => {
    const { ivory, dim, accent, edge } = Folio.table;
    expect([ivory, dim, accent, edge]).toEqual([token('ivory'), token('dim'), token('accent'), token('edge')]);
  });
  it('sets its words in the paper\'s inks, never a hue', () => {
    const colours = [...EncyclopediaHtml.css.matchAll(/(?:^|[;{\s])color:\s*([^;}]+)/g)].map(m => m[1]!.trim());
    const inks = new Set(['var(--ink)', 'var(--dim)', 'var(--faint)', 'inherit']);
    expect(colours.filter(c => !inks.has(c))).toEqual([]);
    expect(EncyclopediaHtml.css).not.toMatch(/--link|Folio\.ink\.link|#6B2418/i);
  });
  it('lays its head on the table and its pages on one leaf, as the Book does', () => {
    const book = { chapters: [{ id: 'peoples', title: 'Peoples', lede: [], sections: [] }], where: () => new Map() };
    const page = new EncyclopediaHtml(book as unknown as Encyclopedia).page('A page', '<main></main>', 'peoples');
    expect(page).toMatch(/<body><header class="head">.*<nav class="sheets"[^>]*>.*<\/header>/s);
    expect(page).toContain('</header><div class="leaf"><div class="folio">');
    expect(page).toContain('<a class="sheet-key" href="peoples.html" aria-current="page">Peoples</a>');
  });
});
