import { describe, expect, it } from 'bun:test';
import { Atlas, type Kind, type Where } from '../support/atlas';
import { Glanced } from '../support/glanced';
import { MenuModel } from '../../web/reader/menu-model';
import { GlanceStage } from '../../web/reader/stage/glance';
import type { ReaderApp } from '../../web/reader/reader-app';
import { TerminalDoable } from '../../src/cli/terminal-doable';
import { Runner } from '../../src/cli/runner';

// One projection, read alike (TB-01): from the same state the page, the terminal and the runner (the blind walkers')
// lead with the same four acts, in the same order, each done by the same command and meaning the same thing (its
// facets, the aim's gold); an opener by its own id on all three, none done by its first row (TB-12). Over the atlas's
// grid of kinds and places, with and without an aim followed.
// What the page does with a lead taken: the choice its menu draws it as does its command; one with rows under it and
// none of its own opens (a wait, a look at a door with tries under it): it is listed by its own id; one with a single
// act under it is that act (TB-12).
class Projected {
  static page(app: ReaderApp, a: { choice: string; command?: string }): string {
    const c = MenuModel.lead(app.menu, a.choice), kids = c?.children ?? [];
    if (c && !c.command && kids.length) { return kids.length === 1 && kids[0]!.command ? kids[0]!.command : a.choice; }
    return c?.command ?? a.command ?? a.choice;
  }
}
const read = async (kind: Kind, at: Where, aim: boolean) => {
  const t = await Atlas.start(kind, at, { aim }), g = Glanced.of(t.session), frame = g.frame();
  const app = { state: { frame }, menu: MenuModel.build(frame, 'here', []), props: {} } as unknown as ReaderApp;
  const page = GlanceStage.offered(app) ?? GlanceStage.foreground(app, g.glance.acts);
  const runner = new Runner(t.session).said().offer.primary;
  return {
    page: page.map(a => a.inside?.[0]?.command ?? Projected.page(app, a)),
    terminal: TerminalDoable.led(g.glance, g.screen), runner: runner.map(o => o.id),
    // What the page's four do when pressed (GlanceStage.acted): a fold by its first.
    pressed: page.map(a => { const c = MenuModel.lead(app.menu, a.choice); return c ? GlanceStage.acted(a, c).command
      ?? a.choice : a.command ?? a.choice; }),
    meaning: page.map(a => [...a.aspects].sort().join(',')), gold: page.map(a => !!a.continues),
    runnerMeaning: runner.map(o => [...o.aspects].sort().join(',')),
  };
};
describe('one projection', () => {
  for (const kind of ['companion', 'danger', 'payoff', 'knowledge', 'sign'] as Kind[]) {
    for (const at of ['green', 'lane'] as Where[]) {
      for (const aim of [false, true]) {
        it(`leads alike with ${kind} at the ${at}${aim ? ', its aim followed' : ''}`, async () => {
          const r = await read(kind, at, aim);
          expect(r.terminal).toEqual(r.page);
          expect(r.runner).toEqual(r.page);
          expect(r.runnerMeaning).toEqual(r.meaning);
          if (aim && kind !== 'sign') { expect(r.gold.filter(Boolean)).toHaveLength(1); }
        });
      }
    }
  }
  // Negative space (TB-12): the page's four still do a fold by its first row (GlanceStage.acted, the owner's 15
  // November "no compound menus": "Wait a while" waits a while), where the runner and the terminal list the opener
  // with its rows; at a1's speaking door that first is "Push and pull" (CL-34). Which folds the four may do at once is
  // the page's step of the design, to be decided.
  it.failing('presses alike on the page', async () => {
    const r = await read('companion', 'green', true);
    expect(r.pressed).toEqual(r.runner);
  });
});
