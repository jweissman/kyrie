import { beforeAll, describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Choice } from '../src/ui/choice-list';
import { MenuModel } from '../web/reader/menu-model';
import { Act } from '../web/reader/stage/act';
import { GlanceStage } from '../web/reader/stage/glance';
import { Wayfinder, type Way } from '../web/reader/stage/wayfinder';
import { WorldStage } from '../web/reader/stage/world-stage';
import type { AppState, ReaderApp } from '../web/reader/reader-app';
import { Glanced } from './support/glanced';

// The page where the company stands, as a player sees it: the place at rest, Go… opened over it, and the map's card;
// what is touched in it is kept (a click goes by a way), and nothing is read from it but what the screen shows.
class Page {
  touched: Choice[] = [];
  constructor(public state: AppState) {}
  static at(g: Glanced): Page {
    return new Page({ frame: g.frame(), view: 'here', open: [], cursor: 0, member: '' } as unknown as AppState);
  }
  get menu() { return MenuModel.build(this.state.frame, 'here', this.state.open); }
  get app(): ReaderApp { return this as unknown as ReaderApp; }
  setState(patch: Partial<AppState>) { this.state = { ...this.state, ...patch }; }
  choose(c: Choice) { this.touched.push(c); }
  rest(): string {
    const draw = Act.draw(this.app);
    return renderToStaticMarkup(createElement(GlanceStage.View, { app: this.app, draw, apart: true }));
  }
  go(): string {
    return renderToStaticMarkup(createElement(Wayfinder.View, { app: this.app, draw: Act.draw(this.app) }));
  }
  // Go…'s list as it reads: each heading, and under it each row's words, a marked one with its mark.
  list(): [string, string[]][] {
    return this.go().split('<section class="wf-group">').slice(1).map(sec => [
      Page.text(/<h3>(.*?)<\/h3>/.exec(sec)?.[1]),
      [...sec.matchAll(/<button[^>]*class="wf-row([^"]*)"[\s\S]*?<span class="n">(.*?)<\/span>/g)]
        .map(m => `${Page.text(m[2])}${/\baimed\b/.test(m[1]!) ? ' ◆' : ''}`)]);
  }
  preview(): string { return Page.text(/<aside class="wf-preview"[\s\S]*?<\/aside>/.exec(this.go())?.[0]); }
  where(): string { return Page.text(/<h2>(.*?)<\/h2>/.exec(this.go())?.[1]); }
  row(name: string): Way { return Wayfinder.ways(this.app).find(w => GlanceStage.short(w.name) === name)!; }
  // To a place, where the company is not there already.
  static async walk(g: Glanced, place: string) { if (g.screen.place.id !== place) { await g.to(place); } }
  // A way out into the open country, by its name and which way it goes.
  static out(name: string, bearing: string): Way {
    return { c: { id: `${name}/${bearing}`, label: name }, way: {}, whither: 'Away', name, group: 'Out',
      exit: { bearing } } as unknown as Way;
  }
  static text(html = ''): string {
    return html.replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, '’').replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ').trim();
  }
}

// The owner's play of 7 November, in a generated country come into as Coming Home: gold was everywhere and meant
// nothing ("Go…" in gold, a dot by "Look…", the place the player stood in the one marked way); Go… said "the market"
// was not yet been to, standing on the market-place, and going there came into a shop; and choosing a way wanted
// "Go there" as well. A quarter is come into at its own open place, named as the town names it; a way is marked only
// for the aim followed, never where the company stands; and a click goes.
describe('Go… and the gold, for a player come home', () => {
  let g: Glanced;
  beforeAll(async () => { g = await Glanced.country('kite'); }, 120000);

  it('says the first goal once, on the first page, in so many words', async () => {
    const first = Page.at(g).rest();
    expect(Page.text(/<p class="first-goal"[\s\S]*?<\/p>/.exec(first)?.[0]))
      .toMatch(/^Your first goal Your father went out/);
    // No dot on what does not serve it.
    expect(first).not.toMatch(/class="opener opens-look led"/);
    await Page.walk(g, 'region__s2_green');
    expect(Page.at(g).rest()).not.toContain('Your first goal');
  }, 60000);

  it('sets the town out by its parts as it names them, every shop round its heart, not where you stand', async () => {
    await Page.walk(g, 'region__s2_green');
    const page = Page.at(g), list = new Map(page.list());
    expect(page.where()).toBe('The bridge-foot at Brightbridge');
    // The heart's part of the town is called as the heart is; the shops off it are in it, each by its own name.
    expect([...list.keys()]).toEqual(['In the bridge-foot', 'About Brightbridge', 'Out of Brightbridge']);
    expect(list.get('In the bridge-foot')).toEqual(expect.arrayContaining(['Averil’s chandlery', 'Adran’s wood-yard']));
    expect([...list.values()].flat().filter(n => /^(Market|Green|Bridge-foot)/.test(n))).toEqual([]);
    expect(list.get('About Brightbridge')).toEqual(['Edge of town', 'Waterside']);
    // Nothing is marked as an aim the company follows here, so nothing is said beside the list unasked, and Go… is
    // not marked either.
    expect([...list.values()].flat().some(n => n.endsWith('◆'))).toBe(false);
    expect(page.preview()).toBe('');
    expect(page.rest()).toMatch(/class="opener opens-go"/);
  }, 60000);

  it('goes by a way at one click, to a part of the town at its own open place, which has been', async () => {
    await Page.walk(g, 'region__s2_green');
    const page = Page.at(g);
    // A shut way is not gone by: its reason is said.
    const shut = page.row('Old corn-store');
    Wayfinder.go(page.app, shut);
    expect([page.touched.length, page.preview()]).toEqual([0, expect.stringMatching(/padlock/i)]);
    Wayfinder.go(page.app, page.row('Waterside'));
    expect(page.touched).toHaveLength(1);
    await g.perform(page.touched[0]!.command!);
    const there = Page.at(g);
    expect(there.where()).toBe('The waterside at Brightbridge');
    // From there the heart is listed by its own name, and has been.
    const back = there.row('Bridge-foot');
    expect(back.group).toBe('About Brightbridge');
    there.setState({ hovered: back.c.id });
    expect(there.preview()).toContain('You have been there.');
    expect(there.preview()).not.toMatch(/Market|the green/);
  }, 60000);

  it('opens the map from within the town on where the company stands in it, not at the gate', async () => {
    await Page.walk(g, 'region__s2_chandlery');
    const page = Page.at(g), screen = g.screen;
    const town = screen.region!.areas.find(a => a.kind === 'settlement' && a.here)!;
    const card = Page.text(renderToStaticMarkup(createElement(WorldStage.Town, { app: page.app, screen, town })));
    expect(card).toMatch(/^You are in Brightbridge Averil’s chandlery\. Back to Averil’s chandlery/);
    expect(card).not.toContain('gate');
  }, 60000);

  it('tells apart ways of one name by which way each goes', () => {
    const ways = Wayfinder.distinct([Page.out('the Woods of Draugtaure', 'north-east'),
      Page.out('the Woods of Draugtaure', 'south'), Page.out('the open heath', 'west')]);
    expect(ways.map(w => w.name)).toEqual(['the Woods of Draugtaure, north-east', 'the Woods of Draugtaure, south',
      'the open heath']);
  });
});
