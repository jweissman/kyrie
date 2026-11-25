import { describe, expect, it } from 'bun:test';
import scenery from '../data/paintings/scenery.json';
import { Scenery } from '../src/ui/scenery';
import type { PlaceRef, Screen } from '../src/ui/screen-types';

// A scene's painting is of the kind of place it is (the owner and two fresh playtests, 7 November): a taproom had
// been a vaulted cathedral library, a spider nest the same library, a tower a log cabin, the rat-runs a tropical palm
// grotto, a necromancer's study figures at a well, a market woodland, a town gate a mountain range, every barrow room
// one painting, and one lane of sheep the road, the bridge-foot and the forge. Each place here is written as the
// generators write it (its id, its name, what it lies within); its painting is one of its kind's, or none where the
// corpus has nothing of the kind, and never one known to be wrong for it.
class Scene {
  static readonly region: PlaceRef = { id: 'region', name: 'Marshfen', kind: 'region' };
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
  // The way in through a country in winter is a winter's country, even where the country's own paintings are all of
  // leaf (OR-46: "snowy, Deepwinter" over a summer wood); in summer never a winter painting.
  // A painting of a season is shown in it alone (the owner's lake and oak pasture in four seasons, 21 November): over
  // forty places of a forest country, no season draws another's, and winter draws its own.
  it('shows a season\'s painting only in its season', () => {
    const tied = scenery as unknown as Record<string, string[]>;
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    for (const season of seasons) {
      const drawn = Array.from({ length: 40 }, (_, i) => Scenery.of({ ...Scene.of({ id: `region__w${i}_wood`,
        name: 'the wood', kind: 'wild' }, []), date: { short: '', long: `the 1st; ${season}` } } as Screen));
      const others = new Set(seasons.filter(s => s !== season).flatMap(s => tied[s] ?? []));
      expect(drawn.filter(d => d && others.has(d))).toEqual([]);
      if (season === 'winter') { expect(drawn.some(d => d && tied.winter!.includes(d))).toBe(true); }
      // And a room's: the tops of forty towers, none drawing another season's painting (Scenery.inside).
      const rooms = Array.from({ length: 40 }, (_, i) => Scenery.seen({ ...Scene.of(Scene.room(`tower${i}__top`,
        'the top of the tower'), [{ id: `tower${i}`, name: 'The tower', kind: 'site' },
        { id: `tower${i}__inside`, name: 'Inside the tower', kind: 'level' }]),
      date: { short: '', long: `the 1st; ${season}` } } as Screen));
      expect(rooms.filter(d => d && others.has(d))).toEqual([]);
    }
  });
  it('agrees with the season on the way in', () => {
    const road: PlaceRef = { id: 'region__w1_road', name: 'the road into Pardaael', kind: 'wild' };
    const on = (long: string) => ({ ...Scene.of(road, []), date: { short: '', long } }) as Screen;
    expect(Scenery.winter.has(Scenery.approach(on('the 12th of Deepwinter; winter'))!)).toBe(true);
    expect(Scenery.winter.has(Scenery.approach(on('the 25th of Haysel; summer'))!)).toBe(false);
  });
  it('is of a town\'s rooms by what each is, never a vault of a church or a library', () => {
    const inn: PlaceRef = { id: 'region__s2_inn', name: 'the Ancient Boar', kind: 'building' };
    const taproom = Scene.seen(Scene.room('region__s2_taproom', 'the taproom of the Ancient Boar'), [Scene.town, inn]);
    expect(['scene-inn-town', 'scene-inn-village', 'scene-inn-hamlet']).toContain(taproom!);
    expect(['scene-inn-town', 'scene-inn-village', 'scene-inn-hamlet']).toContain(Scene.seen(Scene.room('region__s3_taproom', 'Milo\'s alehouse'))!);
    expect(['scene-apothecary', 'scene-alchemist-still']).toContain(Scene.seen(Scene.room('region__s1_shop', 'Falkor\'s herb-shop'))!);
    expect(['scene-counting-house', 'scene-cache']).toContain(Scene.seen(Scene.room('region__s1_jewelry', 'Joan\'s jewel-shop'))!);
    expect(Scene.seen(Scene.room('region__s1_scriv', 'the scrivener\'s'))).toBe('scene-scriveners');
    expect(['scene-stable', 'scene-town-stable', 'scene-byre']).toContain(Scene.seen(Scene.room('region__s2_byre', 'the byre'))!);
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
    expect(Scene.seen(gate)).toMatch(/^scene-castle/);
    expect(['scene-valley-road', 'scene-road', 'scene-road-night', 'scene-country-lane', 'scene-country-lane-dawn',
      'scene-country-lane-dusk', 'scene-country-lane-night']).toContain(Scene.seen(road, [])!);
    const camp = Scene.room('region__s5_green', 'the camp at Windscar');
    expect(Scene.seen(camp)).toBe('scene-village-square');
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
    // A sealed vault's own painting among them: the crypt's, lit by a window, is not one under the ground (S3-4).
    const dead = ['scene-crypt', 'scene-ossuary', 'scene-barrow-interior', 'perdition', 'scene-vault-sealed'];
    const crypt = Scene.seen(Scene.room('region__s2_u_crypt', 'the crypt', under));
    const ossuary = Scene.seen(Scene.room('region__s2_u_ossuary', 'the ossuary', under));
    const vault = Scene.seen(Scene.room('region__s2_u_vault', 'the sealed vault', under));
    for (const v of [crypt, ossuary, vault]) { expect(dead).toContain(v!); }
    expect(new Set([crypt, ossuary, vault]).size).toBe(3);
    expect(Scene.seen(Scene.room('x__study', 'the necromancer\'s study'))).toBe('scene-necromanteion');
  });
  it('is of a site by its kind, and varies from room to room of a barrow', () => {
    const site: PlaceRef = { id: 'region__s1_ud_site', name: 'the old dead under Newmeet', kind: 'site' };
    const level: PlaceRef = { id: 'region__s1_ud_barrow', name: 'the passage-grave', kind: 'level' };
    const rooms = [['mouth', 'the forecourt'], ['passage', 'the long passage'], ['chamber', 'the cross-chamber'],
      ['back_stone', 'the back-stone'], ['recess', 'a side recess'], ['recess2', 'the north recess'],
      ['vent', 'the light-box']]
      .map(([id, name]) => Scene.seen(Scene.room(`${level.id}_${id}`, name!, under), [site, level]));
    // Each of its parts as a barrow's: a forecourt with its seal-stone, a passage of slabs, a corbelled chamber, a
    // recess, not a cathedral's hall or a scholar's room (Mission 20's third cold round).
    expect(rooms.slice(0, 5)).toEqual(['scene-barrow-forecourt', 'scene-barrow-passage', 'scene-barrow-chamber',
      'scene-barrow-chamber', 'scene-barrow-recess']);
    expect(new Set(rooms).size).toBeGreaterThanOrEqual(3);
    // A barrow known by a name and no kind (Dolorechies) is what the map marks its ground for.
    const named: PlaceRef = { id: 'region__w1_site', name: 'Dolorechies', kind: 'site' };
    const end = Scene.room('region__w1_end', 'the round chamber', under);
    const marked = { ...Scene.of(end, [named]), region: { areas: [], terrain: 'forest', edges: [], within: {},
      land: { marks: [{ id: 'region__w1', kind: 'barrow' }] } } } as unknown as Screen;
    expect(Scenery.seen(marked)).toBe('scene-barrow-chamber');
    const wild: PlaceRef = { id: 'region__z1', name: 'Birchwood', kind: 'wilderness' };
    const tower: PlaceRef = { id: 'tower__tower', name: 'The tower', kind: 'site' };
    expect(Scenery.seen(Scene.of(tower, [wild]))).toBe('scene-lone-tower');
    const inside: PlaceRef = { id: 'tower__inside', name: 'Inside the tower', kind: 'level' };
    expect(Scene.seen(Scene.room('tower__hall', 'the tower hall'), [wild, tower, inside])).toBe('scene-broken-keep-tower');
    const roof = Scene.room('tower__roof', 'the tower roof');
    expect(Scene.seen(roof, [wild, tower, inside])).toBe('scene-tower-roof');
    // A room named for what it would be in the open ("the crossing") deep in a mine is of the mine, not a ford.
    const mine: PlaceRef = { id: 'region__s2_ud_adit', name: 'the adit level', kind: 'level' };
    const crossing = Scene.room('region__s2_ud_adit_crossing', 'the crossing', under);
    expect(['scene-mine-gallery', 'scene-mine-shaft', 'scene-mine-tunnel']).toContain(Scene.seen(crossing, [site, mine])!);
    const cave: PlaceRef = { id: 'raidersHold__lair', name: 'the cave', kind: 'site' };
    expect(['scene-cave', 'scene-crystal-grotto', 'scene-cave-mouth-interior'])
      .toContain(Scene.seen(Scene.room('raidersHold__cavern', 'the smoky cavern', under), [wild, cave])!);
    expect(Scene.seen(Scene.room('sink__nest', 'the nest', under), [wild, cave])).not.toBe('library');
  });
  it('is of a small town\'s own places, not a castle\'s or a chapel\'s', () => {
    // The owner's paintings of 10 November: Brockminster's gate-yard had been a gothic castle's, the lanes a chapel.
    const open = { open: true };
    expect(Scene.seen(Scene.room('region__s2_gate', 'the gate-yard', open))).toBe('scene-village-gate-yard');
    expect(['scene-town-lane', 'scene-town-lanes', 'scene-alley', 'scene-town-alley-fog', 'scene-town-alley-rain'])
      .toContain(Scene.seen(Scene.room('region__s2_lanes', 'the lanes behind Millholm', open))!);
    expect(Scene.seen(Scene.room('region__s2_houses', 'the houses of Millholm', open))).toBe('scene-town-houses');
    // Porthalen's customs-house, a counter and a barred window, had been a cottage room with a bed (S3-4).
    expect(['scene-counting-room', 'scene-accountancy', 'scene-accountancy-night'])
      .toContain(Scene.seen(Scene.room('drove__customs', 'the customs-house', { indoors: true }))!);
    expect(['scene-vault-sealed', 'scene-crypt', 'scene-ossuary'])
      .toContain(Scene.seen(Scene.room('region__s2_u_vault', 'the sealed vault', under))!);
    expect(Scene.seen(Scene.room('region__s2_green', 'the landing at Millholm', open))).toBe('scene-landing');
    expect(['scene-boat-sheds', 'scene-boat-sheds-rain', 'scene-shipwright'])
      .toContain(Scene.seen(Scene.room('region__s2_sheds', 'the boat-sheds', open))!);
    expect(['scene-counting-room', 'scene-accountancy', 'scene-accountancy-night'])
      .toContain(Scene.seen(Scene.room('region__w7_counting', 'the counting-room'))!);
    expect(Scene.seen(Scene.room('region__w7_store', 'the warehouse'))).toBe('scene-warehouse');
  });
  // An author's choice of an old master gives way to the kind's commissioned painting (the owner, 25 November).
  it('keeps the painting an author chose for a place of theirs, where it is commissioned', () => {
    expect(Scenery.places.fellowship__hall_a).toBe('scene-great-house');
    expect(Scene.seen(Scene.room('fellowship__hall_a', 'the hall'), [])).toBe('scene-great-house');
    expect(Scenery.places.infinite_library_threshold).toBeUndefined();
    expect(Scene.seen(Scene.room('infinite_library_threshold', 'the threshold of the Library'), [])).toMatch(/^scene-/);
  });
});
