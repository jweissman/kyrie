import { beforeAll, describe, expect, it } from 'bun:test';
import { Glanced } from './support/glanced';
import { MenuModel } from '../web/reader/menu-model';
import { Routes } from '../src/ui/route';
import type { Frame } from '../web/engine/protocol';

// What the page draws to choose among, with the glance (OWN-18, OWN-19): what the glance leads with comes first (the
// keys' 1, 2 and 3), then everything else as it was, none lost and none twice; every choice the glance does not draw
// is placed under one of the sheets raised over it (Look about, Every way, More); and the place the aim names is
// offered to set out for however far it is, as the engine says (it had been the page matching the aim's words: play 7).
class Menus {
  static ids(frame: Frame): string[] { return MenuModel.build(frame, 'here', []).choices.map(c => c.id); }
  // The same frame with nothing led with (the aims' places as they are).
  static unglanced(frame: Frame): Frame {
    return { ...frame, leaf: { ...frame.leaf, glance: { ...frame.leaf.glance!, acts: [] } } };
  }
  static check(g: Glanced) {
    const frame = g.frame(), glance = frame.leaf.glance!, menu = MenuModel.build(frame, 'here', []);
    // A road draws no glance (see RoadStage), and keeps its own order.
    expect(Routes.of(frame.screen)).toBeUndefined();
    // In a town or a site, a way out into the country the glance leads with is drawn as going out to it.
    const ids = menu.choices.map(c => c.id), out = (id: string) => menu.overland?.has(id) ? MenuModel.country.id : id;
    const led = [...new Set(glance.acts.map(a => out(a.choice)))];
    expect(ids.slice(0, led.length)).toEqual(led);
    expect(glance.ways.map(out).filter(id => !ids.includes(id))).toEqual([]);
    expect([...ids].sort()).toEqual(Menus.ids(Menus.unglanced(frame)).sort());
    // Each choice is drawn on the glance or under a sheet.
    const sheets = menu.sheets!, drawn = new Set([...led, ...glance.ways.map(out), ...sheets.look,
      ...sheets.ways, ...sheets.more]);
    expect(ids.filter(id => !drawn.has(id))).toEqual([]);
  }
}
describe('the menu at a glance', () => {
  let g: Glanced;
  beforeAll(async () => { g = await Glanced.country('kite'); }, 120000);
  // A walk out to the den on the way: a second alone, past bun's five seconds under a loaded suite.
  it('leads with the glance, keeps every choice, and places the rest under a sheet', async () => {
    Menus.check(g);
    await g.choose(/,region__s2_green\)$/);
    Menus.check(g);
    // Talking to your brother is the first choice, and the keys' 1.
    expect(Menus.ids(g.frame())[0]).toBe('drover__son#talk');
    expect(MenuModel.build(g.frame(), 'here', []).sheets!.look).toContain('drover__son#talk');
    await g.to('region__w11');
    Menus.check(g);
  }, 30000);
  it('offers the place the aims name to set out for beyond the nearest', () => {
    const screen = g.frame().screen, legs = [{ way: 'the road', to: 'x', minutes: 60 }];
    const places = ['Riwustagn', 'Argentumfons', 'a lone tower', 'Lunastagn', 'Murkheald'].map((name, i) =>
      ({ id: `p${i}`, name, minutes: 60 * (i + 1), legs }));
    const shown = MenuModel.destinations({ ...screen, destinations: places } as Frame['screen'], undefined, ['travel:p3']);
    expect(shown.map(c => c.id)).toEqual(['travel:p0', 'travel:p1', 'travel:p2', 'travel:p3', 'view:map']);
    // Nothing the aims name beyond the nearest, and only the nearest.
    expect(MenuModel.destinations({ ...screen, destinations: places } as Frame['screen'], undefined, ['travel:p1'])
      .map(c => c.id)).toEqual(['travel:p0', 'travel:p1', 'travel:p2', 'view:map']);
  });
});
