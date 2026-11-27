import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import { Glanced } from './support/glanced';
import { MenuModel } from '../src/frame/menu-model';
import { AtHand } from '../web/reader/stage/at-hand';
import { Act } from '../web/reader/stage/act';
import { Explorer } from '../web/reader/stage/explorer';
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
describe('a thing at hand', () => {
  it('offers its acts in its own pane, each a row: what to put in a rotted pack, and how to examine it', async () => {
    const g = await Glanced.country('a1'), room = 'region__w8_halls_well';
    const c = g.s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('unlit', room) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', room) }]));
    const page = new Page({ frame: Glanced.of(g.s).frame(), view: 'here', open: [], cursor: 0, member: '' } as never);
    Explorer.open(page.app, 'look');
    const pack = AtHand.of(page.app).find(h => h.name === 'a rotted pack')!;
    expect(AtHand.of(page.app)[0]!.name).not.toBe('a rotted pack');
    AtHand.pick(page.app, pack);
    // Since only a fight, a store and creation unfold (PB-29), neither is a fold. And since a thing's acts are its own
    // page's (one flat level outside a fight, OR-1295), the pane stays the pack's, with its words, and each act is a
    // row of the pack's page, in whole words, none with rows of its own.
    const acts = AtHand.of(page.app).find(h => h.id === pack.id)!.choices;
    expect(acts.filter(k => k.children?.length)).toEqual([]);
    expect(/<h3>(.*?)<\/h3>/.exec(page.pane())?.[1]).toBe('A rotted pack');
    const own = MenuModel.build(page.state.frame, 'here', [], { attention: { kind: 'thing', id: pack.id } }).choices;
    expect(own.filter(k => k.children?.length)).toEqual([]);
    expect(['Put in a battleaxe', 'Prod it with the pole'].map(l => own.some(k => k.label.startsWith(l))))
      .toEqual([true, true]);
  }, 60000);
});
