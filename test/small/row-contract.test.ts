import { afterEach, describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChoiceRow } from '../../web/reader/stage/choice-row';
import { RowWords } from '../../web/reader/stage/row-words';

// The one choice row's construction (the owner, 24 November, OR-188: a row drawn beside the menu with no indicator,
// an arrow standing at its left in its words): every row has its indicator, the neutral line where it is nothing in
// particular; its words carry no sign of their own (an arrow, an icon, a glyph, anything drawn only to be seen), its one
// icon given as its glyph. Under test such a row fails the spec that draws it; in play it is said in the console.
const button = (label: Parameters<typeof ChoiceRow.Button>[0]['label'], more: object = {}) =>
  renderToStaticMarkup(createElement(ChoiceRow.Button, { data: { action: 'a' }, label, ...more }));
afterEach(() => { RowWords.strict = false; RowWords.refused.length = 0; });

describe('the one row is made with its indicator and no sign of its own in its words', () => {
  it('draws the neutral indicator where no tone or kind is given', () => {
    expect(button('Out to the churchyard')).toMatch(/<i class="prism-bar row-mark neutral"/);
  });
  it('refuses words that carry a sign of their own', () => {
    RowWords.strict = true;
    const arrow = createElement('span', { className: 'compass-arrow', 'aria-hidden': true }, '←');
    expect(() => button([arrow, 'Out to the churchyard'])).toThrow(/carried a sign of their own/);
    expect(() => button([createElement('span', { 'aria-hidden': 'true' }, '→'), 'On'])).toThrow();
  });
  it('lets an icon be given as the row\'s glyph, and words hidden from a reader stay words', () => {
    RowWords.strict = true;
    expect(button('The rest of the ways', { glyph: 'the_compass' })).toContain('row-glyph');
    expect(() => button(createElement('span', { 'aria-hidden': true }, 'The encyclopedia'))).not.toThrow();
  });
});
