import { describe, expect, it } from 'bun:test';
import table from '../../data/paintings/scenery.json';
import { Scenery } from '../../src/ui/scenery';
import { SceneKinds } from '../../src/ui/scene-kinds';
import { Commissioned } from '../../src/ui/commissioned';
import { CreaturePortraits } from '../../src/paintings/creature-portraits';
import { ItemCatalog } from '../../src/item-catalog';
import type { PlaceRef, Screen } from '../../src/ui/screen-types';

// The owner's ruling (25 November): "I wonder if we shouldn't forbid using the old masters painting for backgrounds;
// only commissioned pieces … they should only be for tarot cards and ofc the portraits." A scene's or a room's
// background is the owner's own (scene-*), never an old master; a place whose kind or land had only old masters is
// painted by what it lies in instead; the portraits keep theirs. Every list the resolver reads is held, and the
// resolver is asked of every kind of place in every land, season and light, so no world can draw an old master.
const terrains = ['archipelago', 'desert', 'forest', 'frost', 'hills', 'jungle', 'marsh', 'mountain', 'volcanic'];
const seasons = ['spring', 'summer', 'autumn', 'winter'];
type Light = { terrain: string; season: string; dark?: boolean };
class At {
  static screen(place: PlaceRef, within: PlaceRef[], { terrain, season, dark = false }: Light): Screen {
    return { path: [{ id: 'region', name: 'the country', kind: 'region' }, ...within, place], place, dark,
      region: { areas: [], terrain, edges: [], within: {} }, date: { short: '', long: `the 1st; ${season}` } } as
      unknown as Screen;
  }
}
const screen = (place: PlaceRef, within: PlaceRef[], terrain: string, season: string): Screen =>
  At.screen(place, within, { terrain, season });
const town: PlaceRef = { id: 'region__s2', name: 'Millholm', kind: 'settlement' };
const wild: PlaceRef = { id: 'region__z1', name: 'Birchwood', kind: 'wilderness' };
const site: PlaceRef = { id: 'region__w4', name: 'Dolorechies', kind: 'site' };
describe('a place\'s background', () => {
  it('is drawn from lists that hold only commissioned paintings', () => {
    const lists = [...Object.values(Scenery.views), ...Object.values(Scenery.within),
      ...Object.values(Scenery.approaches), Scenery.winterOpen, ...Object.values(Scenery.places).flat().map(p => [p]),
      ...SceneKinds.kinds.flatMap(k => [k.ground ?? [], k.room ?? [], ...Object.values(k.parts ?? {})])];
    expect(lists.flat().filter(p => !Commissioned.is(p))).toEqual([]);
  });
  it('is never an old master, for any kind of place, in any land, season or light', () => {
    const drawn = new Set<string>();
    for (const kind of SceneKinds.kinds) {
      const word = kind.words[0]!, id = `region__x_${word.replace(/\W/g, '')}`;
      const places: [PlaceRef, PlaceRef[]][] = [[{ id, name: `the ${word}`, kind: 'room' }, [town]],
        [{ id, name: `the ${word}`, kind: 'room', open: true }, [town]],
        [{ id, name: `the ${word}`, kind: 'room', underground: true }, [wild, site]],
        [{ id, name: `the ${word}`, kind: 'site' }, [wild]]];
      for (const [place, within] of places) {
        for (const terrain of terrains) {
          for (const season of seasons) {
            for (const dark of [false, true]) {
              const s = At.screen(place, within, { terrain, season, dark });
              for (const p of [Scenery.seen(s), Scenery.approach(s)]) { if (p) { drawn.add(p); } }
            }
          }
        }
      }
    }
    expect(drawn.size).toBeGreaterThan(100);
    expect([...drawn].filter(p => !Commissioned.is(p))).toEqual([]);
  });
  it('gives way, where a kind or a land had only old masters, to what the place lies in', () => {
    // The abbey and the shieling were painted only by old masters: now by their land, never by none.
    const abbey = table.kinds.find(k => k.kind === 'abbey')!;
    expect(abbey.ground!.every(p => !Commissioned.is(p))).toBe(true);
    for (const name of ['the abbey', 'the shieling']) {
      expect(Scenery.seen(screen({ id: 'region__w2', name, kind: 'site' }, [wild], 'forest', 'summer')))
        .toMatch(/^scene-/);
    }
    // A site named by no kind, whose views were all old masters (ruin, arch), is its land's.
    expect(Scenery.seen(screen(site, [wild], 'forest', 'summer'))).toMatch(/^scene-/);
    // Deep in a site, a study whose commissioned room does not fit under the ground is the site's vault or passage.
    expect(Scenery.seen(screen({ id: 'region__w4_study', name: 'the study', kind: 'room', underground: true },
      [wild, site], 'forest', 'summer'))).toMatch(/^scene-/);
    // The way into a country, all of old masters, is the country's own.
    expect(Scenery.approach(screen({ id: 'region__w1_road', name: 'the road in', kind: 'wild' }, [], 'marsh',
      'summer'))).toMatch(/^scene-/);
  });
  it('leaves the old masters to the portraits', () => {
    expect(CreaturePortraits.painting(ItemCatalog.canon, 'elemental/fire_element')).toBe('monsters/elemental');
  });
});
