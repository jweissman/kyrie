import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import { Itineraries } from '../src/ui/itinerary';
import { JourneyCourse } from '../web/reader/journey-course';

// Every way the map lays from a generated country's first town, against the straight way there over the hexes (the
// owner, 16 November: "going very far away from the shortest path and then coming back"; OR-35; the rule itself is
// test/small/crow-route). Measured from the debt's start before the repair: in a1 eleven of 137 ways were laid more
// than half as long again as the straight way (the way into the Aldwater nine hexes off, twenty-three, out east by the
// roads and back); in c3 fifty of 160 (Brightford, five hexes off, fourteen). Laid as a traveller would now, none is:
// a way is longer only where the land the company knows is slower, or water (in b2, a lake beside the first town).
describe('the ways laid from a country\'s first town', () => {
  it.each(['a1', 'c3'])('in %s, go no further than half as far again as the straight way', async seed => {
    const s = await DrawnWorld.start(seed, { origin: 'debt', party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }] },
      NodeBundleSource.shared);
    const screen = Itineraries.charted(s.campaign, ScreenModel.build(s.campaign)),
      land = screen.region!.land!, here = land.here!;
    const far = (a: number, b: number) => Hexes.apart(land.width, a, b);
    const long = [...screen.destinations ?? [], ...screen.roads ?? [], ...screen.mapped ?? []].flatMap(d => {
      const cells = JourneyCourse.planned(screen, d.id) ?? [], straight = far(here, cells.at(-1) ?? here);
      const walked = cells.slice(1).reduce((n, c, i) => n + far(cells[i]!, c), 0);
      return straight >= 2 && walked > 1.5 * straight ? [`${d.name}: ${walked} for ${straight}`] : [];
    });
    expect(long).toEqual([]);
  }, 120000);
});
// Hexes apart on a land set out in rows, every other row half a cell to the east (as RegionTracts).
class Hexes {
  static apart(width: number, a: number, b: number): number {
    const [p, q] = [Hexes.cube(width, a), Hexes.cube(width, b)];
    return Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]), Math.abs(p[0] + p[1] - q[0] - q[1]));
  }
  private static cube(width: number, c: number): [number, number] {
    const x = c % width, y = Math.floor(c / width);
    return [x - (y - (y & 1)) / 2, y];
  }
}
