import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import { MenuModel } from '../web/reader/menu-model';
import { Act } from '../web/reader/stage/act';
import { Wayfinder } from '../web/reader/stage/wayfinder';
import type { AppState, ReaderApp } from '../web/reader/reader-app';
import { Glanced } from './support/glanced';

// The page as Go… sees it, with a way chosen.
class Page {
  constructor(public state: AppState) {}
  get menu() { return MenuModel.build(this.state.frame, 'here', this.state.open); }
  get app(): ReaderApp { return this as unknown as ReaderApp; }
  preview(): string {
    const html = renderToStaticMarkup(createElement(Wayfinder.View, { app: this.app, draw: Act.draw(this.app) }));
    return /<aside class="wf-preview"[\s\S]*?<\/aside>/.exec(html)?.[0] ?? '';
  }
}

// The fresh playtest of 7 November: in the tower's drowned cellar, Go… chose the garrison strongroom, beyond the black
// water in the drift, and its "Go there" did nothing. Two went together, so the water asked first who of them goes
// under first; the one Go had opened that question out of sight. Each of them is a going of its own now, and what
// going risks is said under it when it is chosen once, as anywhere else.
describe('a way that asks who goes first', () => {
  it('is gone by each of the company, by name, from Go…', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { party: [{ name: 'Wenna', raceId: 'human', classId: 'cleric' }, { name: 'Brand', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), g = Glanced.of(s);
    const held = s.campaign as unknown as { world: { apply(c: Change[]): unknown; one(r: string, a: string): string };
      commit(x: unknown): void };
    held.commit(held.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', held.world.one('at', 'party')) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'tower__cistern') },
      { kind: 'retract', call: ModuleWriter.call('unlit', 'tower__cistern') }]));
    await g.perform('wait');
    const page = new Page({ frame: g.frame(), view: 'here', open: [], cursor: 0, member: '' } as unknown as AppState);
    const way = Wayfinder.ways(page.app).find(x => x.name === 'the garrison strongroom')!;
    const goings = Wayfinder.goings(way.c);
    expect(goings.map(x => x.label)).toEqual(['Wenna goes first', 'Brand goes first']);
    expect(goings.every(x => /^risk\(/.test(x.command ?? ''))).toBe(true);
    page.state = { ...page.state, hovered: way.c.id };
    const buttons = [...page.preview().matchAll(/<button[^>]*wf-go[^>]*>([^<]*)/g)].map(m => m[1]);
    expect(buttons).toEqual(['Wenna goes first', 'Brand goes first']);
    // Chosen once, the risk is said under it, to be chosen again.
    page.state = { ...page.state, confirming: goings[0]!.id };
    expect(Act.asks(goings[0]!)).toBeDefined();
    expect(page.preview()).toContain('Choose it again to do it.');
  }, 120000);
});
