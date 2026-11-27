import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { OpeningPages } from '../../../src/creation/opening-pages';
import { TitlePage } from '../../../web/reader/title-page';

// Feature pins: see test/features/choice/consequence.pin.test.ts. The title's core four (the owner, 26 November,
// OR-1072: "I was even a little taken aback by how much complexity is creeping back into the title page. I think we
// need to keep 'Continue / New Game / Options / Quit' as the core four there"): the engine's title page offers exactly
// these rows, New Game at the top (the owner's play, 27 November, OR-1683: "'New Game' needs to be at the top"), then
// Continue only where a life is kept to continue, and the page draws those and nothing else that can be pressed.
// Anything more the title might want goes inside Options or New Game.
describe('Interface › The title\'s core four', () => {
  const kept = { where: 'The lane', when: 'Morning, the first day', seed: 'bakelo' };
  it('offers New Game, Continue, Options and Quit, in that order, Continue only with a life to continue', () => {
    expect(OpeningPages.title(kept).rows.map(r => r.label)).toEqual(['New Game', 'Continue', 'Options', 'Quit']);
    // The keys are on the first: New Game.
    expect([OpeningPages.title(kept).chosen, OpeningPages.title().chosen]).toEqual(['begin', 'begin']);
    expect(OpeningPages.title().rows.map(r => r.label)).toEqual(['New Game', 'Options', 'Quit']);
    expect(OpeningPages.title({ ...kept, ended: true }).rows.map(r => r.id)).toEqual(['begin', 'options', 'quit']);
    expect(OpeningPages.title({ ...kept, refused: 'no such world' }).rows.map(r => r.id))
      .toEqual(['begin', 'options', 'quit']);
  });
  it('is drawn as those rows and nothing else to press', () => {
    for (const saved of [undefined, kept]) {
      const app = { state: { phase: 'title', options: {} }, props: { query: new URLSearchParams('dev') },
        opening: { way: () => undefined, kept: () => saved, quit: () => undefined } } as never;
      const html = renderToStaticMarkup(createElement(TitlePage.View, { app }));
      // The studio's mark's Skip, drawn before the title comes up, is the mark's and goes with it.
      const pressed = [...html.matchAll(/<(?:button|a|input|select)\b[^>]*>/g)]
        .map(m => /data-action="([^"]+)"/.exec(m[0])?.[1] ?? '(unnamed)').filter(id => id !== 'skip');
      expect(pressed).toEqual(OpeningPages.title(saved).rows.map(r => r.id));
    }
  });
  it('takes Quit honestly: the game put away, kept, and a way back to the title', () => {
    const closed = OpeningPages.closed(true);
    expect(closed.rows.map(r => r.id)).toEqual(['title']);
    expect(closed.line).toMatch(/kept in this browser/);
    expect(OpeningPages.closed(false).line).not.toMatch(/kept/);
  });
});
