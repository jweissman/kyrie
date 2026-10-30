import { describe, expect, it } from 'bun:test';
import type { Journey } from '../src/session/journey';
import { MapCard } from './support/map-card';
import { MapPlay } from './support/map-play';
import { SiteScale } from '../src/ui/site-scale';

// What the map offers about where the company stands, as a player would pick it: a hex of land beside it, a stretch
// of country a road runs through, a town, and a site.
class Picks {
  static land(j: Journey) { return j.screen().region!.land!; }
  // The nearest hex of land the company knows that is not where it stands, nor (on an authored country's land, whose
  // places are blocks of it) of the place it stands in (see block).
  static beside(j: Journey): number {
    const land = this.land(j), W = land.width, here = land.here!, mine = land.blocks && this.block(j, here);
    const same = (c: number) => c === here || (!!mine && this.block(j, c) === mine);
    const apart = (c: number) => Math.hypot(c % W - here % W, Math.floor(c / W) - Math.floor(here / W));
    return land.known.filter(c => !same(c) && !['~', 'o'].includes(land.cover[c]!))
      .sort((a, b) => apart(a) - apart(b))[0]!;
  }
  // A stretch of country a known road runs through, not where the company is.
  static road(j: Journey): string {
    const region = j.screen().region!;
    return region.areas.find(a => a.kind === 'wilderness' && !a.here
      && region.edges.some(e => e.from === a.id || e.to === a.id))!.id;
  }
  // The place a hex of an authored country's land is of: the one whose block it lies in, else, between the blocks its
  // author set (the margin, an empty square of the grid), the nearest.
  static block(j: Journey, hex: number): string {
    const land = this.land(j), W = land.width;
    const apart = (c: number) => Math.hypot(c % W - hex % W, Math.floor(c / W) - Math.floor(hex / W));
    return Object.entries(land.blocks!).map(([id, cells]) => ({ id, by: Math.min(...cells.map(apart)) }))
      .sort((a, b) => a.by - b.by)[0]!.id;
  }
  // A site's door on the map: no mark is a site itself (its rooms are behind the door, off the land).
  static site(j: Journey, prefix: string): string {
    const ways = j.campaign.world.related('connects');
    return this.land(j).marks.find(m => m.id.startsWith(prefix)
      && SiteScale.behind(j.campaign.module.entities, m.id, ways))!.id;
  }
  static town(j: Journey, prefix: string): string {
    return j.screen().region!.areas.find(a => a.kind === 'settlement' && !a.here && a.id.startsWith(prefix))!.id;
  }
}

// Over the march the map is as good as at home (the owner, OWN-43, after playing: "When I travelled to a new country
// the map became unusable (it kept saying I didn't know the way even to adjacent cells or things along the road)").
// From where the road across the march comes in, each pick on the map sets out, by the engine's plan, and arrives.
describe('the map in a country over the march', () => {
  it('in a drawn country, comes to a hex beside, a stretch on the road, a town and a site', async () => {
    const j = await MapPlay.start('kite', 'debt');
    expect((await MapPlay.reach(j, 'region__edge_east')).arrived).toBe(true);
    await j.step('^To the march-stone of ');
    expect([MapPlay.at(j), Picks.land(j).tracts]).toEqual(['x1y0__edge_west', 'x1y0__t']);
    const hex = Picks.beside(j);
    expect(await MapPlay.press(j, `hex:${hex}`)).toEqual({ to: `x1y0__t${hex}`, arrived: true });
    for (const chosen of [Picks.road(j), Picks.town(j, 'x1y0__')]) {
      expect([chosen, await MapPlay.press(j, chosen)]).toEqual([chosen, { to: chosen, arrived: true }]);
    }
    // With wayfinding, the sites of the country are on the map: one is set out for itself, not the fen it is in.
    const site = Picks.site(j, 'x1y0__');
    expect(await MapPlay.press(j, site)).toEqual({ to: site, arrived: true });
    expect(MapPlay.at(j)).toBe(site);
  }, 600000);
  // An authored country's land has no stretches of open country: a hex is of the place whose block of it it lies in.
  // The town first: from the end of the south road the hex nearest that is of another place is of the town.
  it('in an authored country, comes to its town, and to the place a hex chosen lies in', async () => {
    const j = await MapPlay.start('kite', 'wanderer');
    expect((await MapPlay.reach(j, 'region__edge_north')).arrived).toBe(true);
    await j.step('^To the end of the south road');
    const town = Picks.town(j, 'x0ym1__');
    expect(await MapPlay.press(j, town)).toEqual({ to: town, arrived: true });
    const land = Picks.land(j), hex = Picks.beside(j);
    expect([land.tracts, !!land.blocks]).toEqual([undefined, true]);
    const block = Picks.block(j, hex);
    expect(MapCard.of(j.screen(), `hex:${land.here}`).text).toContain('You are here already.');
    expect(await MapPlay.press(j, `hex:${hex}`)).toEqual({ to: block, arrived: true });
  }, 600000);
});
