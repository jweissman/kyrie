import { describe, expect, it } from 'bun:test';
import { Atlas, type Kind, type Where } from '../support/atlas';
import { Glanced } from '../support/glanced';
import { MenuModel } from '../../web/reader/menu-model';
import { GlanceStage } from '../../web/reader/stage/glance';
import type { ReaderApp } from '../../web/reader/reader-app';
import { TerminalDoable } from '../../src/cli/terminal-doable';
import { Runner } from '../../src/cli/runner';
import { RunnerOffer } from '../../src/cli/runner-offer';

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
    terminal: TerminalDoable.led(g.glance, g.screen), runner: runner.map(o => RunnerOffer.act(o)),
    // What the page's four do when pressed (GlanceStage.acted): as the engine's one row says (Doable).
    pressed: page.map(a => {
      const c = MenuModel.lead(app.menu, a.choice);
      return c ? GlanceStage.acted(app, a, c).command ?? a.choice : a.command ?? a.choice;
    }),
    led: page.map(a => a.inside?.[0]?.command),
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
  // Pressed alike (TB-12, AT-07 step 4): each of the page's four does what the engine's one row for it does (Doable),
  // none a fold done by its first row as the page had (CL-34: "Push and pull" at the speaking door). A talk the runner
  // names by what it is led for within is opened on the page, that question its first row (Doable's for).
  it('presses alike on the page', async () => {
    for (const [kind, at] of [['companion', 'green'], ['sign', 'lane'], ['payoff', 'green']] as [Kind, Where][]) {
      const r = await read(kind, at, true);
      expect(r.pressed.map((p, i) => r.led[i] && r.runner[i] === r.led[i] ? r.led[i] : p)).toEqual(r.runner);
    }
  });
});
