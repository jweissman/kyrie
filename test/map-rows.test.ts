import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { Doable } from '../src/presentation/doable';
import { MapRows } from '../src/presentation/map-rows';
import { ScreenModel } from '../src/ui/screen-model';
import { Itineraries } from '../src/ui/itinerary';
import { MapMenu } from '../web/reader/map-menu';
import { GoldenWalk } from './support/golden-walk';
import { Heard } from './support/heard';

// The map's menu is the engine's journeys of the map (OR-152; MT-18): every place Doable sets out for from the map is
// one row (MapRows), ranked by the engine, and each is reached by a row a page at a time (MapMenu.paged), where the
// page's own list of three had left Reedbridge, from Porthalen's green, with no row a key or a reader could reach.
describe('the map\'s rows', () => {
  it('are every journey the engine sets out on from the map, each reached a page at a time', async () => {
    const lines = readFileSync('doc/architecture/mission-22/golden/warrior-walk.txt', 'utf8').split('\n')
      .filter(Boolean).slice(0, GoldenWalk.opened() + 11);
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session);
    // Told of the country's towns, Reedbridge among them: the map draws what the company knows (OR-810).
    Heard.towns(journey.session.campaign);
    for (const line of lines) { await r.ask(line); }
    const screen = Itineraries.charted(r.session.campaign, ScreenModel.build(r.session.campaign)), g = r.leaf!.glance!;
    expect(screen.place.id).toBe('region__s1_green');
    const rows = MapRows.of(g, screen), mapped = new Set(Doable.flat(Doable.of(g, screen))
      .filter(x => x.map).flatMap(x => MapRows.place(x.does) ?? []));
    expect(new Set(rows.map(x => x.place))).toEqual(mapped);
    expect(rows.map(x => x.place)).toContain('region__s5');
    // A page at a time in a menu of four with Put away the map: every one is shown on some page.
    const room = MapMenu.four - 1, first = MapMenu.paged(rows, room, 0), seen = new Set<string>();
    for (let page = 0; page < first.pages; page++) {
      const p = MapMenu.paged(rows, room, page);
      expect(p.shown.length).toBeLessThanOrEqual(first.pages > 1 ? room - 1 : room);
      p.shown.forEach(x => seen.add(x.place));
    }
    expect(seen.size).toBe(rows.length);
  }, 120000);
  // From a town's own stretch of country the town is entered from the map, first (a1: Millholm from hex 89, by its
  // gate); and a journey across the country comes before a step into the next stretch (int-mat5's CI: the landing's
  // first page had been steps alone).
  it('enter the town on the company\'s own stretch first, then journeys before steps', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'a1', '--as', 'human/warrior/Wenna', '--earned']));
    for (const go of ['travel:region__s2_green', 'travel:region__t90', 'travel:region__t89']) { await journey.session.leg(go); }
    const r = new Runner(journey.session);
    r.said();
    const c = r.session.campaign, rows = MapRows.of(r.leaf!.glance!, Itineraries.charted(c, ScreenModel.build(c)));
    expect([rows[0]?.row.label, rows[0]?.close]).toEqual(['Enter Millholm', true]);
    const first = rows.findIndex(x => x.row.does?.startsWith('travel:')), step = rows.findIndex(x => x.row.does?.startsWith('go(')
      && !x.close);
    expect(step < 0 || first < step).toBe(true);
  }, 120000);
});
