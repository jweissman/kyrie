import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Spatial } from '../../src/spatial';
import { EntityIndex } from '../../src/lang/entity-index';
import { MapView } from '../../web/reader/map-view';

// A place in the company's own hex is gone to by the ways about where it stands, never across the country about it:
// chosen on the map with no way planned, it had walked the company out of the town, to a circus ground behind the
// houses (the owner's player report, 12 November; E155, fixed in web/reader/map-view.tsx with no spec until now).
// A region drawn from its author's grid (see AuthoredLand): Hythe's rooms in one hex, the barrow in the next.
const reedlands = (circus: string) => `
  Place shire "the Reedlands" is region.
  Place hythe "Hythe" is settlement within shire at 0, 0.
  Place green "the green" is room within hythe at 0, 0 outdoors.
  Place mill "the mill" is room within hythe at 1, 0 outdoors.
  Passage green_mill "the mill lane" is path between green and mill.
  Place circus "the circus ground" is room within hythe at 2, 0 outdoors.
  ${circus}
  Entity circus_heard: fact "a circus pitched behind the mill".
  Initially Assert established(circus_heard). Initially Assert leadsTo(circus_heard, circus).
  Initially Assert knows(party, circus_heard).
  Place barrow "Lacrimerecs" is site within shire at 1, 0.
  Place mouth "a door of stone in a long mound" is room within barrow at 0, 0 outdoors.
  Passage hythe_barrow "the fen road" is road between green and mouth taking 2 hours.
  Company party "You" of 1 at green.
  Observe g at green when true "A green, and smoke from the mill.".
  Goal false.`;
const inHythe = (t: Tiny, id: string) => Spatial.ancestry(EntityIndex.of(t.campaign.module.entities).byId, id)
  .some(e => e.id === 't__hythe');

describe('a place in the company\'s own hex, chosen on the map', () => {
  it('is walked to by the ways about the town, and the company never leaves it', async () => {
    const t = await Tiny.start(reedlands('Passage mill_circus "the tenter-field gate" is gate between mill and circus.'));
    const way = MapView.way(t.screen, 't__circus');
    expect(way.go?.id).toBe('travel:t__circus');
    await t.perform(way.go!.id);
    expect(t.where()).toBe('t__circus');
    expect(t.screen.map.filter(p => p.visited).map(p => p.id).filter(id => !inHythe(t, id))).toEqual([]);
  });
  // Across the country is how a hex of open country with no known way is gone to (see MapView.across): never for one in
  // the company's own hex. A land of three stretches of fen, Hythe in the middle one, drawn by hand.
  it('with no way known to it, is not set out for across the country', async () => {
    const t = await Tiny.start(`
      Place region "the Reedlands" is region.
      Place t0 "the near fen" is wilderness within region at 0, 0.
      Place t1 "the fen about Hythe" is wilderness within region at 1, 0.
      Place t2 "the far fen" is wilderness within region at 2, 0.
      Place hythe "Hythe" is settlement within region at 1, 0.
      Place green "the green" is room within hythe at 0, 0 outdoors.
      Place circus "the circus ground" is room within hythe at 2, 0 outdoors.
      Entity circus_heard: fact "a circus pitched behind the mill".
      Initially Assert established(circus_heard). Initially Assert leadsTo(circus_heard, circus).
      Initially Assert knows(party, circus_heard).
      Passage green_out "the town's end" is path between green and t1.
      Passage t1_t0 "the fen" is path between t1 and t0.
      Company party "You" of 1 at green.
      Goal false.`, { chart: { width: 3, height: 1, cover: '...', rivers: [], roads: {}, parts: {},
      places: { t0: 0, t1: 1, t2: 2, hythe: 1 } } });
    const land = t.screen.region!.land!;
    expect(land.marks.find(m => m.id === 't__circus')?.cell).toBe(land.here);
    expect(MapView.way(t.screen, 't__circus').go).toBeUndefined();
    expect(MapView.way(t.screen, 'hex:0').go?.label).toMatch(/across country/);
  });
  it('in another hex, is a journey set out on', async () => {
    const t = await Tiny.start(reedlands(''));
    expect(MapView.way(t.screen, 't__barrow').go?.label).toMatch(/set out for Lacrimerecs/);
  });
});
