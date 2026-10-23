import { Spatial } from '../spatial';
import type { Entity, LandChart } from '../lang/module';
import type { WayInfo } from './passage-model';
import type { RegionChart } from './screen-types';

type Land = NonNullable<RegionChart['land']>;

// A region's land as the company knows it, for its map: the cells it has seen, where each place it knows stands on
// them, the wild country it has been into or knows of, and the course each known way takes over the land. Drawn from
// the region's chart and what the company has walked and heard, never from anything it has not.
export class LandModel {
  constructor(private readonly chart: LandChart, private readonly entities: Map<string, Entity>) {}
  // The cell a place stands at: its own, or else its site's, its settlement's or its wild country's.
  cell(id: string): number | undefined {
    return Spatial.ancestry(this.entities, id).map(e => this.chart.places[e.id]).find(c => c !== undefined);
  }
  // The place that stands for one on the land: itself, or the site, settlement or wild country it lies in.
  private marked(id: string): Entity | undefined {
    return Spatial.ancestry(this.entities, id).find(e => this.chart.places[e.id] !== undefined);
  }
  // The cells a way runs over. Along a road, the half of it from the end the company would set out from (or all of
  // it, to a march-stone at its far end); a path or a track, from one end straight to the other, or to the road it
  // meets.
  course(from: string, to: string): { course: number[]; road: boolean } | undefined {
    const roads = this.chart.roads, r = roads[from] ? from : roads[to] ? to : undefined;
    if (!r) {
      const a = this.cell(from), b = this.cell(to);
      return a !== undefined && b !== undefined && a !== b ? { course: [a, b], road: false } : undefined;
    }
    const cells = roads[r]!, other = this.cell(r === from ? to : from);
    if (other === undefined || !cells.length) { return undefined; }
    const near = cells.reduce((best, c, i) => this.apart(c, other) < this.apart(cells[best]!, other) ? i : best, 0);
    if (cells[near] !== other) { return { course: [other, cells[near]!], road: false }; }
    if (near !== 0 && near !== cells.length - 1) { return undefined; }
    const run = near === 0 ? cells : [...cells].reverse();
    return { course: this.chart.places[r] !== undefined ? run : run.slice(0, Math.ceil(run.length / 2)), road: true };
  }
  private apart(a: number, b: number): number {
    const w = this.chart.width;
    return Math.hypot(a % w - b % w, Math.floor(a / w) - Math.floor(b / w));
  }
  // The land the company knows: around every settlement it has been to, along every road it has walked and every
  // part of wild country it has crossed, and the cell of each place it has been to or knows the way to.
  land(visited: Set<string>, ways: WayInfo[], here: string, areas: RegionChart['areas']): Land {
    const chart = this.chart, known = new Set<number>(), heard = new Set(ways.flatMap(w => [w.from, w.to]));
    for (const id of visited) {
      const area = this.marked(id), at = this.cell(id);
      for (const c of chart.parts[id] ?? chart.roads[id] ?? []) { this.reveal(c, 1, known); }
      if (at !== undefined) { this.reveal(at, area?.space?.kind === 'settlement' ? 2 : 1, known); }
    }
    for (const id of heard) {
      const at = this.cell(id);
      if (at !== undefined) { known.add(at); }
    }
    const roads = Object.fromEntries(Object.entries(chart.roads).filter(([way]) => visited.has(way) || heard.has(way)));
    for (const cells of Object.values(roads)) { for (const c of cells) { known.add(c); } }
    const marks = this.marks([...visited, ...heard], visited, here);
    const named = new Set([...areas.map(a => a.id), ...marks.map(m => m.id)]);
    return { width: chart.width, height: chart.height, cover: chart.cover, rivers: chart.rivers, roads,
      known: [...known].sort((a, b) => a - b), ...this.at(here), marks, zones: this.zones(areas, known),
      glosses: Object.fromEntries(Object.entries(chart.glosses ?? {}).filter(([id]) => named.has(id))) };
  }
  // Where the company is: at its place's cell, or on a road, halfway along it; nowhere, when it is lost in wild
  // country (a place there with no cell of its own).
  private at(here: string): { here?: number } {
    const lost = this.chart.places[here] === undefined && this.marked(here)?.space?.kind === 'wilderness';
    const road = this.chart.roads[here], c = lost ? undefined : this.cell(here) ?? road?.[Math.floor(road.length / 2)];
    return c === undefined ? {} : { here: c };
  }
  // Each place on the land the company knows that is not a settlement or a stretch of wild country: a landmark in a
  // wood, a site, a march-stone. A site is one mark, however many rooms of it are known.
  private marks(ids: string[], visited: Set<string>, here: string): Land['marks'] {
    const rows = new Map<string, Land['marks'][number]>(), line = new Set(Spatial.ancestry(this.entities, here).map(e => e.id));
    for (const id of ids) {
      const e = this.marked(id);
      if (!e?.space || ['settlement', 'wilderness'].includes(e.space.kind)) { continue; }
      const row = rows.get(e.id) ?? { id: e.id, name: e.name, cell: this.chart.places[e.id]!, kind: this.kind(e),
        visited: false, here: line.has(e.id) };
      row.visited ||= visited.has(id);
      rows.set(e.id, row);
    }
    return [...rows.values()];
  }
  // A site; a landmark of wild country (a room of a stretch of it that has parts on the land); or a march-stone.
  private kind(e: Entity): string {
    if (e.space?.kind !== 'room') { return e.space?.kind ?? 'room'; }
    const parent = e.space.parent;
    return Object.keys(this.chart.parts).some(room => this.entities.get(room)?.space?.parent === parent) ? 'landmark' : 'stone';
  }
  // The wild country on the chart, with the cells of it the company knows, to write its name across.
  private zones(areas: RegionChart['areas'], known: Set<number>): Land['zones'] {
    return areas.filter(a => a.kind === 'wilderness').flatMap(a => {
      const cells = Object.entries(this.chart.parts).filter(([room]) => this.entities.get(room)?.space?.parent === a.id)
        .flatMap(([, part]) => part).filter(c => known.has(c));
      const form = a.form ? { form: a.form } : {};
      return cells.length ? [{ id: a.id, name: a.name, cells: [...new Set(cells)], ...form }] : [];
    });
  }
  private reveal(cell: number, reach: number, known: Set<number>) {
    const { width, height } = this.chart, x = cell % width, y = Math.floor(cell / width);
    for (let dy = -reach; dy <= reach; dy++) {
      for (let dx = -reach; dx <= reach; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < width && ny < height) { known.add(ny * width + nx); }
      }
    }
  }
}
