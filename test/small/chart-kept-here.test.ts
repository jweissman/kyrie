import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ChartModel } from '../../src/ui/chart-model';
import { KeptParts } from '../../src/ui/kept-parts';
import { ScreenModel } from '../../src/ui/screen-model';

// Where the company stands, marked on a chart kept without it (OR-1601): a step between rooms the company has been to
// draws no plan again, only the place marked as here; the chart so marked is the one drawn afresh; and the same plan
// marked at the same place is the same chart, so that what is kept by it is kept still. A hold off the moor, its door
// barred to the company in the dark of the hall beyond, so that what bars a way is told by whether the company is in
// the dark where it stands.
const hold = `
  Place moor "the moor" is room at 0, 0 outdoors.
  Place hold "the hold" is site at 1, 0.
  Place door "the door of the hold" is room within hold at 0, 0 outdoors.
  Place hall "the hall" is room within hold at 1, 0 indoors.
  Place crack "a spy-crack" is room within hold at 2, 0 indoors.
  Passage track "the moor track" is path between moor and door.
  Passage way_in "the way in" is door between door and hall.
  Passage cleft "a cleft in the wall" is path between hall and crack.
  Company party "You" of 1 at door.
  Goal false.`;
const plans = { n: 0 };
const proto = ChartModel.prototype as unknown as { plan: (...a: unknown[]) => unknown };
const plan = proto.plan;
proto.plan = function (this: ChartModel, ...a: unknown[]) { plans.n++; return plan.apply(this, a); };
const here = (t: Tiny) => t.screen.chart?.places.filter(p => p.here).map(p => p.id);

describe('the chart kept without where the company stands', () => {
  it('draws no plan again for a step between rooms been to, and marks where the company stands', async () => {
    const t = await Tiny.start(hold);
    await t.play('To the hall');
    await t.play('To the door of the hold');
    const drawn = plans.n;
    await t.play('To the hall');
    expect(here(t)).toEqual(['t__hall']);
    await t.play('To the door of the hold');
    expect(here(t)).toEqual(['t__door']);
    expect(plans.n).toBe(drawn);
  });
  it('is the chart drawn afresh, wherever the company stands', async () => {
    const t = await Tiny.start(hold);
    for (const step of ['To the hall', 'To the door of the hold', 'To the hall', 'To a spy-crack', 'To the hall']) {
      await t.play(step);
      const kept = ScreenModel.build(t.campaign);
      KeptParts.keeping = false;
      try {
        const fresh = ScreenModel.build(t.campaign);
        expect({ step, chart: kept.chart, region: kept.region })
          .toEqual({ step, chart: fresh.chart, region: fresh.region });
      } finally { KeptParts.keeping = true; }
    }
  });
  it('is the same chart where the same plan is marked at the same place', async () => {
    const t = await Tiny.start(hold);
    await t.play('To the hall');
    await t.play('To the door of the hold');
    const atDoor = t.screen.chart;
    await t.play('To the hall');
    expect(t.screen.chart).not.toBe(atDoor);
    await t.play('To the door of the hold');
    expect(t.screen.chart).toBe(atDoor!);
  });
});
