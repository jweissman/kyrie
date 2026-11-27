import { Charted } from './support/charted';
import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { JourneyCourse } from '../web/reader/journey-course';
import { Glanced } from './support/glanced';
import { Travel } from '../src/session/travel';
import { Itineraries } from '../src/ui/itinerary';
import type { Frame } from '../src/creation/protocol';
import { AutoplayRun } from '../src/autoplay/run';

// The way the map draws before setting out is the way the journey goes (the owner, 10 November: the journey had not
// followed the route shown): the map had drawn its own shortest way over the hexes, and the journey went by the
// itinerary's known ways. Now the map lays the itinerary's own stops, as the walk afterwards follows the legs made.
describe('a way drawn on the map', () => {
  it('goes by every stop of the journey it would be, in order, from where the company stands', async () => {
    const j = Journey.of(await DrawnWorld.start('kahitude', { origin: 'debt',
      party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
    await j.play('Tell Tuck');
    const screen = Glanced.of(j.session).frame().screen, region = screen.region!, plan = screen.destinations?.find(d =>
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
  // Onto a road from a stretch it crosses, the way is drawn along the road from there: a1's way from Mik's
  // salt-house (the debt) to the lone tower, onto the Deepwater road at the stretch 129 and off it at 109 by the
  // tower's track, had been drawn down to the road's crossing at 189 and back up it, 169, 149, 129 (the owner, 19
  // November: routes that double back). Through a town where two roads meet, the way still goes in and out by it.
  it('goes along a road from where it is joined, never back over it', async () => {
    const s = await AutoplayRun.start({ seed: 'a1', origin: 'debt', policy: 'gold', steps: 1,
      protagonist: { name: 'Wenna', raceId: 'human', classId: 'warrior' } });
    const screen = Charted.screen(s.campaign), course = JourneyCourse.planned(screen, 'region__w9')!;
    // Off the road at 109 and along the tower's track a hex at a time to it at 118 (OR-162: it had jumped the nine).
    const off = course.indexOf(109);
    expect([course[off - 1], course.at(-1)]).toEqual([129, 118]);
    expect(course.slice(off)).toEqual([109, 110, 111, 112, 113, 114, 115, 116, 117, 118]);
    expect(new Set(course).size).toBe(course.length);
  }, 120000);
  // And the journey made goes by those same stops, the walk drawn after it over the very hexes drawn before it (the
  // owner, 11 November, again: travel had not seemed to follow the way shown). Stopped short, it says why.
  it('is the way the journey goes, leg by leg and hex by hex, or says why it stopped short', async () => {
    const start = () => DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const first = Charted.screen((await start()).campaign);
    const plans = [...first.destinations ?? [], ...first.roads ?? []].filter(d => (d.stops?.length ?? 0) >= 2)
      .slice(0, 6);
    let arrived = 0;
    for (const d of plans) {
      const s = await start(), before = { screen: Charted.screen(s.campaign) } as Frame;
      const made = await Travel.go({ campaign: s.campaign, perform: c => s.perform(c) }, d.id);
      const went = made.legs.map(l => /,([^,)]+)\)$/.exec(l.command)?.[1] ?? l.command);
      if (!made.arrived) {
        expect(made.stopped).toBeTruthy();
        expect(d.stops!.slice(0, went.length)).toEqual(went);
        continue;
      }
      arrived++;
      expect(went).toEqual(d.stops!);
      const after = { screen: Charted.screen(s.campaign), travel: { legs: went.map(id => ({ id })) } } as
        unknown as Frame;
      expect(JourneyCourse.of(before, after)).toEqual(JourneyCourse.planned(before.screen, d.id));
    }
    expect(arrived).toBeGreaterThan(0);
  }, 400000);
  // A hex chosen on the map, which no itinerary of the screen's is for, is laid by the engine's own plan (the plan
  // request), and walked hex by hex over open country: next door north of Thornhaven had been laid by the board's own
  // way and walked 221, 140, 90, 201, by the middle of the wood the hex lies in (the owner, 11 November).
  it('lays a hex chosen by the plan the journey goes by, and walks it a hex at a time', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const before = { screen: Charted.screen(s.campaign) } as Frame, land = before.screen.region!.land!;
    const north = land.here! - land.width, to = land.goes![north]!;
    const laid = JourneyCourse.along(before.screen, Itineraries.plan(s.campaign, to)!.legs.map(l => l.to));
    expect(laid).toEqual([land.here!, north]);
    const made = await Travel.go({ campaign: s.campaign, perform: c => s.perform(c) }, to);
    expect(made.arrived).toBe(true);
    const went = made.legs.map(l => ({ id: /,([^,)]+)\)$/.exec(l.command)?.[1] }));
    const after = { screen: Charted.screen(s.campaign), travel: { legs: went } } as unknown as Frame;
    expect(JourneyCourse.of(before, after)).toEqual(laid);
  }, 120000);
});
