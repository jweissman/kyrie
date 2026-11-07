import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import { Glanced } from './support/glanced';
import { MenuModel } from '../web/reader/menu-model';
import { AtHand } from '../web/reader/stage/at-hand';
import { Act } from '../web/reader/stage/act';
import { Explorer } from '../web/reader/stage/explorer';
import { Folds } from '../web/reader/folds';
import type { AppState, ReaderApp } from '../web/reader/reader-app';

// The page as Look… sees it: its state, changed as setState would, and its menu made from what is open.
class Page {
  constructor(public state: AppState) {}
  get menu() { return MenuModel.build(this.state.frame, 'here', this.state.open); }
  setState(patch: Partial<AppState>) { this.state = { ...this.state, ...patch }; }
  get app(): ReaderApp { return this as unknown as ReaderApp; }
  // What the pane opened under Look… shows: its heading, and its acts.
  pane(): string {
    return renderToStaticMarkup(createElement(AtHand.View, { app: this.app, draw: Act.draw(this.app) }));
  }
}

// The fresh playtest of 7 November: under Look…, a rotted pack offered "Put in" and "Examine", and either, chosen, put
// the pack's pane away for the first thing at hand's (a torch's), with none of its acts open, so that nothing seemed
// to happen. A fold opened in a thing's pane opens there, and the pane stays the thing's.
describe('a fold opened on a thing at hand', () => {
  it('opens in the thing\'s own pane: what to put in a rotted pack, and how to examine it', async () => {
    const g = await Glanced.country('a1'), room = 'region__w8_halls_well';
    const c = g.s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('unlit', room) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', room) }]));
    const page = new Page({ frame: Glanced.of(g.s).frame(), view: 'here', open: [], cursor: 0, member: '' } as never);
    Explorer.open(page.app, 'look');
    const pack = AtHand.of(page.app).find(h => h.name === 'a rotted pack')!;
    expect(AtHand.of(page.app)[0]!.name).not.toBe('a rotted pack');
    AtHand.pick(page.app, pack);
    for (const [fold, shown] of [['Put in', 'A battleaxe'], ['Examine', 'Prod it with the pole']] as const) {
      Folds.toggle(page.app, AtHand.of(page.app).find(h => h.id === pack.id)!.choices.find(k => k.label === fold)!);
      const pane = page.pane();
      expect([fold, /<h3>(.*?)<\/h3>/.exec(pane)?.[1], pane.includes(shown)]).toEqual([fold, 'A rotted pack', true]);
    }
  }, 60000);
});
