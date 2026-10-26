import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Moments } from '../web/reader/stage/moments';

// Moments the page sets apart from the run of what happened (Mission 16's brief: vary the rhythm and intensity for
// exceptional events). Something seen through ends a chapter; a level gained is a moment of the person who gains it,
// where the free play read it as one more line after a night's rest.
describe('a moment on the page', () => {
  const told = (...texts: string[]) => {
    const { plain, levels } = Moments.of(texts.map(text => ({ text, kind: 'event' as const })));
    return { plain: plain.map(l => l.text), html: renderToStaticMarkup(createElement(Moments.Levelled, { levels })) };
  };
  it('sets a level gained apart, with what it gave and the development it brings', () => {
    const { plain, html } = told('You sleep the night through at the Drowned Ox.', 'Tamsin reaches level 2 (+7 HP).');
    expect(plain).toEqual(['You sleep the night through at the Drowned Ox.']);
    expect(html).toContain('data-id="levelled"');
    expect(html).toContain('A level gained');
    expect(html).toContain('Tamsin, level 2');
    expect(html).toContain('7 more hit points, and a development to spend on Tamsin’s page.');
  });
  it('sets several gained at once as one moment', () => {
    const { plain, html } = told('Tamsin reaches level 2 (+7 HP).', 'Hild reaches level 2 (+5 HP).');
    expect(plain).toEqual([]);
    expect(html).toContain('Levels gained');
    expect(html).toContain('Tamsin, level 2; Hild, level 2');
  });
});
