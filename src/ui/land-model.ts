import { Spatial } from '../spatial';
import type { Entity, LandChart } from '../lang/module';
import type { WayInfo } from './passage-model';
import type { Knowing, RegionChart } from './screen-types';

type Land = NonNullable<RegionChart['land']>;
// What the company has looked out over (see RegionTracts): the stretches of open country it surveyed, those it
// surveyed with the eye of someone who knows how to look (or a glass), and those it looked out from in haze.
export interface Surveys { surveyed: string[]; well: string[]; dim: string[] }
// What the company knows of a country, for its map: where it has been; the places it has been told of, and of those
// the ones it has seen from afar (from high ground, or looking out over the country); the ways whose course it was
// told (see ChartModel.routes); and what it has looked out over.
export interface Seen { visited: Set<string>; told: string[]; sighted?: string[]; routes?: string[]; surveys?: Surveys }

// A region's land as the company knows it, for its map: the cells it has seen, where each place it knows of stands on
// them and how much it knows of it, the wild country it has been into or knows of, and the course each known way
// takes over the land. Drawn from the region's chart and what the company has walked, seen and heard, never from
// anything it has not.
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
  // the road's own cells had been fog with a thread through it), what it has explored, where each place it has seen
  // stands, and the course of each way whose course it knows (walked, or told it: a guide's directions, or the roads
  // and paths of a country one who knows the lie of it knows as from a map). A place only heard of is on the map, but
  // not the land about it nor the way to it (the owner's corrections of 2026-10-29: hearsay had drawn the land under
  // every place named and the whole of every road to it). The country's roads are drawn where the land is known.
  land(seen: Seen, ways: WayInfo[], here: string, areas: RegionChart['areas']): Land {
    const chart = this.chart, visited = seen.visited, known = this.explored(visited, seen.surveys);
    for (const id of [...visited].filter(v => !LandModel.tract.test(v))) { this.about(id, known); }
    const routed = new Set([...seen.routes ?? [], ...ways.filter(w => visited.has(w.from) && visited.has(w.to))
      .map(w => w.passage)]), routes = ways.filter(w => routed.has(w.passage));
    const sighted = new Set([...seen.sighted ?? [], ...this.found(visited)]);
    for (const id of [...sighted, ...routes.flatMap(w => [w.from, w.to])]) {
      const at = this.cell(id);
      if (at !== undefined) { known.add(at); }
    }
    const heard = new Set([...ways.flatMap(w => [w.from, w.to]), ...seen.told]);
    const passages = new Set(ways.map(w => w.passage));
    const roads = Object.fromEntries(Object.entries(chart.roads).filter(([way]) => visited.has(way) || heard.has(way)
      || passages.has(way)));
    const ends = new Set(routes.flatMap(w => [w.from, w.to]));
    for (const [way, cells] of Object.entries(roads)) {
      if (routed.has(way) || ends.has(way)) { for (const c of cells) { known.add(c); } }
    }
    const placed = this.marks({ visited, sighted, heard }, here), towns = this.towns(areas, known);
    const marks = [...placed, ...this.unmade(new Set([...placed.map(m => m.cell),
      ...Object.keys(towns).map(t => this.chart.places[t])]), known)];
    const named = new Set([...areas.map(a => a.id), ...placed.map(m => m.id)]);
    return { width: chart.width, height: chart.height, cover: chart.cover,
      rivers: chart.rivers.map((r, i) => LandModel.drawn(chart, r, i)), roads,
      known: [...known].sort((a, b) => a - b), ...this.at(here), marks, towns, zones: this.zones(areas, known),
      glosses: Object.fromEntries(Object.entries(chart.glosses ?? {}).filter(([id]) => named.has(id))),
      ...chart.blocks ? { blocks: chart.blocks } : {}, ...this.tracts() };
  }
  // The land about a place been to: a settlement's country, a road's or a wild country's either side of it, an
  // authored area's own stretch.
  private about(id: string, known: Set<number>): void {
    const chart = this.chart, area = this.marked(id), at = this.cell(id);
    for (const c of chart.parts[id] ?? chart.roads[id] ?? []) { this.reveal(c, 2, known); }
    if (at !== undefined) { this.reveal(at, area?.space?.kind === 'settlement' ? 3 : 2, known); }
    for (const c of (area && chart.blocks?.[area.id]) ?? []) { this.reveal(c, 1, known); }
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
  // What stands on a stretch walked is found there, whether or not it could be seen from afar (a cave, a clearing, a
  // ruin), and seen for what it is.
  private found(visited: Set<string>): string[] {
    const walked = new Set([...visited].filter(v => LandModel.tract.test(v)).map(v => this.chart.places[v]));
    return Object.entries(this.chart.places).filter(([id, c]) => walked.has(c) && !LandModel.tract.test(id)
      && ['room', 'site'].includes(this.entities.get(id)?.space?.kind ?? '')).map(([id]) => id);
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
  // Each place on the land the company knows of that is not a settlement or a stretch of wild country (a landmark in
  // a wood, a site, a march-stone), by how much it knows of it: been to, seen, or only heard of. A site is one mark,
  // however many rooms of it are known.
  private marks(of: { visited: Set<string>; sighted: Set<string>; heard: Set<string> }, here: string): Land['marks'] {
    const rows = new Map<string, Land['marks'][number]>(), rank: Knowing[] = ['unknown', 'heard', 'seen', 'visited'];
    const line = new Set(Spatial.ancestry(this.entities, here).map(e => e.id));
    for (const id of [...of.visited, ...of.sighted, ...of.heard].filter(x => !LandModel.tract.test(x))) {
      const e = this.marked(id);
      if (!e?.space || LandModel.areas.includes(e.space.kind)) { continue; }
      const state = of.visited.has(id) ? 'visited' : of.sighted.has(id) ? 'seen' : 'heard', row = rows.get(e.id);
      if (row && rank.indexOf(row.state) >= rank.indexOf(state)) { continue; }
      rows.set(e.id, { id: e.id, name: e.name, cell: this.chart.places[e.id]!, kind: state === 'heard' ? 'place'
        : this.kind(e), visited: state === 'visited', here: line.has(e.id), state });
    }
    return [...rows.values()];
  }
  // A site standing on the known land, or a hex beyond it, that the company knows nothing of (a ruin, a tower, a
  // cave): something there, not made out, one to a hex where nothing it knows of stands (no town, no place). Not
  // the edges of wild country, its landmarks nor the march-stones, which are the land's own and found by going there.
  // Known by its hex alone (unmade:<cell>), not by what it is, so that neither the map nor the way there gives away
  // its name.
  private unmade(marked: Set<number | undefined>, known: Set<number>): Land['marks'] {
    const near = new Set([...known].flatMap(c => [c, ...this.round(c)]));
    const cells = new Set(Object.entries(this.chart.places).filter(([id, c]) => near.has(c) && !marked.has(c)
      && LandModel.site(this.entities.get(id))).map(([, c]) => c));
    return [...cells].sort((a, b) => a - b).map(cell => ({ id: `${LandModel.unmade.id}${cell}`,
      name: LandModel.unmade.name, cell, kind: 'unknown', visited: false, here: false, state: 'unknown' as const }));
  }
  static readonly areas = ['settlement', 'wilderness'];
  static readonly unmade = { id: 'unmade:', name: 'something not yet made out' };
  // How much the company knows of each town on the land: been to; seen, from afar or with the country about it known;
  // else only heard of, a name where it is said to stand (as of every other place: see marks).
  private towns(areas: RegionChart['areas'], known: Set<number>): Record<string, Knowing> {
    return Object.fromEntries(areas.filter(a => a.kind === 'settlement').map(a => {
      const c = this.chart.places[a.id] ?? a.y * this.chart.width + a.x;
      return [a.id, a.visited ? 'visited' : known.has(c) ? 'seen' : 'heard'];
    }));
  }
  // The six cells about a cell, the land set out in hexes, every other row half a cell to the east (as RegionTracts).
  private round(cell: number): number[] {
    const { width: W, height: H } = this.chart, x = cell % W, y = Math.floor(cell / W);
    const steps = y % 2 ? [[1, 0], [-1, 0], [0, -1], [1, -1], [0, 1], [1, 1]]
      : [[1, 0], [-1, 0], [-1, -1], [0, -1], [-1, 1], [0, 1]];
    return steps.map(([dx, dy]) => [x + dx!, y + dy!]).filter(([a, b]) => a! >= 0 && b! >= 0 && a! < W && b! < H)
      .map(([a, b]) => b! * W + a!);
  }
  // A site: a work, or one of the country's ruins, towers and caves, known by its look until its name is learned
  // (a room of its wild country seen as a square doorway in a hillside until it is named: see RegionSites).
  private static site(e?: Entity): boolean {
    return !!e?.space && !LandModel.areas.includes(e.space.kind) && (e.space.kind === 'site' || !!e.alias);
  }
  // A site; a landmark of wild country (a room of a stretch of it that has parts on the land); or a march-stone.
  private kind(e: Entity): string {
    if (LandModel.site(e)) { return 'site'; }
    if (e.space?.kind !== 'room') { return e.space?.kind ?? 'room'; }
    const parent = e.space.parent;
    return Object.keys(this.chart.parts).some(room => this.entities.get(room)?.space?.parent === parent) ? 'landmark' : 'stone';
  }
  // The wild country on the chart, with the cells of it the company knows, to write its name across.
  // A river as the map draws it: from where it rises to the water it runs into (see Drainage.spring).
  private static drawn(chart: LandChart, river: number[], i: number): number[] {
    const fall = chart.falls?.[i] ?? -1;
    return [...chart.springs?.[i] ?? [], ...river, ...fall >= 0 ? [fall] : []];
  }
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
