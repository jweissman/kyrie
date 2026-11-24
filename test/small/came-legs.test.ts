import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Glance } from '../../src/presentation/glance';
import { GlanceStage } from '../../web/reader/stage/glance';
import type { Glance as View } from '../../src/presentation/glance-types';
import type { ReaderApp } from '../../web/reader/reader-app';

// A journey's line is told, and its legs open from a control of their own (OR-246, the first blind cold play's P125,
// P130): "By the sea-bank at Gatesend and the gate-yard of Gatesend, to the guest-hall of Gatesend: Day 1, 11:48 a.m."
// had been the disclosure's summary, a line of the log the player was to press. The engine says the control's words
// (Glance.legs) where there are legs to open; the page draws the line as told prose and the words as the control.
const legs = [{ place: 'the sea-bank at Gatesend', at: 'Day 1, 11:40 a.m.' },
  { place: 'the gate-yard of Gatesend', at: 'Day 1, 11:44 a.m.' }, { place: 'the guest-hall of Gatesend', at: 'Day 1, 11:48 a.m.' }];
const travel = { to: 'the guest-hall of Gatesend', arrived: true, legs: legs.map(l => ({ ...l, journey: [], lines: [] })) };
const app = (t?: typeof travel) => ({ state: { frame: { travel: t } } }) as unknown as ReaderApp;
describe('a journey just made', () => {
  it('is told in a line, its legs opened by the engine\'s own words beside it', () => {
    const g = Glance.came({} as View, { ...travel, legs }), line = 'By the sea-bank at Gatesend and the gate-yard of '
      + 'Gatesend, to the guest-hall of Gatesend: Day 1, 11:48 a.m.';
    expect([g.came, g.legs]).toEqual([line, 'The way here…']);
    const html = renderToStaticMarkup(createElement(GlanceStage.Came, { app: app(travel), came: g.came!,
      legs: g.legs! }));
    expect(html).toContain(`<p class="came">${line}</p>`);
    expect(html).toMatch(
      /<details class="came-legs" data-region="journey"><summary data-action="journey">The way here…<\/summary>/);
    expect(html.match(/<summary[^>]*>([^<]*)<\/summary>/)![1]).not.toContain('Gatesend');
  });
  it('has nothing to open where it went in one leg', () => {
    const one = { ...travel, legs: travel.legs.slice(-1) }, g = Glance.came({} as View, one);
    expect([g.came, g.legs]).toEqual(['To the guest-hall of Gatesend: Day 1, 11:48 a.m.', undefined]);
    expect(renderToStaticMarkup(createElement(GlanceStage.Came, { app: app(one), came: g.came! }))).not.toContain('<details');
  });
});
