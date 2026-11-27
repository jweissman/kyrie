import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Emphasis } from '../src/presentation/emphasis';
import { MenuModel } from '../src/frame/menu-model';
import { Act } from '../web/reader/stage/act';
import { AtHand } from '../web/reader/stage/at-hand';
import { SceneRail } from '../web/reader/stage/scene-rail';
import { Wayfinder } from '../web/reader/stage/wayfinder';
import { GlanceStage } from '../web/reader/stage/glance';
import type { AppState, ReaderApp } from '../web/reader/reader-app';
import { Glanced } from './support/glanced';

// A mark of the rail says only what the rows it opens bear (the owner, 18 November: Go… gold and with a companion's
// icon, and no row under it either, again; the mark had read the promoted lens, the drawer the Wayfinder's own ways).
// Along the drove road, after every act: the colour on Go… and on Look… is the first, by the one precedence, of the
// colours on their rows, and a companion on the mark is on one of the rows; the lens's too, and a row gathered by
// focus's (the owner, 19 November: a companion on Go… over a lens of ten pages, the shrine's and the Stone Horn's
// rows drawn plain; the mark had read every page, and the lens drew none of them with their companion).
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
  // The lens a touch opens, as the scene draws it (GlanceStage.Lens), and the tones its rows are drawn in.
  lens(part: 'go' | 'look', focused?: string): { tone?: string; companion: boolean; units: string[] } | undefined {
    const lens = part === 'go' ? 'places' : 'things';
    if (!this.state.frame?.leaf.glance?.lenses?.[lens]) { return undefined; }
    const was = this.state;
    this.setState({ exploring: part, focused: focused ? [focused] : undefined });
    const html = renderToStaticMarkup(createElement(GlanceStage.Lens,
      { app: this.app, draw: Act.draw(this.app), lens }));
    this.state = was;
    // What the resting scene led with, kept above the lens in its places (Lensed.kept, OR-240), bears its own mark
    // from the scene's four, and never the touch's (LensRows): the drove pens' way, gold, kept over Look….
    const kept = (this.state.frame?.leaf.glance?.lenses?.[lens]?.kept ?? []).map(k => `data-choice="${k.choice}"`);
    const drawn = html.split('<li').filter(li => !kept.some(k => li.includes(k))).join('<li');
    const tones = [...drawn.matchAll(/--prism:var\(--tone-(\w+)\)/g)].map(m => m[1]!);
    return { tone: Emphasis.precedence.map(a => Emphasis.tones[a]).find(t => tones.includes(t!)),
      companion: /could join you/.test(html),
      units: [...html.matchAll(/data-action="focus" data-choice="([^"]+)"/g)].map(m => m[1]!) };
  }
  check(at: string) {
    const go = Page.mark(renderToStaticMarkup(createElement(SceneRail.Mark, { app: this.app, part: 'go', glyph: 'go_on',
      words: 'Go', standing: SceneRail.go(this.app) })));
    // The places lens is what Go… opens where the glance has one (the owner, 18 November: Go… gold over a lens of two
    // rows, neither gold); the Wayfinder's list where it has none.
    const drawn = this.lens('go');
    if (drawn) { expect({ at, ...go }).toEqual({ at, tone: drawn.tone, companion: drawn.companion }); }
    else { expect({ at, ...go }).toEqual({ at, ...Page.rows(this.html(Wayfinder.View), 'wf-row') }); }
    const look = SceneRail.look(this.app);
    if ('shut' in look) { return; }
    const things = this.lens('look') ?? { tone: Page.rows(this.html(AtHand.View), 'ah-row').tone };
    const lit: string | undefined = 'lit' in look ? look.lit?.tone : undefined;
    expect({ at, tone: lit }).toEqual({ at, tone: things.tone });
    this.gathered(at);
  }
  // A row gathered by focus ("The door…") bears what the rows it opens bear, and nothing else (the owner, 19 November:
  // a row gold, and no gold among what it opened).
  gathered(at: string) {
    for (const part of ['go', 'look'] as const) {
      const drawn = this.lens(part);
      for (const key of drawn?.units ?? []) {
        const was = this.state;
        this.setState({ exploring: part, focused: undefined });
        const row = renderToStaticMarkup(createElement(GlanceStage.Lens, { app: this.app, draw: Act.draw(this.app),
          lens: part === 'go' ? 'places' : 'things' })).split(`data-choice="${key}"`)[1]!.split('</button>')[0]!;
        this.state = was;
        const inside = this.lens(part, key)!, tone = /--prism:var\(--tone-(\w+)\)/.exec(row)?.[1];
        expect({ at, key, tone, companion: /could join you/.test(row) })
          .toEqual({ at, key, tone: inside.tone, companion: inside.companion });
      }
    }
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
