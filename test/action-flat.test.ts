import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import { MenuModel } from '../web/reader/menu-model';
import { GlanceStage } from '../web/reader/stage/glance';
import type { ReaderApp } from '../web/reader/reader-app';
import { Glanced } from './support/glanced';

// The foreground draws concrete things to do, each in words that stand alone (the owner, 11 November, the corn-store):
// a choice that only gathers a few, all to hand, is those; a try names what it is done to, and one done at a way is
// done at the way ("Listen at it" of a padlock). Nothing is drawn that is not already offered.
class Town {
  static async at(place: string) {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign;
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
    const g = Glanced.of(s), frame = g.frame();
    const app = { state: { frame }, menu: MenuModel.build(frame, 'here', []), props: {} } as unknown as ReaderApp;
    return { s, g, app };
  }
}

describe('the foreground, flat', () => {
  it('draws what a thing led by its name alone holds, in its own words', async () => {
    const { g, app } = await Town.at('region__s1_shrine');
    const shown = GlanceStage.foreground(app, g.glance.acts);
    expect(shown.map(a => a.label)).toContain('Climb the tower and look out over Thornhaven');
    expect(shown.map(a => a.label)).not.toContain('the tower of the shrine');
  }, 120000);
  it('names what a try is done to, and listens at the way, not at its padlock', async () => {
    const { s } = await Town.at('region__s1_green');
    const store = ScreenModel.build(s.campaign).exits.find(e => e.destination.id === 'region__s1_u_store')!;
    const tries = store.acts.find(a => a.label === 'Look at the corn-store padlock')!.children!;
    expect(tries.map(t => t.alone)).toEqual(['Push and pull at the corn-store padlock', 'Listen at the old corn-store']);
  }, 120000);
});
