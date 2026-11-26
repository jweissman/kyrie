import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { Frame } from '../src/creation/protocol';
import { MapRows } from '../src/presentation/map-rows';
import { MapView } from '../web/reader/map-view';
import { MapMenu } from '../web/reader/map-menu';

// The map's card plays the engine's row for the place viewed, never a set-out of its own (OR-840). A place viewed from
// the map's rows (MapMenu's View …) had been chosen as the hex it stands in, and the card's Travel to set out for that
// hex: leaving Porthalen for the way into Tolleth, it went to the open fields east of Reedbridge, and for each of the
// country's other ways out to the open ground nearest them (test/page-walk-browser). A way into the next stretch of
// country, the engine's go(…), the card had set out on as a journey of its own (travel:…). Headless, on the frame the
// page is given at Porthalen's landing (charted, as the page draws the map: Itineraries.charted).
describe('the map\'s card', () => {
  it('sets out by the engine\'s own row for every place the map\'s rows view', async () => {
    const host = new EngineHost(() => undefined);
    const frame = await host.handle({ kind: 'begin', campaign: 'world', seed: 'iscoed', origin: 'drove', opening: 'none',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] } as never) as Frame;
    const screen = frame.screen, g = frame.leaf.glance!, rows = MapRows.of(g, screen).filter(r => !r.close);
    expect(screen.place.id).toBe('region__s1_green');
    expect(rows.map(r => r.place)).toEqual(expect.arrayContaining(['region__gate_tolleth', 'region__z1_heart']));
    for (const r of rows) {
      const go = MapView.way(screen, MapMenu.viewed(r), g).go;
      expect([r.place, go?.id, go?.command]).toEqual([r.place, r.row.id, r.row.does]);
    }
    // The board rings where the place stands: the way into Tolleth on the hex its country is drawn at.
    expect(MapView.shown(screen.region!, 'region__gate_tolleth')).toMatch(/^hex:\d+$/);
  }, 60000);
});
