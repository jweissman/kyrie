import { describe, expect, it } from 'bun:test';
import { Atlas, type Kind, type Where } from '../support/atlas';
import { Glanced } from '../support/glanced';
import { MenuModel } from '../../web/reader/menu-model';
import { GlanceStage } from '../../web/reader/stage/glance';
import type { ReaderApp } from '../../web/reader/reader-app';
import { Terminal } from '../../src/cli/terminal';
import { Runner } from '../../src/cli/runner';

// One projection, read alike (TB-01): from the same state the page, the terminal and the runner (the blind walkers')
// lead with the same four acts, in the same order, each done by the same command and meaning the same thing (its
// facets, the aim's gold). Over the atlas's grid of kinds and places, with and without an aim followed.
const read = async (kind: Kind, at: Where, aim: boolean) => {
  const t = await Atlas.start(kind, at, { aim }), g = Glanced.of(t.session), frame = g.frame();
  const app = { state: { frame }, menu: MenuModel.build(frame, 'here', []), props: {} } as unknown as ReaderApp;
  const page = GlanceStage.offered(app) ?? GlanceStage.foreground(app, g.glance.acts);
  const runner = new Runner(t.session).said().offer.primary;
  return {
    page: page.map(a => a.inside?.[0]?.command ?? a.command ?? a.choice), terminal: Terminal.led(g.glance, g.screen),
    runner: runner.map(o => o.id),
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
});
