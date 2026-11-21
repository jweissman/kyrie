import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { JourneyCourse } from '../web/reader/journey-course';
import { HexGrid } from '../web/reader/board/hex-grid';
import { Glanced } from './support/glanced';

// A journey walked on the map a hex at a time (the owner's playtest of 20 November, OR-162: "The paths are still very
// chaotic, seemingly overshooting the target and doubling back … it should be reasonably mechanical, hex-by-hex"). From
// Porthalen 15 of 51 planned courses had jumped four hexes to the middle of the vale of the Whitewater and walked back
// along the road to it (174, 170, 173, 172, 171, 170). Every course the map would walk, from where each world begins:
// each step to a neighbouring hex, and no hex stood on twice but for a spur of one into a place the way comes to.
describe('a journey\'s course on the map', () => {
  for (const world of ['iscoed', 'a1', 'kite']) {
    it(`is walked a hex at a time and never doubles back but by a spur, from ${world}'s start`, async () => {
      const { journey } = await PlayTool.start(PlayTool.parse(['--world', world]));
      const screen = Glanced.of(journey.session).frame().screen, land = screen.region?.land;
      expect(land).toBeDefined();
      const grid = new HexGrid(land!.width, land!.height), bad: string[] = [];
      const plans = [...screen.destinations ?? [], ...screen.roads ?? [], ...screen.mapped ?? []];
      for (const d of plans) {
        const cells = JourneyCourse.planned(screen, d.id) ?? [];
        const jump = cells.findIndex((c, i) => i > 0 && !grid.neighbours(cells[i - 1]!).includes(c));
        // Back over a hex only as a spur of one, into a place the way comes to and straight out (test/route-weave).
        const twice = cells.findIndex((c, i) => cells.indexOf(c) !== i && cells[i - 2] !== c);
        if (jump >= 0 || twice >= 0) { bad.push(`${d.id}: ${cells.join(',')}`); }
      }
      expect(plans.length).toBeGreaterThan(3);
      expect(bad).toEqual([]);
    }, 180000);
  }
});
