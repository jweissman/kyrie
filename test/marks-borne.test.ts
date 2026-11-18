import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Emphasis } from '../src/presentation/emphasis';
import { MenuModel } from '../web/reader/menu-model';
import { Act } from '../web/reader/stage/act';
import { AtHand } from '../web/reader/stage/at-hand';
import { SceneRail } from '../web/reader/stage/scene-rail';
import { Wayfinder } from '../web/reader/stage/wayfinder';
import type { AppState, ReaderApp } from '../web/reader/reader-app';
import { Glanced } from './support/glanced';

// A mark of the rail says only what the rows it opens bear (the owner, 18 November: Go… gold and with a companion's
// icon, and no row under it either, again; the mark had read the promoted lens, the drawer the Wayfinder's own ways).
// Along the drove road, after every act: the colour on Go… and on Look… is the first, by the one precedence, of the
// colours on their rows, and a companion on the mark is on one of the rows.
class Page {
  constructor(public state: AppState) {}
  get menu() { return MenuModel.build(this.state.frame, 'here', this.state.open); }
  get app(): ReaderApp { return this as unknown as ReaderApp; }
  setState(patch: Partial<AppState>) { this.state = { ...this.state, ...patch }; }
  choose() { /* nothing is gone by from here */ }
  static of(j: Journey): Page {
    return new Page({ frame: Glanced.of(j.session).frame(), view: 'here', open: [], cursor: 0, member: '' } as unknown as
      AppState);
  }
  html(view: typeof Wayfinder.View | typeof AtHand.View): string {
    return renderToStaticMarkup(createElement(view, { app: this.app, draw: Act.draw(this.app) }));
  }
  // What a mark says, and what its rows bear: the tones, in order of precedence, and whether any is a companion.
  static mark(html: string) {
    return { tone: /data-tone="(\w+)"/.exec(html)?.[1], companion: /data-companion="true"/.test(html) };
  }
  static rows(html: string, row: string) {
    const rows = html.split(`class="${row}`).slice(1).map(r => r.split('</button>')[0]!);
    const tones = rows.flatMap(r => [...r.matchAll(/tone-(\w+)/g)].map(m => m[1]!)
      .concat(/^[^"]*\baimed\b/.test(r) ? ['gold'] : []));
    const order = Emphasis.precedence.map(a => Emphasis.tones[a]);
    return { tone: order.find(t => tones.includes(t!)), companion: rows.some(r => /pip-icon companion/.test(r)) };
  }
  check(at: string) {
    const go = Page.mark(renderToStaticMarkup(createElement(SceneRail.Mark, { app: this.app, part: 'go', glyph: 'go_on',
      words: 'Go', standing: SceneRail.go(this.app) })));
    expect({ at, ...go }).toEqual({ at, ...Page.rows(this.html(Wayfinder.View), 'wf-row') });
    const look = SceneRail.look(this.app);
    if ('shut' in look) { return; }
    expect({ at, tone: 'lit' in look ? look.lit?.tone : undefined })
      .toEqual({ at, tone: Page.rows(this.html(AtHand.View), 'ah-row').tone });
  }
}

describe('a mark bears only what its rows bear', () => {
  it('along the drove road, after every act', async () => {
    const j = Journey.of(await DrawnWorld.start('iscoed', { origin: 'drove',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
    const acts = ['Read the notice on the well-post', 'Ask Owain how many head came down', 'To the drove pens',
      'To the Black Rhyne', 'Search', 'travel:drove__customs', 'Tell Mardle where the four bullocks are'];
    Page.of(j).check('the start');
    for (const act of acts) {
      await (act.includes(':') ? j.perform(act) : j.play(act));
      Page.of(j).check(`${act} → ${j.screen().place.name}`);
    }
  }, 180000);
});
