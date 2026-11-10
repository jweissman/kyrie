import { describe, expect, it } from 'bun:test';
import { Scenery } from '../src/ui/scenery';
import type { PlaceRef, Screen } from '../src/ui/screen-types';

// A scene's painting is of the kind of place it is (the owner and two fresh playtests, 7 November): a taproom had
// been a vaulted cathedral library, a spider nest the same library, a tower a log cabin, the rat-runs a tropical palm
// grotto, a necromancer's study figures at a well, a market woodland, a town gate a mountain range, every barrow room
// one painting, and one lane of sheep the road, the bridge-foot and the forge. Each place here is written as the
// generators write it (its id, its name, what it lies within); its painting is one of its kind's, or none where the
// corpus has nothing of the kind, and never one known to be wrong for it.
class Scene {
  static readonly region: PlaceRef = { id: 'region', name: 'Merscfaenn', kind: 'region' };
  static readonly town: PlaceRef = { id: 'region__s2', name: 'Millholm', kind: 'settlement' };
  static of(place: PlaceRef, within: PlaceRef[] = [Scene.town]): Screen {
    return { path: [Scene.region, ...within, place], place, dark: false,
      region: { areas: [], terrain: 'forest', edges: [], within: {} },
      date: { short: '', long: 'the 25th of Haysel; summer' } } as unknown as Screen;
  }
  static room(id: string, name: string, more: Partial<PlaceRef> = {}): PlaceRef {
    return { id, name, kind: 'room', ...more };
  }
  static seen(place: PlaceRef, within?: PlaceRef[]): string | undefined {
    return Scenery.seen(Scene.of(place, within));
  }
}
const under = { underground: true };
const vaults = ['library', 'cathedral', 'colonnade', 'narthex', 'well', 'grotto'];

describe('the painting of a place', () => {
  it('is of a town\'s rooms by what each is, never a vault of a church or a library', () => {
    const inn: PlaceRef = { id: 'region__s2_inn', name: 'the Ancient Boar', kind: 'building' };
    const taproom = Scene.seen(Scene.room('region__s2_taproom', 'the taproom of the Ancient Boar'), [Scene.town, inn]);
    expect(['scene-inn-town', 'scene-inn-village', 'scene-inn-hamlet']).toContain(taproom!);
    expect(['scene-inn-town', 'scene-inn-village', 'scene-inn-hamlet']).toContain(Scene.seen(Scene.room('region__s3_taproom', 'Milo\'s alehouse'))!);
    expect(['scene-apothecary', 'scene-alchemist-still']).toContain(Scene.seen(Scene.room('region__s1_shop', 'Falkor\'s herb-shop'))!);
    expect(['scene-counting-house', 'silver', 'cup']).toContain(Scene.seen(Scene.room('region__s1_jewelry', 'Joan\'s jewel-shop'))!);
    expect(Scene.seen(Scene.room('region__s1_scriv', 'the scrivener\'s'))).toBe('breviary');
    expect(Scene.seen(Scene.room('region__s2_byre', 'the byre'))).toBe('scene-stable');
    // A forge: the owner's smithy with no smith in it (7 November); before it, a dim ground.
    expect(['scene-forge', 'scene-ironmongery']).toContain(Scene.seen(Scene.room('region__s3_forge', 'the smithy'))!);
    for (const [id, name] of [['region__s2_taproom', 'Corrin\'s alehouse'],
      ['region__s2_chandlery', 'Wat\'s chandlery'],
      ['region__s2_shrine', 'the shrine of Boann'], ['region__s2_houses', 'the houses of Millholm']] as const) {
      expect(vaults).not.toContain(Scene.seen(Scene.room(id, name)));
    }
  });
  it('is of a town\'s open places by what each is: a market a street, a gate a wall, a road a road', () => {
    expect(['scene-market', 'scene-fishmonger']).toContain(Scene.seen(Scene.room('region__s1_green', 'the market-place of Newmeet'))!);
    const foot = Scene.room('region__s2_green', 'the bridge-foot at Brightbridge');
    const gate = Scene.room('circus__rest_gate', 'the gatehouse of the King\'s Rest');
    const road = Scene.room('region__s1_s4_way', 'the road between Newmeet and Brockfield');
    expect(['scene-bridge', 'bridge', 'arcadia']).toContain(Scene.seen(foot)!);
    expect(['castle', 'redoubt']).toContain(Scene.seen(gate)!);
    expect(['road', 'arcadia']).toContain(Scene.seen(road, [])!);
    const camp = Scene.room('region__s5_green', 'the camp at Windscar');
    expect(['herd', 'chapel', 'arcadia']).toContain(Scene.seen(camp)!);
    // No lane of sheep for the road, the bridge-foot or the forge; no wood for a market; no mountains for a gate.
    expect(Scene.seen(road, [])).not.toBe('herd');
    const market = Scene.seen(Scene.room('region__s1_green', 'the market-place'));
    expect(['grove', 'forest', 'gale', 'herd']).not.toContain(market);
    expect(['bridge', 'idyll']).not.toContain(Scene.seen(gate));
  });
  it('is of what lies under a town by what it is, and of no grotto, library or well', () => {
    const cellar = Scene.seen(Scene.room('region__s2_u_cellar', 'the corn-store cellar', under));
    expect(['scene-cellar', 'scene-salt-warehouse']).toContain(cellar!);
    for (const [id, name] of [['region__s2_u_warren', 'the rat-runs'], ['region__s2_u_nest', 'the nest'],
      ['region__s2_u_brood', 'the brood-chamber'], ['region__s2_u_drain', 'the old drain']] as const) {
      // The owner's paintings of 8 November: the runs and the drain, a burrow or a culvert; the brood, its webbed cave.
      expect(['scene-burrow', 'scene-sewer-drain', 'scene-spider-chamber']).toContain(Scene.seen(Scene.room(id, name, under))!);
    }
    const dead = ['scene-crypt', 'scene-ossuary', 'scene-barrow-interior', 'perdition'];
    const crypt = Scene.seen(Scene.room('region__s2_u_crypt', 'the crypt', under));
    const ossuary = Scene.seen(Scene.room('region__s2_u_ossuary', 'the ossuary', under));
    const vault = Scene.seen(Scene.room('region__s2_u_vault', 'the sealed vault', under));
    for (const v of [crypt, ossuary, vault]) { expect(dead).toContain(v!); }
    expect(new Set([crypt, ossuary, vault]).size).toBe(3);
    expect(['vanity', 'death', 'breviary']).toContain(Scene.seen(Scene.room('x__study', 'the necromancer\'s study'))!);
  });
  it('is of a site by its kind, and varies from room to room of a barrow', () => {
    const site: PlaceRef = { id: 'region__s1_ud_site', name: 'the old dead under Newmeet', kind: 'site' };
    const level: PlaceRef = { id: 'region__s1_ud_barrow', name: 'the passage-grave', kind: 'level' };
    const rooms = [['mouth', 'the forecourt'], ['passage', 'the long passage'], ['chamber', 'the cross-chamber'],
      ['back_stone', 'the back-stone'], ['recess', 'a side recess'], ['recess2', 'the north recess'],
      ['vent', 'the light-box']]
      .map(([id, name]) => Scene.seen(Scene.room(`${level.id}_${id}`, name!, under), [site, level]));
    for (const v of rooms) { expect(['scene-crypt', 'scene-ossuary', 'scene-barrow-interior', 'perdition']).toContain(v!); }
    expect(new Set(rooms).size).toBeGreaterThanOrEqual(3);
    const wild: PlaceRef = { id: 'region__z1', name: 'Birchwood', kind: 'wilderness' };
    const tower: PlaceRef = { id: 'tower__tower', name: 'The tower', kind: 'site' };
    expect(['tower', 'redoubt', 'bolt']).toContain(Scenery.seen(Scene.of(tower, [wild]))!);
    const inside: PlaceRef = { id: 'tower__inside', name: 'Inside the tower', kind: 'level' };
    expect(Scene.seen(Scene.room('tower__hall', 'the tower hall'), [wild, tower, inside])).toBe('meditation');
    const roof = Scene.room('tower__roof', 'the tower roof');
    expect(['tower', 'redoubt']).toContain(Scene.seen(roof, [wild, tower, inside])!);
    // A room named for what it would be in the open ("the crossing") deep in a mine is of the mine, not a ford.
    const mine: PlaceRef = { id: 'region__s2_ud_adit', name: 'the adit level', kind: 'level' };
    const crossing = Scene.room('region__s2_ud_adit_crossing', 'the crossing', under);
    expect(['scene-mine-gallery', 'scene-mine-shaft', 'scene-mine-tunnel']).toContain(Scene.seen(crossing, [site, mine])!);
    const cave: PlaceRef = { id: 'raidersHold__lair', name: 'the cave', kind: 'site' };
    expect(Scene.seen(Scene.room('raidersHold__cavern', 'the smoky cavern', under), [wild, cave])).toBe('scene-cave');
    expect(Scene.seen(Scene.room('sink__nest', 'the nest', under), [wild, cave])).not.toBe('library');
  });
  it('keeps the painting an author chose for a place of theirs', () => {
    expect(Scenery.places.infinite_library_threshold).toBe('library');
    expect(Scene.seen(Scene.room('infinite_library_threshold', 'the threshold of the Library'), [])).toBe('library');
  });
});
