import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { ModuleWriter } from '../src/lang/module-writer';
import { MenuModel } from '../web/reader/menu-model';
import { Wayfinder } from '../web/reader/stage/wayfinder';
import type { AppState, ReaderApp } from '../web/reader/reader-app';
import { Glanced } from './support/glanced';

// A way shut that can be opened is shown in Go… with what opens it: the crypt's way up to the churchyard had been
// greyed (⊘) with its opening, a shoulder to the old lock, only under Look… (Mission 20's fourth round, F 115–118).
describe('Go… and a way shut', () => {
  it('offers what opens it beside it', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt',
      party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared);
    await Journey.of(s).play('a torch: Light');
    const c = s.campaign, was = c.world.one('at', 'party')!;
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', was) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__s1_u_crypt') }]));
    const state = { frame: Glanced.of(s).frame(), view: 'here', open: [], cursor: 0, member: '' } as unknown as AppState;
    const app = { state, get menu() { return MenuModel.build(state.frame, 'here', state.open); } } as unknown as ReaderApp;
    const shut = Wayfinder.ways(app).find(w => w.c.disabled && w.name === 'the churchyard')!;
    expect(Wayfinder.opens(app, shut).map(o => o.label).join(' | ')).toMatch(/set your shoulder to the stone door/);
  }, 120000);
});
