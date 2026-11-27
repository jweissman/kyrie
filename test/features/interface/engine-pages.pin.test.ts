import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { OpeningPages } from '../../../src/creation/opening-pages';
import { Identity } from '../../../src/presentation/identity';
import { TerminalCreation } from '../../../src/cli/terminal-creation';
import { TerminalPlay } from '../../../src/cli/terminal-play';
import { TitlePage } from '../../../web/reader/title-page';
import { OptionsPage } from '../../../web/reader/options-page';
import type { ReaderApp } from '../../../web/reader/reader-app';

// Feature pins: see test/features/choice/consequence.pin.test.ts. The pages before play are the engine's (the owner's
// ruling on OR-382, 24 November: "every screen in the app is just the engine telling the presentation layer what to
// do within a fixed, simple layout with different hints"): the title, how a life begins and Options are each a
// question, its rows and its hints (OpeningPages); the page draws those rows and no others, and the terminal asks the
// same rows as numbered lines.
const kept = { where: 'The lane', when: 'Morning, the first day', seed: 'bakelo' };
const app = (phase: string, extra: Record<string, unknown> = {}) => ({ state: { phase, options: { size: 'usual',
  rolls: 'shown' }, ...extra }, props: { query: new URLSearchParams() },
opening: { way: () => undefined, kept: () => kept, beginAs: () => undefined, where: () => ({ kept: kept.seed }) } }) as
  unknown as ReaderApp;
const actions = (html: string) => [...html.matchAll(/data-action="([\w-]+)"/g)].map(m => m[1]);
// The title's rows, its menu (the studio's mark before it has its own Skip, which is the mark's, not the page's).
const menu = (html: string) => actions(/<nav class="title-menu[\s\S]*?<\/nav>/.exec(html)![0]);
describe('Interface › Pages the engine draws', () => {
  it('gives the title its rows and hints: the ways in, Options and Quit, over the embers, its name heading', () => {
    expect(OpeningPages.title().rows.map(r => r.id)).toEqual(['begin', 'options', 'quit']);
    const page = OpeningPages.title(kept);
    expect(page.rows.map(r => r.id)).toEqual(['begin', 'continue', 'options', 'quit']);
    expect(page.hints).toEqual({ backdrop: 'embers', heading: 'name' });
    // Its line under the name, the engine's words (OR-529), drawn under the heading with the studio's emblem beside it.
    expect(page.line).toBe(Identity.line);
    const drawn = renderToStaticMarkup(createElement(TitlePage.View, { app: app('title') }));
    expect(drawn).toContain(`<p class="title-line">${Identity.line}</p>`);
    expect(drawn).toMatch(/<h1 class="mark"[^>]*><svg class="mark-glyph"/);
    expect(OpeningPages.begin().rows.map(r => r.id)).toEqual(['build', 'set-out-now', 'back']);
    expect(OpeningPages.begin({ kept: 'bakelo' }).rows.map(r => r.id)).toEqual(['build', 'set-out-now', 'back']);
    // No map asked (OR-1271): the acts that set out say the saved game is replaced then.
    expect(OpeningPages.begin({ kept: 'bakelo' }).rows[0]!.say).toMatch(/saved game is replaced as this life sets out/);
    // Options and the Book are the backstage's folio, by the engine's hint, which the frame applies (OR-1073).
    expect(OpeningPages.options({ size: 'usual', rolls: 'shown' }, false).hints.theme).toBe('folio');
  });
  it('is drawn by the page as the engine gives it, no row of the page\'s own', () => {
    const title = renderToStaticMarkup(createElement(TitlePage.View, { app: app('title') }));
    expect(menu(title)).toEqual(OpeningPages.title(kept).rows.map(r => r.id));
    const begin = renderToStaticMarkup(createElement(TitlePage.View, { app: app('begin') }));
    expect(menu(begin)).toEqual(OpeningPages.begin({ kept: kept.seed }).rows.map(r => r.id));
    const closed = renderToStaticMarkup(createElement(TitlePage.View, { app: app('closed') }));
    expect(menu(closed)).toEqual(OpeningPages.closed(true).rows.map(r => r.id));
    const options = renderToStaticMarkup(createElement(OptionsPage.View, { app: app('options') }));
    const rows = OpeningPages.options({ size: 'usual', rolls: 'shown' }, false).rows;
    expect(actions(options)).toEqual(rows.map(r => r.id.startsWith('option:') ? 'option' : r.id));
    expect(options).toContain('data-theme="folio"');
    const paused = renderToStaticMarkup(createElement(OptionsPage.View, { app: app('options', { frame: {} }) }));
    expect(actions(paused).slice(-2)).toEqual(['back', 'title']);
  });
  it('is asked in the terminal by the same rows, Options said to be the page\'s', async () => {
    const said: string[] = [], answers = ['3', '1'];
    const input = { ask: async () => answers.shift() ?? null, close: () => undefined };
    const page = OpeningPages.title(kept);
    const say = (line: string) => { said.push(line); };
    const way = await TerminalPlay.way(page, new TerminalCreation(input, say), say);
    expect(way).toBe('begin');
    expect(said.filter(l => /^ {2}\d\. /.test(l)).slice(0, 4).map(l => l.replace(/^ {2}\d\. | \*$/g, '')))
      .toEqual(page.rows.map(r => r.label));
    expect(said.filter(l => l === TerminalPlay.apart.options)).toHaveLength(1);
  });
});
