import { Spatial } from '../spatial';
import type { Entity, LandChart } from '../lang/module';
import type { WayInfo } from './passage-model';
import type { RegionChart } from './screen-types';

type Land = NonNullable<RegionChart['land']>;
// What the company has looked out over (see RegionTracts): the stretches of open country it surveyed, those it
// surveyed with the eye of someone who knows how to look (or a glass), and those it looked out from in haze.
export interface Surveys { surveyed: string[]; well: string[]; dim: string[] }

// A region's land as the company knows it, for its map: the cells it has seen, where each place it knows stands on
// them, the wild country it has been into or knows of, and the course each known way takes over the land. Drawn from
// the region's chart and what the company has walked and heard, never from anything it has not.
export class LandModel {
  constructor(private readonly chart: LandChart, private readonly entities: Map<string, Entity>) {}
  // A stretch of a country's open country (see RegionTracts), by its id.
  static readonly tract = /__t\d+$/;
  // How far the eye goes from a stretch looked out from, by its land: from the heights far, from a wood or a fen
  // hardly past the next stretch.
  static readonly sight: Record<string, number> = { p: 4, f: 3, h: 3, '.': 2, w: 1, ',': 1 };
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
  // An authored region's ways are roads of their own, by the way's name (see AuthoredLand).
  course(from: string, to: string, passage?: string): { course: number[]; road: boolean } | undefined {
    const own = passage ? this.chart.roads[passage] : undefined;
    if (own?.length) { return { course: this.cell(from) === own[0] ? own : [...own].reverse(), road: true }; }
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
  // part of wild country it has crossed (as far as one sees from a road, a couple of cells either side: a map of only
  // the road's own cells had been fog with a thread through it), and the cell of each place it has been to or knows
  // the way to.
  land(seen: { visited: Set<string>; told: string[]; surveys?: Surveys }, ways: WayInfo[], here: string,
    areas: RegionChart['areas']): Land {
    const chart = this.chart, visited = seen.visited, known = this.explored(visited, seen.surveys);
    const heard = new Set([...ways.flatMap(w => [w.from, w.to]), ...seen.told, ...this.found(visited)]);
    for (const id of [...visited].filter(v => !LandModel.tract.test(v))) {
      const area = this.marked(id), at = this.cell(id);
      for (const c of chart.parts[id] ?? chart.roads[id] ?? []) { this.reveal(c, 2, known); }
      if (at !== undefined) { this.reveal(at, area?.space?.kind === 'settlement' ? 3 : 2, known); }
      for (const c of (area && chart.blocks?.[area.id]) ?? []) { this.reveal(c, 1, known); }
    }
    for (const id of heard) {
      const at = this.cell(id);
      if (at !== undefined) { known.add(at); }
    }
    const passages = new Set(ways.map(w => w.passage));
    const roads = Object.fromEntries(Object.entries(chart.roads).filter(([way]) => visited.has(way) || heard.has(way)
      || passages.has(way)));
    for (const cells of Object.values(roads)) { for (const c of cells) { known.add(c); } }
    const marks = this.marks([...visited, ...heard].filter(id => !LandModel.tract.test(id)), visited, here);
    const named = new Set([...areas.map(a => a.id), ...marks.map(m => m.id)]);
    return { width: chart.width, height: chart.height, cover: chart.cover, rivers: chart.rivers, roads,
      known: [...known].sort((a, b) => a - b), ...this.at(here), marks, zones: this.zones(areas, known),
      glosses: Object.fromEntries(Object.entries(chart.glosses ?? {}).filter(([id]) => named.has(id))),
      ...chart.blocks ? { blocks: chart.blocks } : {}, ...this.tracts() };
  }
  // The stretches of open country known by exploring: each walked, with those about it; about each looked out from,
  // as far as its land lets the eye go, one stretch further for someone who knows how to look, one only in haze.
  explored(visited: Set<string>, surveys?: Surveys): Set<number> {
    const chart = this.chart, known = new Set<number>();
    for (const id of [...visited].filter(v => LandModel.tract.test(v))) {
      const c = chart.places[id];
      if (c !== undefined) { this.reveal(c, 1, known); }
    }
    const well = new Set(surveys?.well ?? []);
    for (const id of surveys?.surveyed ?? []) {
      const c = chart.places[id];
      if (c !== undefined) { this.reveal(c, (LandModel.sight[chart.cover[c] ?? '.'] ?? 2) + (well.has(id) ? 1 : 0), known); }
    }
    for (const id of surveys?.dim ?? []) {
      const c = chart.places[id];
      if (c !== undefined) { this.reveal(c, 1, known); }
    }
    return known;
  }
  // What stands on a stretch walked is found there, whether or not it could be seen from afar (a cave, a clearing).
  private found(visited: Set<string>): string[] {
    const walked = new Set([...visited].filter(v => LandModel.tract.test(v)).map(v => this.chart.places[v]));
    return Object.entries(this.chart.places).filter(([id, c]) => walked.has(c) && !LandModel.tract.test(id)
      && this.entities.get(id)?.space?.kind === 'room').map(([id]) => id);
  }
  // The id each stretch of open country is known by, but for its cell, for the map to go to one.
  private tracts(): { tracts?: string } {
    const one = Object.keys(this.chart.places).find(id => LandModel.tract.test(id));
    return one ? { tracts: one.replace(/\d+$/, '') } : {};
  }
  // Where the company is: at its place's cell, or on a road, halfway along it; nowhere, when it is lost in wild
  // country (a place there with no cell of its own).
  private at(here: string): { here?: number } {
    // An authored region's land knows each stretch of it whole (see AuthoredLand): nobody is lost on it.
    const lost = !this.chart.blocks && this.chart.places[here] === undefined && this.marked(here)?.space?.kind === 'wilderness';
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
