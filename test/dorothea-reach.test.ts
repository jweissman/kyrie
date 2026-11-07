import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { AuthoredLand } from '../src/world/authored-land';

// The Reach (data/adventures/the-dorothea/ship.kyr): the Dorothea's near stations as one sea chart, open water with
// islands, and the map following her while the company is aboard (decks(hull, hull_site)). Before, the voyage was on
// no map: the ship was a thing moved between rooms of a region nobody walked to.
const campaign = 'data/campaigns/the-dorothea.campaign.json';
const k = (id: string) => `dorothea__${id}`;
class Reach {
  // The sea table is off (as the-dorothea.test.ts's first pass): a fixed timeline, station by station.
  static async start(seed = 's1') {
    const j = await Journey.start(campaign, seed);
    j.assert(k('seaQuiet'), k('hull'));
    return j;
  }
  static chart(j: Journey) { return AuthoredLand.of(j.campaign.world.module, k('reach'))!; }
  static map(j: Journey) {
    const region = j.screen().region!;
    return { region, here: region.land?.here, at: region.areas.find(a => a.here)?.id };
  }
}

describe('the Reach', () => {
  it('is a sea chart: mostly open water, with the stations off land drawn as islands and the Combs as rocks', async () => {
    const j = await Reach.start(), land = Reach.chart(j), cover = land.cover;
    expect([...cover].filter(c => c === '~').length).toBeGreaterThan(cover.length * 0.85);
    for (const id of ['sound', 'open_sea']) {
      expect(land.blocks![k(id)]!.every(c => cover[c] === '~')).toBe(true);
    }
    for (const id of ['roads', 'ness_roads', 'antler_race']) { expect(cover[land.places[k(id)]!]).not.toBe('~'); }
    const combs = land.places[k('teeth')]!;
    expect(cover[combs]).toBe('~');
    expect(cover[combs - land.width]).toBe('f');
    expect(cover[combs + land.width]).toBe('f');
    // The far calls are off it.
    expect(land.places[k('ashkeld_roads')]).toBeUndefined();
    expect(land.places[k('mangrow_roads')]).toBeUndefined();
  }, 120000);

  it('has the ship where she lies at the quay, and on the Reach station by station as she sails', async () => {
    const j = await Reach.start();
    await j.play('^To Tolleth quay');
    const quay = Reach.map(j);
    await j.play('Ask Captain Bascom for passage', 'Pay Captain Bascom six', "^To the Dorothea's waist");
    expect(j.campaign.world.one('at', 'party')).toBe(k('deck'));
    // Aboard alongside: the country's map, with the company at the quay, where she lies.
    const alongside = Reach.map(j);
    expect(alongside.region.terrain).not.toBe('archipelago');
    expect(alongside.here).toBe(quay.here!);
    const land = Reach.chart(j), been: string[] = [];
    for (const [step, station] of [['=25', 'sound'], ['=125', 'open_sea'], ['=180', 'teeth']] as const) {
      await j.play(step);
      expect(j.campaign.world.one('at', k('hull'))).toBe(k(station));
      const map = Reach.map(j);
      expect(map.region.terrain).toBe('archipelago');
      expect([station, map.here]).toEqual([station, land.places[k(station)]!]);
      expect(map.at).toBe(k(station));
      // Each station she has made is on the map as somewhere the company has been, and the water about it known.
      been.push(k(station));
      expect(map.region.areas.filter(a => a.visited).map(a => a.id).sort()).toEqual([...been].sort());
      expect(map.region.land!.known).toContain(land.places[k(station)]!);
    }
    // Through the Combs and alongside Skerrow's jetty, the company still aboard: Skerrow's own map.
    await j.play('^To the quarterdeck', 'lie off', '=215');
    expect(j.campaign.world.one('at', k('hull'))).toBe(k('jetty'));
    expect(j.campaign.world.one('at', 'party')).toBe(k('helm'));
    const isle = Reach.map(j);
    expect(isle.region.terrain).not.toBe('archipelago');
    expect(isle.at).toBe(k('hamlet'));
  }, 300000);
});
