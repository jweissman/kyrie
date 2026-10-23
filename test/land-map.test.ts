import { describe, expect, it } from 'bun:test';
import { Cartography, type Ground } from '../web/reader/cartography';
import { MapMarks } from '../web/reader/map-marks';
import { MapLabels, type Wanted } from '../web/reader/map-labels';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';

// The map draws the land, not its cells: a shore where water meets land and nowhere else, a pond as a pond, trees
// scattered inside a wood's outline and off its road, names that never cross; and the company, the places it knows
// and the ways it knows, where they are on the land. a1: Murkstede by the sea, Eikwudu east of it.
class Land {
  static readonly S = Cartography.cell;
  // A land of rows of cover marks.
  static ground(rows: string[]): Ground { return { width: rows[0]!.length, height: rows.length, cover: rows.join('') }; }
  static is(ground: Ground, marks: string) { return (c: number) => marks.includes(ground.cover[c]!); }
  // Where within a cell of a six-wide land its marks fall.
  static within(marks: { x: number; y: number }[], c: number): string {
    return marks.filter(t => Math.floor(t.x / this.S) === c % 6 && Math.floor(t.y / this.S) === Math.floor(c / 6))
      .map(t => `${(t.x % this.S).toFixed(0)},${(t.y % this.S).toFixed(0)}`).join(' ');
  }
}

describe('the map', () => {
  it('draws a shore where water meets land, and none along the edge of the land', () => {
    const ground = Land.ground(['~~....', '~~....', '~~....', '~~....']);
    const rings = Cartography.outlines(Cartography.field(ground, Land.is(ground, '~'), 4, 0.6), 0.5);
    const points = rings.flat();
    // The shore runs between the sea's cells and the land's; the outline closes out of sight beyond the land.
    expect(points.some(p => p.x > 1.6 * Land.S && p.x < 2.4 * Land.S)).toBe(true);
    expect(points.filter(p => p.x > -0.3 * Land.S && p.x < 1.5 * Land.S && p.y > 0 && p.y < 4 * Land.S)).toEqual([]);
  });
  it('draws one cell of water as a pond, round and smaller than its cell', () => {
    const ground = Land.ground(['...', '.o.', '...']);
    const [ring, ...rest] = Cartography.outlines(Cartography.field(ground, Land.is(ground, 'o'), 4, 0), 0.5);
    expect(rest).toEqual([]);
    const area = Math.abs(Cartography.area(Cartography.round(ring!)));
    expect(area).toBeGreaterThan(0.25 * Land.S ** 2);
    expect(area).toBeLessThan(0.8 * Land.S ** 2);
    expect(Cartography.round(ring!).length).toBeGreaterThanOrEqual(48);
  });
  it('scatters trees inside the outline of the wood and off the road through it', () => {
    const ground = Land.ground(['......', '.wwww.', '.wwww.', '.wwww.', '......']);
    const field = Cartography.field(ground, Land.is(ground, 'w'), 4, 0.8);
    const road = [{ x: 0, y: 2.5 * Land.S }, { x: 6 * Land.S, y: 2.5 * Land.S }];
    const cells = [...ground.cover].flatMap((_, c) => c);
    const trees = MapMarks.scatter(ground, cells, { w: field }, { spots: [], lines: [road] });
    expect(trees.length).toBeGreaterThan(30);
    expect(trees.every(t => Cartography.value(field, t.x / Land.S, t.y / Land.S) >= 0.6)).toBe(true);
    expect(trees.every(t => MapMarks.distance(road, t) > 15)).toBe(true);
    // Not set out cell by cell: no two cells hold their trees at the same places within them.
    expect(Land.within(trees, 7)).not.toBe(Land.within(trees, 8));
  });
  it('writes no name across another, nor across a mark already set down', () => {
    const marks = [{ x: 100, y: 100 }, { x: 160, y: 110 }, { x: 130, y: 160 }, { x: 110, y: 130 }];
    const wanted: Wanted[] = marks.map((p, i) => ({ id: `m${i}`, text: `the long name of the place ${i}`, at: [p],
      size: 19, face: 'italic', gap: 14 }));
    const taken = marks.map(p => MapLabels.around(p, 9));
    const placed = MapLabels.place(wanted, [...taken]);
    expect(placed.length).toBeGreaterThan(1);
    const boxes = [...taken, ...placed.map(p => p.box)];
    for (const [i, a] of boxes.entries()) { expect(MapLabels.free(boxes.filter((_, j) => j !== i), a)).toBe(true); }
    expect(placed[0]!.lines).toEqual(['the long name', 'of the place 0']);
  });
  it('draws the company, the places it knows and the ways it knows where they are on the land', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'a1', w.source);
    for (const way of [/Murkstede green$/, /to the edge of Eikwudu/, /charcoal-burners/]) {
      await s.perform(PlayerView.choices(s.campaign).find(c => way.test(c.choice.name))!.choice.id);
    }
    const region = ScreenModel.build(s.campaign).region!, land = region.land!;
    const clearing = land.marks.find(m => m.name === 'the charcoal-burners\' clearing')!;
    expect(clearing).toMatchObject({ kind: 'landmark', visited: true, here: true });
    expect(land.here).toBe(clearing.cell);
    // The old bank is known of, from the edge of the wood, but not yet been to.
    expect(land.marks.find(m => m.name === 'the old bank')).toMatchObject({ visited: false, here: false });
    expect(land.zones.map(z => z.name)).toEqual(['Eikwudu']);
    expect(land.zones[0]!.cells).toContain(clearing.cell);
    // The road out of Murkstede runs over the road's own cells, half of it to the country between the two towns.
    const road = region.edges.find(e => e.label.startsWith('the road from Murkstede'))!;
    expect(road).toMatchObject({ road: true });
    expect(road.course![0]).toBe(42);
    expect(land.glosses).toMatchObject({ region__s1: 'Westron for “black stead”' });
  }, 60000);
});
