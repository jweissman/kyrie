import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import { Glanced } from './support/glanced';
import { MenuModel } from '../web/reader/menu-model';
import { Pastime } from '../web/reader/stage/pastime';
import { Act } from '../web/reader/stage/act';
import { Explorer } from '../web/reader/stage/explorer';
import type { AppState, ReaderApp } from '../web/reader/reader-app';

// The fresh playtest of 7 November waited until first light in a cellar under the tower, with a candle and then a
// lantern burning, and woke worn out with both burned dry and a flask of oil gone: waiting for the light had spent the
// lights and was no rest, and nothing on the Wait sheet had offered a night's sleep or said there was none to be had.
// A company sitting out the hours puts its lights out while it waits, as it does to sleep; the Wait sheet offers
// sleeping beside waiting, where it can be had, and says so where it cannot.
class Night {
  static async start() {
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Sable', raceId: 'catfolk', classId: 'cleric' }] });
    const s = await PlaySession.start(w.path, 'wren', w.source);
    this.apply(s, [{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__s1_shop') }]);
    for (const buy of [/^Buy a lantern for Sable/, /^Buy a flask of lamp oil for Sable/]) { await this.take(s, buy); }
    // The mine with nobody in it, down in the dark, at nightfall.
    const groups = s.campaign.module.entities.filter(e => e.type === 'group' && e.id.startsWith('region__w9_'))
      .map(e => e.id);
    this.apply(s, s.campaign.world.related('at').filter(r => groups.includes(r.args[0]!))
      .map(r => ({ kind: 'retract' as const, call: ModuleWriter.call('at', ...r.args) })));
    this.apply(s, [{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__w9_haulage_hall') }]);
    await this.take(s, /^Wait until dark$/);
    return s;
  }
  static apply(s: PlaySession, changes: Change[]) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(changes));
  }
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No ${pattern}: ${PlayerView.choices(s.campaign).map(x => x.choice.name).join(' | ')}`); }
    await s.perform(c.choice.id);
  }
  // What is left of each light the company has burning, by its kind, and the flasks of oil it carries.
  static lights(s: PlaySession) {
    const all = s.campaign.readout.creatures.filter(c => s.campaign.readout.partyIds.includes(c.id));
    return { burning: Object.fromEntries(all.flatMap(c => c.state.conditions)
      .filter(x => ['candlelit', 'lamplit'].includes(x.id)).map(x => [x.id, x.remaining])),
    oil: all.flatMap(c => c.state.inventory ?? []).filter(i => i.definition === 'lamp_oil').length };
  }
  // The Wait sheet, as the explorer opens it where the company stands.
  static sheet(s: PlaySession): string {
    let state = { frame: Glanced.of(s).frame(), view: 'here', open: [], cursor: 0, member: '' } as unknown as AppState;
    // The page, its state changed as setState would, and its menu made from what is open.
    const app = { get state() { return state; }, get menu() { return MenuModel.build(state.frame, 'here', state.open); },
      setState(patch: Partial<AppState>) { state = { ...state, ...patch }; } } as unknown as ReaderApp;
    Explorer.open(app, 'wait');
    return renderToStaticMarkup(createElement(Pastime.View, { app, draw: Act.draw(app) }));
  }
}

describe('a night waited out', () => {
  it('puts the company\'s lights out until the light comes, and they are there to light again', async () => {
    const s = await Night.start();
    await Night.take(s, /^Fill a lantern from a flask of lamp oil and light it$/);
    const lit = Night.lights(s);
    expect(lit.burning.lamplit).toBeGreaterThan(0);
    await Night.take(s, /^Wait until first light$/);
    expect(s.campaign.world.test(ModuleWriter.call('dark'))).toBe(false);
    // Nothing burned while it waited: the lantern has what it had, and the flask it did not fill is still in the pack.
    expect(Night.lights(s)).toEqual(lit);
    // Waiting an hour with it lit burns it, as before.
    await Night.take(s, /^Wait an hour$/);
    expect(Night.lights(s).burning.lamplit).toBeLessThan(lit.burning.lamplit!);
  }, 120000);

  it('is offered beside sleeping where sleep can be had, and says so where it cannot', async () => {
    const s = await Night.start();
    const sheet = Night.sheet(s), lengths = /<ul class="pt-lengths">(.*?)<\/ul>/.exec(sheet)?.[1] ?? '';
    // The Delvers' hall is somewhere to rest: the rest is one of the ways of letting the night go.
    expect(lengths).toContain('Until first light');
    expect(lengths).toMatch(/Rest six hours|Try to rest/);
    expect(sheet).not.toContain(Pastime.sleepless);
    Night.apply(s, [{ kind: 'retract', call: ModuleWriter.call('restful', 'region__w9_haulage_hall') }]);
    expect(Night.sheet(s)).toContain(Pastime.sleepless);
  }, 120000);
});
