import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Choice } from '../../src/ui/choice-list';
import type { Promoted } from '../../src/presentation/glance-types';
import type { ReaderApp } from '../../web/reader/reader-app';
import { Act } from '../../web/reader/stage/act';
import { GlanceStage } from '../../web/reader/stage/glance';

// A thing's look among the scene's four never turns the page to the thing (the lens step's regression, found twice
// in the browser: Low Water's channel head and What Tessary Owes's notice, where the thing's page was left open
// with only Back on it). It had been an opener that showed its acts beneath it; it is now the act it leads with,
// done at once. Held here without a browser.
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
  // Now the act it leads with, done at once (the owner, 15 November: no compound clusters for perceiving): the row
  // is that act, its own words, never a row that opens a cluster, and still never the thing's page.
  it('is the act it leads with, done at once, and never turns the page to the thing', () => {
    const html = render([]);
    const row = /<button[^>]*data-act="gate#look\/0"[^>]*>/.exec(html)?.[0] ?? '';
    expect(row).not.toBe('');
    expect(row).not.toContain('aria-expanded');
    expect(html).toContain('Gauge the Fulling');
    expect(html).not.toMatch(/data-act="gate#look"/);
  });
  it('stays the look itself where it leads no act, and leads with the act it names where it leads one', () => {
    const bare: Choice = { id: 'gate#look', label: 'Look at the channel head', tone: 'thing', command: 'look_at(gate)' };
    expect(GlanceStage.acted(promoted, bare)).toBe(bare);
    expect(GlanceStage.acted(promoted, look).id).toBe('gate#look/0');
    const two: Choice = { ...look, children: [...look.children!, { id: 'gate#look/1', label: 'Oil it', tone: 'thing',
      command: 'oil(gate)' }] };
    expect(GlanceStage.acted({ ...promoted, for: 'oil(gate)' }, two).id).toBe('gate#look/1');
  });
});
