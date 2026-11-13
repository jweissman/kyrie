import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import type { Choice } from '../src/ui/choice-list';
import type { ReaderApp } from '../web/reader/reader-app';
import { Act, type Draw } from '../web/reader/stage/act';

// One action system for every act in the world (the owner, 14 November: "fictional actions should not look like links
// in a web document"; register CN-04, census in doc/architecture/mission-21/aesthetic/census.md). Two halves, both
// fast: the act atom as rendered carries the system's marks (data-act, its id; drawn as a row, or as a glyph that keeps
// its own picture); and nowhere in the reader's pages does an element do a world act without that mark, nor is any act
// a bare link. Application navigation (the encyclopedia, the title, the options) may stay a link: it does no act.
const app = { state: { keyed: false, cursor: 0, open: [] }, choose: () => undefined } as unknown as ReaderApp;
const draw = (choices: Choice[]): Draw => ({ app, index: new Map(choices.map((c, i) => [c.id, i])), open: new Set() });
const acts = [{ id: 'talk:wagoner', label: 'Talk to the wagoner', command: 'talk(wagoner)' },
  { id: 'look:cart', label: 'Look at the cart', command: 'look(cart)', disabled: 'it is too dark' }] as Choice[];

describe('the act atom', () => {
  it('draws every act as a row with the system\'s mark, its id', () => {
    const html = renderToStaticMarkup(createElement(Act.List, { choices: acts, draw: draw(acts) }));
    const rows = [...html.matchAll(/<button[^>]*>/g)].map(m => m[0]);
    expect(rows.length).toBe(2);
    for (const [i, row] of rows.entries()) {
      expect(row).toContain(`data-act="${acts[i]!.id}"`);
      expect(row).toMatch(/class="[^"]*\bchoice-row\b/);
    }
  });
  it('draws a glyph (a likeness, a rail mark) with the same mark, not as a row', () => {
    const html = renderToStaticMarkup(createElement(Act.View, { choice: acts[0]!, draw: draw(acts), variant: 'glyph',
      children: createElement('img', { alt: '' }) }));
    expect(html).toContain('data-act="talk:wagoner"');
    expect(html).toMatch(/class="[^"]*\bact-glyph\b/);
    expect(html).not.toMatch(/\bchoice-row\b/);
  });
});

// Every element in the reader's pages: one that does an act in the world (it calls choose, goes by a way, or names a
// choice) carries data-act; and no <a> does one.
interface Found { file: string; line: number; tag: string; why: string }
class Pages {
  static readonly root = join(import.meta.dir, '../web/reader');
  static files(dir = Pages.root): string[] {
    return readdirSync(dir).flatMap(f => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? Pages.files(p) : p.endsWith('.tsx') ? [p] : [];
    });
  }
  // A world act, by what the element does: choose an engine choice (not the map, which is navigation), go by a way,
  // or name a choice it stands for.
  static acts(attrs: string): boolean {
    return /data-choice=/.test(attrs) || /\bchoose\((?!MenuModel\.)/.test(attrs) || /Wayfinder\.go\(/.test(attrs)
      || /onClick:\s*take\b/.test(attrs) || /onClick=\{t\.pick\}/.test(attrs);
  }
  static marked(attrs: string): boolean { return /\bdata-act=|'data-act'/.test(attrs); }
  // Creation's cards are a deck for choosing who you are (the screens study: a separate grammar), not acts in it.
  static scan(): Found[] {
    const out: Found[] = [];
    for (const file of Pages.files().filter(f => !relative(Pages.root, f).startsWith('creation/'))) {
      const text = readFileSync(file, 'utf8');
      const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const visit = (node: ts.Node) => {
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
          const tag = node.tagName.getText(source), attrs = node.attributes.getText(source);
          const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
          const at = { file: relative(Pages.root, file), line, tag };
          if (/^[a-z]/.test(tag) && Pages.acts(attrs) && !Pages.marked(attrs)) {
            out.push({ ...at, why: 'does an act without data-act' });
          }
          if (tag === 'a' && (Pages.acts(attrs) || Pages.marked(attrs))) { out.push({ ...at, why: 'an act drawn as a link' }); }
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
    return out;
  }
}
describe('the reader\'s pages', () => {
  it('draw every world act with the system\'s mark, and none as a link', () => {
    expect(Pages.scan().map(f => `${f.file}:${f.line} <${f.tag}> ${f.why}`)).toEqual([]);
  });
});
