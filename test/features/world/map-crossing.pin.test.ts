import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../../../src/world/drawn-world';
import { NodeBundleSource } from '../../../src/campaign/node-bundle-source';
import { PlayerView } from '../../../src/presentation/player-view';
import { Undertakings } from '../../../src/presentation/undertakings';
import { Narrator } from '../../../src/presentation/narrator';
import { ScreenModel } from '../../../src/ui/screen-model';
import { Itineraries } from '../../../src/ui/itinerary';
import { Doable } from '../../../src/presentation/doable';
import { MapRows } from '../../../src/presentation/map-rows';
import { HexBoundary } from '../../../src/hex-boundary';
import { Passages } from '../../../src/ui/passages';
import { Earned } from '../../../src/lang/index';

// Feature pins: see test/features/choice/consequence.pin.test.ts. Ways to another hex appear only on the map (the
// owner, 25 November: in a new life's first town one act had carried the company more than a hex, the map never
// opened). At a1's first town, the brothers' errand to the old writing at Neblalac followed: no row the scene offers
// goes, or walks by a way that goes, into another hex; the aim's step is to open the map, in gold; and the map, open,
// sets out for Neblalac.
describe('a way to another hex', () => {
  it('is on the map alone, its aim leading there in gold, and the map sets out on it', async () => {
    const s = await DrawnWorld.start('a1', { origin: 'order',
      party: [{ name: 'B', raceId: 'dwarf', classId: 'cleric' }] }, NodeBundleSource.shared);
    const c = s.campaign;
    // On the earned stage (OR-1245): the map is hidden while compactification holds (test/small/one-map-row).
    Earned.grant(c);
    await s.leg(PlayerView.choices(c).find(x => /the brothers' letter/.test(x.choice.name))!.choice.id);
    Undertakings.follow(c, Undertakings.held(c).find(o => Undertakings.errand(c, o))!.id);
    const screen = Itineraries.charted(c, ScreenModel.build(c)), glance = Narrator.leaf(c, screen).glance!;
    const here = c.world.one('at', c.playerActor!)!, rows = Doable.flat(Doable.of(glance, screen));
    const stops = new Map([...screen.destinations ?? [], ...screen.around ?? [], ...screen.roads ?? []]
      .map(d => [d.id, d.stops ?? [d.id]]));
    const away = rows.filter(r => !r.map && r.does).flatMap(r => {
      const to = MapRows.place(r.does);
      return to && (HexBoundary.crosses(c.module, here, to) || Passages.leaves(c.module, here, stops.get(to) ?? []))
        ? [`${r.id}: ${r.label}`] : [];
    });
    expect(away).toEqual([]);
    const step = rows.find(r => r.led && r.chart);
    expect(step).toMatchObject({ label: 'Open the map', does: `view:map:${step?.chart}` });
    expect(glance.acts.find(a => a.continues)?.command).toBe(`travel:${step!.chart}`);
    expect(MapRows.of(glance, screen).map(m => m.row.does)).toContain(`travel:${step!.chart}`);
  }, 60000);
});
