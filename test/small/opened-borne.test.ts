import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tiny } from '../support/tiny';
import { Glanced } from '../support/glanced';
import { MenuModel } from '../../src/frame/menu-model';
import { Act } from '../../web/reader/stage/act';
import { PlaceStage } from '../../web/reader/stage/place-stage';
import { GlanceStage } from '../../web/reader/stage/glance';
import { SceneModel } from '../../src/ui/scene';
import { Attending } from '../../src/ui/attention';
import type { AppState, ReaderApp } from '../../web/reader/reader-app';

// What an opener is led for is drawn on the row inside it that bears it, and the row that turns a lens's page is
// marked by the rows it turns to (AT-07 §5 step 3, I5): Act.List had drawn an opener's rows with no indicator at all,
// so a tablet lit blue opened onto three plain rows; and a lens's mark read only its first page, its More… neutral.
class Page {
  constructor(public state: AppState) {}
  get menu() { return MenuModel.build(this.state.frame, 'here', this.state.open); }
  get app(): ReaderApp { return this as unknown as ReaderApp; }
  setState(patch: Partial<AppState>) { this.state = { ...this.state, ...patch }; }
  choose() { /* nothing is done from here */ }
  static of(t: Tiny, patch: Partial<AppState> = {}): Page {
    return new Page({ frame: Glanced.of(t.session).frame(), view: 'here', open: [], cursor: 0, member: '', ...patch } as
      unknown as AppState);
  }
}
// Each row drawn, by its id, and the tone of its mark.
const tones = (html: string) => Object.fromEntries(html.split('<button').slice(1).map(b => [
  /data-choice="([^"]+)"/.exec(b)?.[1] ?? /data-action="([^"]+)"/.exec(b)?.[1] ?? '?',
  /--prism:var\(--tone-(\w+)\)/.exec(b.split('</button>')[0]!)?.[1] ?? 'none']));
const tablet = (id: string, teaches: boolean) => `
  Thing ${id} "a wax tablet, ${id}" at lane {
    State shut "A wax tablet lies on the step.".
    State read "Rows of notches.".
    State broken "The tablet is in pieces.".
    State hidden "The tablet is out of sight.".
    Change read "Read the strokes on ${id}" from shut to read.
    Change smash "Smash ${id}" from shut to broken.
    Change hide "Hide ${id} under the step" from shut to hidden.
  }
  ${teaches ? `Observe ${id}_learned at lane of ${id} as reading when state(${id}, read) "A count of oak." teaches oak.` : ''}`;
const lane = (things: string) => `
  Place lane "the lane" is room at 0, 0 outdoors.
  Entity oak: fact "Someone was felling the Hall's oak by night.".
  ${things}
  Company party "You" of 1 at lane.
  Goal false.`;

describe('a container\'s rows bear what it is drawn as', () => {
  it('draws the reading inside a tablet lit blue in blue, and the other two plain', async () => {
    const t = await Tiny.start(lane(tablet('t1', true)));
    const opener = Attending.all(Attending.place(SceneModel.build(t.screen)).subjects.flatMap(s => s.choices))
      .find(c => c.id === 't__t1#look')!;
    const page = Page.of(t, { open: [opener.id] });
    const html = renderToStaticMarkup(createElement(PlaceStage.Opened, { choice: opener, draw: Act.draw(page.app) }));
    const drawn = tones(html), read = Object.keys(drawn).find(k => /Read the strokes/.test(k))!;
    expect(Object.keys(drawn)).toHaveLength(3);
    expect(drawn[read]).toBe('blue');
    expect(Object.entries(drawn).filter(([k]) => k !== read).map(([, v]) => v)).toEqual(['none', 'none']);
  });
  it('marks the things lens\'s More… by the tablets on the pages it turns to', async () => {
    const t = await Tiny.start(lane(['a', 'b', 'c', 'd', 'e', 'f'].map((id, i) => tablet(id, i < 4)).join('\n')));
    const page = Page.of(t, { exploring: 'look' });
    const html = renderToStaticMarkup(createElement(GlanceStage.Lens, { app: page.app, draw: Act.draw(page.app),
      lens: 'things' }));
    const drawn = tones(html), rows = Object.entries(drawn).filter(([k]) => k !== 'lens-page');
    expect(drawn['lens-page']).toBeDefined();
    // Four teach, three rows are in view, each blue (the reading gathered in it): the fourth is on the page More…
    // turns to, and More… is blue for it.
    expect(rows.map(([, v]) => v)).toEqual(['blue', 'blue', 'blue']);
    expect(drawn['lens-page']).toBe('blue');
  });
});
