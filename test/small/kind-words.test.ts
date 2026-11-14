import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Choice } from '../../src/ui/choice-list';
import type { Promoted } from '../../src/presentation/glance-types';
import type { ReaderApp } from '../../web/reader/reader-app';
import { Act } from '../../web/reader/stage/act';
import { GlanceStage } from '../../web/reader/stage/glance';
import { Pip } from '../../web/reader/stage/pip';

// What kind of thing a choice is ("to learn", "to gain", "worth a look", "an aim") is its mark's to say, and the words
// are for a reader of the page alone (the blind playtest of 13 November, BP-08): the row's visible words are the act's
// and what it adds; the kind is in the hidden text; and a pip has no tooltip of it.
const ask: Choice = { id: 'wat#talk/0', label: 'Ask about the well', tone: 'person', command: 'ask(wat, well)' };
const led = (note: string): Promoted => ({ choice: ask.id, label: ask.label, note, why: 'named', facets: ['here'], tier: 1,
  aspects: ['knowledge'], marks: [] });
const render = (note: string) => {
  const frame = { leaf: { glance: { acts: [] } }, screen: { exits: [], party: [] } };
  const app = { state: { keyed: false, cursor: 0, open: [], frame }, menu: { choices: [ask], scene: { subjects: [] } },
    props: { query: new URLSearchParams() }, choose: () => undefined } as unknown as ReaderApp;
  return renderToStaticMarkup(createElement(GlanceStage.Acts, { app, draw: Act.draw(app), acts: [led(note)] }));
};
const seen = (html: string) => html.replace(/<span class="sr-only">[^<]*<\/span>/g, '').replace(/<[^>]+>/g, ' ');

describe('the kind of a choice', () => {
  it('is said to a reader of the page, not on it', () => {
    for (const kind of ['to learn', 'an aim', 'worth a look', 'for you']) {
      const html = render(kind);
      expect([kind, seen(html).includes(kind)]).toEqual([kind, false]);
      expect(html).toContain(`<span class="sr-only">${kind}</span>`);
    }
  });
  it('leaves what a choice adds on the page', () => {
    expect(seen(render('with Wat'))).toContain('with Wat');
  });
  it('is no tooltip on a pip', () => {
    const pip = renderToStaticMarkup(createElement(Pip.View, { fill: 'var(--tone-blue)', label: 'to learn' }));
    expect([pip.includes('aria-label="to learn"'), pip.includes('title=')]).toEqual([true, false]);
  });
});
