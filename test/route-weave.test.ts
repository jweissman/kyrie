import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { JourneyCourse } from '../web/reader/journey-course';
import { ScreenModel } from '../src/ui/screen-model';
import { Itineraries } from '../src/ui/itinerary';

// The way a journey goes over a country is the way it would go, not a weave (the owner, 11 November: routes on the
// map zigzagged and doubled back). Two causes, both in what was planned, not in the drawing: a road's time was halved
// evenly whatever the ford it is crossed by stood nearer, and a way into the wild beside the road came out quicker
// than the road, so a journey along a river road went into the wood and out again between every stretch; and a way
// across wild country, landmark by landmark, had been laid as one stop, straight from the way in to the way out.
describe('a journey over a country', () => {
  const start = (seed: string) => DrawnWorld.start(seed, { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
    classId: 'warrior' }] }, NodeBundleSource.shared);
  it('keeps to the road along it, not in and out of the wood beside it', async () => {
    const s = await start('kahitude'), plan = Itineraries.plan(s.campaign, 'region__s4')!;
    expect(plan.legs.map(l => l.to).filter(to => /__z\d+_/.test(to))).toEqual([]);
    const laid = JourneyCourse.along(ScreenModel.build(s.campaign), plan.legs.map(l => l.to))!;
    expect(laid.length).toBe(new Set(laid).size);
  }, 120000);
  it('crosses wild country by its landmarks, each at its own hex, in the order it comes to them', async () => {
    const s = await start('marrowby'), plan = Itineraries.plan(s.campaign, 'region__s5')!;
    const screen = ScreenModel.build(s.campaign), marks = screen.region!.land!.marks;
    const by = plan.legs.flatMap(l => marks.filter(m => m.id === l.to && /__z\d+_/.test(m.id)).map(m => m.cell));
    expect(by.length).toBeGreaterThan(1);
    const laid = JourneyCourse.along(screen, plan.legs.map(l => l.to))!, at = by.map(c => laid.indexOf(c));
    expect(at.every(i => i >= 0)).toBe(true);
    expect(at).toEqual([...at].sort((a, b) => a - b));
  }, 120000);
  // A road out of the country from one town that runs through another begins at the last it runs through: begun at
  // the first, the way to Strewnfield from wren's first town went out to the next town and back through its own hex.
  // What is left is a spur: into the town a road out begins at, and out again, a hex or two.
  it('never comes back through the town it set out from, nor doubles back further than a spur', async () => {
    const s = await start('wren'), screen = ScreenModel.build(s.campaign);
    const plans = [...screen.destinations ?? [], ...screen.roads ?? []];
    expect(plans.length).toBeGreaterThan(5);
    for (const d of plans) {
      const laid = JourneyCourse.planned(screen, d.id);
      if (!laid || laid.length < 3) { continue; }
      expect(laid.slice(1)).not.toContain(laid[0]);
      expect(laid.length - new Set(laid).size).toBeLessThanOrEqual(2);
    }
  }, 120000);
});
