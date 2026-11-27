import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Promoted } from '../../src/presentation/glance-types';
import { Doable } from '../../src/presentation/doable';
import type { AppState, ReaderApp } from '../../web/reader/reader-app';
import { MenuModel } from '../../src/frame/menu-model';
import { Act } from '../../web/reader/stage/act';
import { GlanceStage } from '../../web/reader/stage/glance';
import { Tiny } from '../support/tiny';
import { Glanced } from '../support/glanced';
import { Conversation } from '../../web/reader/conversation';

// A thing's look among the scene's four does what the engine's one row for it does (Doable, TB-12; AT-07 step 4): the
// one act under it where it holds only that, done at once; else it turns to the thing's own page of flat acts, where
// it had opened in place under its own words (OR-1295: one flat level outside a fight; the thing's page has more than
// Back on it, the regression of Low Water's channel head and What Tessary Owes's notice). It is never done by
// its first act, a guess of the page's own (CL-34: the speaking door's look done as "Push and pull").
class Page {
  constructor(public state: AppState) {}
  get menu() { return MenuModel.build(this.state.frame, 'here', this.state.open); }
  get app(): ReaderApp { return this as unknown as ReaderApp; }
  setState(patch: Partial<AppState>) { this.state = { ...this.state, ...patch }; }
  choose() { /* nothing is done from here */ }
  static of(t: Tiny): Page {
    return new Page({ frame: Glanced.of(t.session).frame(), view: 'here', open: [], cursor: 0, member: '' } as
      unknown as AppState);
  }
}
const lane = `
  Place lane "the lane" is room at 0, 0 outdoors.
  Thing well "a well" at lane {
    State full "A well, its bucket down.".
    State drawn "The bucket is up.".
    Change draw "Draw up the bucket" from full to drawn.
  }
  Thing tablet "a wax tablet" at lane {
    State shut "A wax tablet lies on the step.".
    State read "Rows of notches.".
    State broken "The tablet is in pieces.".
    Change read "Read the strokes" from shut to read.
    Change smash "Smash the tablet" from shut to broken.
  }
  Company party "You" of 1 at lane.
  Goal false.`;
const led = (choice: string, more: Partial<Promoted> = {}): Promoted => ({ choice, label: choice, why: 'present',
  facets: ['here'], tier: 4, aspects: [], marks: [], ...more });

describe('a thing\'s look among the four', () => {
  it('is the one act under it, done at once, where it holds only that', async () => {
    const t = await Tiny.start(lane), page = Page.of(t), look = GlanceStage.choice(page.app, 't__well#look')!;
    const done = GlanceStage.acted(page.app, led(look.id), look);
    expect(done.command).toBe(Doable.one(t.glance, t.screen, look.id).does!);
    expect(done.id).not.toBe(look.id);
  });
  // Where it holds more, it is one row, and pressed it turns to the thing's own page of flat acts (the playtest,
  // 26 November, OR-1295: "Unfolding menus only in a fight"; "Look at the bronze ring" had opened its acts beneath it),
  // never done by its first act.
  it('is one row where it holds more, which turns to the thing\'s own page, never unfolding under it', async () => {
    const t = await Tiny.start(lane), page = Page.of(t), look = GlanceStage.choice(page.app, 't__tablet#look')!;
    expect(look.children).toBeUndefined();
    expect(GlanceStage.acted(page.app, led(look.id), look)).toBe(look);
    const html = renderToStaticMarkup(createElement(GlanceStage.Acts, { app: page.app, draw: Act.draw(page.app),
      acts: [led(look.id)] }));
    expect(/data-act="t__tablet#look"/.test(html)).toBe(true);
    expect(html).not.toContain('aria-expanded');
    expect(Conversation.turn(look)).toEqual({ kind: 'thing', id: 't__tablet' });
  });
});
