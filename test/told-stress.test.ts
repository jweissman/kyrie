import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Told } from '../web/reader/stage/told';

// A word the author set *so* is read in italics on the page, its stars gone (Typography.spans; round 12, B: T24-19
// had shown "*habit*" as typed); a lone star is no mark, and the words are curled as everywhere.
describe('a stressed word on the page', () => {
  const said = (text: string) => renderToStaticMarkup(createElement(Told.Said, { text }));
  it('is set in italics, without its stars', () => {
    expect(said('It is a *habit*, not a rule.')).toBe('It is a <em>habit</em>, not a rule.');
  });
  it('leaves a lone star and plain words as they are, curled', () => {
    expect(said('Five * three')).toBe('Five * three');
    expect(said("'Hobs,' people say.")).toBe('‘Hobs,’ people say.');
  });
});
