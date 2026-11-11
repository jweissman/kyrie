import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { JourneyCourse } from '../web/reader/journey-course';
import { Glanced } from './support/glanced';

// The way the map draws before setting out is the way the journey goes (the owner, 10 November: the journey had not
// followed the route shown): the map had drawn its own shortest way over the hexes, and the journey went by the
// itinerary's known ways. Now the map lays the itinerary's own stops, as the walk afterwards follows the legs made.
describe('a way drawn on the map', () => {
  it('goes by every stop of the journey it would be, in order, from where the company stands', async () => {
    const j = Journey.of(await DrawnWorld.start('kahitude', { origin: 'debt',
      party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
    await j.play('Tell Tuck');
    const screen = Glanced.of(j.session).screen, region = screen.region!, plan = screen.destinations?.find(d =>
      (d.stops?.length ?? 0) > 2) ?? screen.roads?.find(d => (d.stops?.length ?? 0) > 2);
    expect(plan).toBeDefined();
    const course = JourneyCourse.planned(screen, plan!.id)!;
    expect(course[0]).toBe(region.land!.here!);
    // Each town or site it comes to (a wild tract is crossed, not come to at its middle).
    const cell = (id: string) => { const a = region.areas.find(x => x.id === (region.within[id] ?? id));
      return a && !/__z\d+$/.test(a.id) ? a.y * region.land!.width + a.x : undefined; };
    const at = plan!.stops!.map(cell).filter((c): c is number => c !== undefined).map(c => course.indexOf(c));
    expect(at.every(i => i >= 0)).toBe(true);
    expect(at).toEqual([...at].sort((a, b) => a - b));
    expect(course.at(-1)).toBe(cell(plan!.stops!.at(-1)!));
  }, 120000);
});
