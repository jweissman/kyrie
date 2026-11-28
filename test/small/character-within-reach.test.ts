import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tiny } from '../support/tiny';
import { SceneRail } from '../../web/reader/stage/scene-rail';

// Each probe on the kernel and the packages it reads (OR-407).
const start: typeof Tiny.start = (kyr, options = {}) => Tiny.start(kyr, { horizon: [], ...options });

// The company's own page always within reach (the owner's play, 27 November, OR-1685: "I couldn't even access the book
// without the Rail … minimally we may always want the book available, even if tucked away (hover in the bottom right
// to reveal it)"): the one exception to surfaces earned. The engine says so of every resting scene (Rail.keep: the
// page it opens and its words, "Your character"), and the frame draws it at the rail's place, quietly, with nothing
// else of the rail, which is still earned (OR-1491); where the journal is earned, the book's own mark stands instead.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.`;
const drawn = (t: Tiny, shown: string[] = []) => renderToStaticMarkup(createElement(SceneRail.View, { app: {
  state: { frame: { leaf: t.leaf, screen: { ...t.screen, surfaces: shown } } }, props: { query: new URLSearchParams() },
  show: () => undefined, menu: { choices: [] } } as never }));
const marks = (html: string) => [...html.matchAll(/<button[^>]*data-action="([^"]+)"/g)].map(m => m[1]);
describe('the company\'s own page', () => {
  it('is kept within reach with nothing earned, by the engine\'s hint, alone at the rail\'s place', async () => {
    const t = await start(yard, { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior', level: 1,
      backgroundId: 'soldier' }] });
    expect(t.leaf.glance?.rail?.keep).toEqual({ view: 'company', label: 'Your character' });
    const html = drawn(t);
    expect(marks(html)).toEqual(['keep']);
    expect(html).toMatch(/data-slot="rail"/);
    expect(html).toMatch(/aria-label="Your character"/);
  });
  it('gives way to the book\'s own mark where the journal is earned', async () => {
    const t = await start(yard, { party: [{ name: 'Odo', raceId: 'human', classId: 'mage', level: 1,
      backgroundId: 'scribe' }] });
    expect(marks(drawn(t, ['the_journal']))).toEqual(['book']);
  });
});
