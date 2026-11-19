import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Attending } from '../src/ui/attention';
import { SceneModel } from '../src/ui/scene';
import type { Lens } from '../src/presentation/glance-types';
import { MenuModel } from '../web/reader/menu-model';
import { Act } from '../web/reader/stage/act';
import { GlanceStage } from '../web/reader/stage/glance';
import type { AppState, ReaderApp } from '../web/reader/reader-app';
import { Glanced } from './support/glanced';
import { PlaceStage } from '../web/reader/stage/place-stage';
import { MapMenu } from '../web/reader/map-menu';
import { TalkStage } from '../web/reader/stage/talk-stage';

// A lens's rows can be chosen for what they say (the owner's playtest, 19 November, AT-04: an Explore menu of ten
// pages, its first row blank, which took the company back to the landing). Every row drawn, in every lens and among
// the four, along the drove road after every act: words, and either an act whose target is a choice of the scene's
// (data-act, data-choice) or one of the menu's own turns of attention (focus, a page, out of a focus); and the places
// lens at Porthalen's landing gathered by the town's quarters (AT-04's stopgap: ten pages, every way one row).
class Page {
  constructor(public state: AppState) {}
  get menu() { return MenuModel.build(this.state.frame, 'here', this.state.open); }
  get app(): ReaderApp { return this as unknown as ReaderApp; }
  setState(patch: Partial<AppState>) { this.state = { ...this.state, ...patch }; }
  choose() { /* nothing is done from here */ }
  static of(j: Journey): Page {
    return new Page({ frame: Glanced.of(j.session).frame(), view: 'here', open: [], cursor: 0, member: '' } as unknown as
      AppState);
  }
  // Every container a walk draws (AT-04, AT-07 I3): the resting four and each opener among them opened in place;
  // each lens, and each row of it that gathers acts by focus, focused; the map's menu; a talk, where one is open.
  drawn(): Record<string, string> {
    const out: Record<string, string> = { here: this.html(GlanceStage.View, {}) };
    for (const c of this.menu.choices.filter(x => x.children?.length)) {
      this.setState({ open: [c.id] });
      out[`opened ${c.id}`] = this.html(PlaceStage.Opened, { choice: c });
    }
    this.setState({ open: [] });
    for (const [lens, part] of [['places', 'go'], ['things', 'look'], ['people', undefined], ['time', 'wait']] as const) {
      this.setState({ exploring: part, talking: part ? undefined : true, focused: [] });
      out[lens] = this.html(GlanceStage.Lens, { lens: lens as Lens });
      for (const key of [...out[lens].matchAll(/data-action="focus"[^>]*data-choice="([^"]+)"/g)].map(m => m[1]!)) {
        this.setState({ focused: [unescape(key)] });
        out[`${lens} focused ${key}`] = this.html(GlanceStage.Lens, { lens: lens as Lens });
      }
    }
    this.setState({ exploring: undefined, talking: undefined, focused: [] });
    out.map = this.html(MapMenu.View, { screen: this.state.frame!.screen, put: () => undefined });
    const talk = this.menu.talk;
    if (talk) { out.talk = this.html(TalkStage.View, { talk }); }
    return out;
  }
  private html(view: (p: never) => unknown, props: object): string {
    return renderToStaticMarkup(createElement(view as never, { app: this.app, draw: Act.draw(this.app), ...props }));
  }
  // The ids a row may name as its target: every choice of the scene, the lenses' acts and their commands.
  targets(): Set<string> {
    const g = this.state.frame!.leaf.glance!, screen = this.state.frame!.screen;
    const scene = Attending.place(SceneModel.build(screen));
    const lensed = Object.values(g.lenses).flatMap(l => [...l.promoted, ...l.rest,
      ...Object.values(l.leaves ?? {}).flat()]);
    return new Set([...Attending.all([...scene.subjects.flatMap(s => s.choices), ...scene.near, ...scene.far,
      ...scene.you, ...this.menu.choices]).flatMap(c => [c.id, c.command ?? '']), ...lensed.flatMap(a => [a.choice,
      a.command ?? '']), ...g.acts.flatMap(a => [a.choice, a.command ?? '']),
      // The journeys the engine knows from here, which the map's menu sets out on.
      ...[...screen.destinations ?? [], ...screen.around ?? [], ...screen.roads ?? []].map(d => `travel:${d.id}`)]
      .filter(Boolean));
  }
}
// The menu's own turns of attention: rows, no act (see test/small/page-controls).
// The map's own (putting it away, viewing a place on it) and the talk's (turning its page, trade, back from it).
const turns = new Set(['focus', 'defocus', 'lens-page', 'put-away-map', 'map-view', 'more-talk', 'trade', 'trade-back']);
const unescape = (s: string) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
function invalid(page: Page, at: string): string[] {
  const targets = page.targets(), out: string[] = [];
  for (const [lens, html] of Object.entries(page.drawn())) {
    for (const b of html.split('<button').slice(1).map(x => x.split('</button>')[0]!)) {
      const words = b.replace(/^[^>]*>/, '').replace(/<[^>]+>/g, '').trim();
      const act = /data-act="([^"]*)"/.exec(b)?.[1], action = /data-action="([^"]*)"/.exec(b)?.[1];
      const choice = /data-choice="([^"]*)"/.exec(b)?.[1];
      const named = !!act && (targets.has(unescape(act)) || targets.has(unescape(choice ?? '')));
      if (!words) { out.push(`${at} ${lens}: a row with no words (${act ?? action})`); }
      if (!named && !(action && turns.has(action))) { out.push(`${at} ${lens}: ${words} names no target (${act ?? action})`); }
    }
  }
  return out;
}

describe('every row a lens draws has words and a target', () => {
  it('along the drove road, after every act, and the landing\'s ways gathered by quarter', async () => {
    const j = Journey.of(await DrawnWorld.start('iscoed', { origin: 'drove',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
    const landing = Page.of(j);
    landing.setState({ exploring: 'go' });
    const places = renderToStaticMarkup(createElement(GlanceStage.Lens, { app: landing.app, draw: Act.draw(landing.app),
      lens: 'places' }));
    expect(Number(/data-pages="(\d+)"/.exec(places)?.[1] ?? 1)).toBeLessThanOrEqual(3);
    const bad = invalid(Page.of(j), 'the start');
    for (const act of ['Read the notice on the well-post', 'Ask Owain how many head came down', 'To the drove pens',
      'To the Black Rhyne', 'Search', 'travel:drove__customs', 'Tell Mardle where the four bullocks are']) {
      await (act.includes(':') ? j.perform(act) : j.play(act));
      bad.push(...invalid(Page.of(j), act));
    }
    expect(bad).toEqual([]);
  }, 180000);
});
