import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Choice } from '../../src/ui/choice-list';
import type { Promoted } from '../../src/presentation/glance-types';
import type { ReaderApp } from '../../web/reader/reader-app';
import { Act } from '../../web/reader/stage/act';
import { GlanceStage } from '../../web/reader/stage/glance';

// A thing's look among the scene's four opens what can be done with it in place, under it, and never turns the page
// to the thing (the lens step's regression, found twice in the browser: Low Water's channel head and What Tessary
// Owes's notice, where the thing's page was left open with only Back on it). Held here without a browser: the row is
// an opener (aria-expanded) that the menu does not choose, and opened, its acts are the menu's own beneath it.
const look: Choice = { id: 'gate#look', label: 'Look at the channel head', tone: 'thing', command: 'look_at(gate)',
  children: [{ id: 'gate#look/0', label: 'Gauge the Fulling', tone: 'thing', command: 'gauge(gate)' }] };
const promoted: Promoted = { choice: 'gate#look', label: 'Look at the channel head', why: 'present', facets: ['here'],
  tier: 4, aspects: [], marks: [] };
const render = (open: string[]) => {
  const choices = open.includes(look.id) ? [look, ...look.children!] : [look];
  const app = { state: { keyed: false, cursor: 0, open, frame: { leaf: { glance: { acts: [] } }, screen: {} } },
    menu: { choices }, props: { query: new URLSearchParams() }, choose: () => undefined } as unknown as ReaderApp;
  return renderToStaticMarkup(createElement(GlanceStage.Acts, { app, draw: Act.draw(app), acts: [promoted] }));
};

describe('a thing\'s look among the four', () => {
  it('opens in place, not to the thing\'s page', () => {
    const row = /<button[^>]*data-act="gate#look"[^>]*>/.exec(render([]))?.[0] ?? '';
    expect(row).toContain('aria-expanded="false"');
    // Not the menu's choice, which would turn the page to the thing: no place among the menu's choices on it.
    expect(row).not.toContain('data-index');
  });
  it('opened, has what can be done with the thing beneath it, each the menu\'s own', () => {
    const html = render([look.id]);
    expect(html).toContain('aria-expanded="true"');
    expect(html).toMatch(/data-act="gate#look\/0"[^>]*data-index="1"|data-index="1"[^>]*data-act="gate#look\/0"/);
  });
});
