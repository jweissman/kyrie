import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Glob } from 'bun';
// The language loaded whole before the page's modules (OR-542: Kyr's entry loaded first is half-made).
import '../support/tiny';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { KeyLabels } from '../../web/reader/key-labels';
import { ChoiceRow } from '../../web/reader/stage/choice-row';

// The keys' labels shown to a hand that can press them (OR-1560): a row's number, and a fight's T and Esc, had been
// hidden by `@media (hover: none)` alone, in three rules of three sheets: a property of the device, not of the hand in
// use, so always on a phone with a keyboard beside it and never on a touch laptop being touched. The last input says
// which hand is in use, set once on the root for every page; the labels stay aria-hidden, the rows' words and the keys
// untouched.
describe('the keys\' labels', () => {
  it('are a finger\'s to hide and a key\'s or a mouse\'s to show, by the last input', () => {
    expect(KeyLabels.touching({ type: 'pointerdown', pointerType: 'touch' })).toBe(true);
    expect(KeyLabels.touching({ type: 'pointerdown', pointerType: 'pen' })).toBe(true);
    expect(KeyLabels.touching({ type: 'pointerdown', pointerType: 'mouse' })).toBe(false);
    expect(KeyLabels.touching({ type: 'keydown', key: '1' })).toBe(false);
    expect(KeyLabels.touching({ type: 'keydown', key: 'ArrowDown' })).toBe(false);
    // A modifier alone, or a name typed into a field (a phone's own keyboard), says nothing of the hand.
    expect(KeyLabels.touching({ type: 'keydown', key: 'Shift' })).toBeUndefined();
    expect(KeyLabels.touching({ type: 'keydown', key: 'a', target: { tagName: 'INPUT' } })).toBeUndefined();
    expect(KeyLabels.touching({ type: 'keydown', key: 'a', target: { isContentEditable: true } })).toBeUndefined();
  });
  it('are hidden in one place for every page, by the root\'s mark, never by hover alone', () => {
    const sheets = [...new Glob('web/reader/**/*.css').scanSync('.')].sort()
      .map(file => ({ file, text: readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '') }));
    const media = /@media[^{]*hover:\s*none[^{]*\{([^@]*?\}\s*)\}/g;
    const byHover = sheets.flatMap(({ file, text }) => [...text.matchAll(media)]
      .filter(m => /row-key|kbd|\.key\b/.test(m[1]!)).map(() => file));
    expect(byHover).toEqual([]);
    const hiding = sheets.flatMap(({ file, text }) => [...text.matchAll(/([^{}]*row-key[^{}]*)\{([^{}]*)\}/g)]
      .filter(m => /display:\s*none/.test(m[2]!)).map(m => `${file}: ${m[1]!.trim()}`));
    // The one rule, and a conversation's replies, which are said by their words and never numbered.
    expect(hiding).toEqual(['web/reader/menu.css: :root[data-touch] .row-key.row-key.row-key',
      'web/reader/talk.css: .talk .replies .row-key, .talk .leave .row-key']);
    expect(readFileSync('web/reader/reader-app.tsx', 'utf8')).toContain('KeyLabels.attach()');
  });
  it('are drawn for the eye alone, the row\'s words its own', () => {
    const row = renderToStaticMarkup(createElement(ChoiceRow.Parts, { label: 'Draw a bucket', number: 2 }));
    expect(row).toContain('<kbd class="key row-key" aria-hidden="true">2</kbd>');
    expect(row).toContain('Draw a bucket');
  });
});
