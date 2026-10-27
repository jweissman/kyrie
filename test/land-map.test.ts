import { describe, expect, it } from 'bun:test';
import { Atlas } from '../web/reader/atlas';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import type { RegionChart } from '../src/ui/screen-types';

// The map draws what the company knows of the land, plainly: each known cell its land's tone, water as water, the
// rest of the country as a faint grid; a name beside each place, never across another; and the company, the places
// it knows and the ways it knows, where they are on the land. a1: Murkstede by the sea, Eikwudu east of it.
class Land {
  // A land of rows of cover marks, all of it known but the last row, with a town in the middle of the first row.
  static region(rows: string[]): RegionChart {
    const width = rows[0]!.length, cover = rows.join(''), known = [...cover].map((_, i) => i).filter(i => i < width * (rows.length - 1));
    return { areas: [{ id: 't', name: 'Murkstede', kind: 'settlement', x: Math.floor(width / 2), y: 0, visited: true, here: true }],
      edges: [], within: {}, land: { width, height: rows.length, cover, rivers: [], roads: {}, known,
        here: Math.floor(width / 2),
        marks: [{ id: 'oak', name: 'the great oak', cell: width + 1, kind: 'landmark', visited: false, here: false }],
        zones: [], glosses: {} } };
  }
}

describe('the map', () => {
  it('draws the cells the company knows in the tone of their land, and the rest as a faint grid', () => {
    const d = Atlas.draw(Land.region(['~~...', '.ww..', 'fffff']));
    expect(d.cells.map(c => c.cover)).toEqual(['water', 'water', 'known', 'known', 'known', 'known', 'wood', 'wood',
      'known', 'known']);
    expect(d.unknown).toHaveLength(5);
    expect(d.here).toEqual({ x: 2 * Atlas.S + Atlas.S / 2, y: Atlas.S / 2 });
  });
  it('writes no name across another, nor across a place', () => {
    const d = Atlas.draw(Land.region(['.........', '.........', '.........', '.........']));
    expect(d.labels.map(l => l.text)).toEqual(['Murkstede', 'great oak']);
    const boxes = d.labels.map(l => {
      const w = l.text.length * (l.kind === 'settlement' ? 9.4 : 6.6), x = l.anchor === 'start' ? l.x : l.anchor === 'end'
        ? l.x - w : l.x - w / 2;
      return [x, l.y - 12, x + w, l.y + 3];
    });
    const [a, b] = boxes as [number[], number[]];
    expect(a[0]! < b[2]! && a[2]! > b[0]! && a[1]! < b[3]! && a[3]! > b[1]!).toBe(false);
  });
  // A town's name is not set across its own road: to the right of it with no road there, elsewhere with the road
  // east out of it.
  it('writes a name on a side no road runs through', () => {
    const rows = Array.from({ length: 5 }, () => '.'.repeat(21)), open = Land.region(rows), roaded = Land.region(rows);
    roaded.land!.roads = { east: [11, 12, 13, 14, 15] };
    const name = (r: RegionChart) => Atlas.draw(r).labels.find(l => l.text === 'Murkstede')!.anchor;
    expect([name(open), name(roaded) === 'start']).toEqual(['start', false]);
  });
  it('draws the company, the places it knows and the ways it knows where they are on the land', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'a1', w.source);
    for (const way of [/s1_green\)$/, /to the edge of Eikwudu/, /charcoal-burners/]) {
      const c = PlayerView.choices(s.campaign).find(x => way.test(x.choice.name) || way.test(x.choice.id))!;
      await s.perform(c.choice.id);
    }
    const region = ScreenModel.build(s.campaign).region!, land = region.land!;
    const clearing = land.marks.find(m => m.name.startsWith('the charcoal-burners\' clearing'))!;
    expect(clearing).toMatchObject({ kind: 'landmark', visited: true, here: true });
    expect(land.here).toBe(clearing.cell);
    // The old bank is known of, from the edge of the wood, but not yet been to.
    expect(land.marks.find(m => m.name === 'the old bank')).toMatchObject({ visited: false, here: false });
    expect(land.zones.map(z => z.name)).toEqual(['Eikwudu']);
    expect(land.zones[0]!.cells).toContain(clearing.cell);
    // The road out of Murkstede runs over the road's own cells, half of it to the country between the two towns.
    const road = region.edges.find(e => e.road && e.from === 'region__s1' && e.to === 'region__s1_s4_land')!;
    expect(road).toMatchObject({ road: true });
    expect(road.course![0]).toBe(42);
    expect(land.glosses).toMatchObject({ region__s1: 'Westron for “black stead”' });
  }, 60000);
});
