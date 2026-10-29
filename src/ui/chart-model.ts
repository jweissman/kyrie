import { AuthoredLand } from '../world/authored-land';
import { Spatial } from '../spatial';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import type { Entity } from '../lang/module';
import type { World } from '../lang/world';
import { PassageModel, type WayInfo } from './passage-model';
import { LandModel, type Surveys } from './land-model';
import type { Chart, RegionChart } from './screen-types';

// Maps from canonical geography at two scales. Local: the rooms of the settlement, wilderness or site the company is
// in, with stubs for ways that lead elsewhere. Region: those areas and the known routes between them, with travel
// times. Only what the company has seen, or knows from a map (wayfinding), is drawn.
export class ChartModel {
  static readonly areaKinds = ['settlement', 'wilderness', 'site'];
  static readonly regional = ['way_road', 'way_path', 'way_track', 'way_causeway', 'way_bridge', 'way_ford', 'way_ferry'];
  constructor(private world: World, private actor: string, private entities: Map<string, Entity>) {}
  area(id: string): Entity | undefined {
    return Spatial.ancestry(this.entities, id).find(e => ChartModel.areaKinds.includes(e.space!.kind));
  }
  // What the local chart draws: the level of a site the company is on (each level has its own grid), else its area.
  private floor(id: string): Entity | undefined {
    const line = Spatial.ancestry(this.entities, id), area = this.area(id);
    const level = line.find(e => e.space!.kind === 'level');
    return level && (!area || line.indexOf(level) < line.indexOf(area)) ? level : area;
  }
  // On the region chart a site in open country is part of that country, not an area of its own.
  private regionalArea(id: string): Entity | undefined {
    return Spatial.ancestry(this.entities, id).findLast(e => ChartModel.areaKinds.includes(e.space!.kind));
  }
  // The roads of a country, which its folk know and anyone in it can follow: roads, and the bridges, fords, ferries
  // and causeways they cross by. A track or a path into wild country is known only once walked, or told of.
  static readonly roads = ['way_road', 'way_causeway', 'way_bridge', 'way_ford', 'way_ferry'];
  // The ways the company has walked from, the ways it has been told of, the country's roads, and with wayfinding every
  // road and path of the country.
  // roam: for planning a journey toward a place seen, the whole open country, walked or not (the map's land is never
  // made known by it: see LandModel).
  ways(visited: Set<string>, roam = false): WayInfo[] {
    const model = new PassageModel(this.world, this.actor, this.entities);
    const seen = [...[...visited].flatMap(from => model.ways(from)), ...this.toldWays(model),
      ...this.kind(model, ChartModel.roads), ...this.across(model, visited, roam)];
    if (!this.world.test(ModuleWriter.call('capable', this.actor, 'wayfinding'))) { return seen; }
    return [...seen, ...this.kind(model, ChartModel.regional)];
  }
  // The ways told: a track hidden until its way is known, once someone has told it; the ways a fact tells, landmark
  // by landmark (leadsVia); and the ways into a place the company has been told of, from where its own track starts,
  // and into the wild country it is said to lie in, as far as its edge. Before, a starting town told of seventeen
  // things, and only the two march-stones could be set out for (M16).
  private toldWays(model: PassageModel): WayInfo[] {
    const w = this.world;
    const passages = new Set([
      ...w.related('revealedBy').filter(r => this.knows(r.args[1]!)).map(r => r.args[0]!),
      ...w.related('leadsVia').filter(r => this.knows(r.args[0]!)).map(r => r.args[1]!),
      ...w.related('leadsTo').filter(r => this.knows(r.args[0]!)).flatMap(r => Spatial
        .ancestry(this.entities, r.args[1]!).filter(e => e.id === r.args[1] || e.space?.kind === 'wilderness')
        .flatMap(e => this.into(e.id)))]);
    return w.related('connects').filter(c => passages.has(c.args[0]!))
      .flatMap(c => model.ways(c.args[1]!).filter(x => x.passage === c.args[0] && x.to === c.args[2]));
  }
  // Across the open country the company knows (see LandModel.explored): the ways between any two stretches of it it
  // has seen, walked or not, so that a place seen from high ground can be set out toward over the land between.
  private across(model: PassageModel, visited: Set<string>, roam: boolean): WayInfo[] {
    const here = this.world.one('at', this.actor), home = this.regionOf(here);
    const chart = home ? AuthoredLand.of(this.world.module, home) : undefined;
    const prefix = chart && Object.keys(chart.places).find(id => LandModel.tract.test(id))?.replace(/\d+$/, '');
    if (!chart || !prefix) { return []; }
    const known = roam ? Object.values(chart.places)
      : new LandModel(chart, this.entities).explored(visited, this.surveys());
    const tracts = new Set([...known].map(c => `${prefix}${c}`));
    return [...tracts].filter(t => !visited.has(t) && this.entities.has(t))
      .flatMap(t => model.ways(t).filter(w => tracts.has(w.to)));
  }
  private knows(fact: string): boolean { return this.world.test(ModuleWriter.call('knows', this.actor, fact)); }
  // The ways into a place from outside it.
  private into(place: string): string[] {
    return this.world.related('connects').filter(c => this.inside(c.args[2]!, place) && !this.inside(c.args[1]!, place))
      .map(c => c.args[0]!);
  }
  private inside(id: string, place: string): boolean {
    return id === place || Spatial.ancestry(this.entities, id).some(e => e.id === place);
  }
  private kind(model: PassageModel, kinds: string[]): WayInfo[] {
    const w = this.world;
    return w.related('passageKind').filter(r => kinds.includes(r.args[1]!))
      .flatMap(r => w.related('connects', r.args[0]!))
      .flatMap(c => model.ways(c.args[1]!).filter(x => x.passage === c.args[0] && x.to === c.args[2]));
  }
  duration(passage: string): string {
    const ticks = Math.max(1, this.world.number(ModuleWriter.call('travelTime', passage)));
    return ticks >= 6 ? `${Math.floor(ticks / 6)}h${ticks % 6 ? ` ${(ticks % 6) * 10}m` : ''}` : `${ticks * 10}m`;
  }
  build(visited: Set<string>, here: string): { chart?: Chart; region?: RegionChart } {
    if (!this.world.module.relations.some(r => r.name === 'connects')) { return {}; }
    const ways = this.ways(visited), home = this.floor(here);
    const known = new Set([...visited, ...ways.map(w => w.to), ...ways.map(w => w.from)]);
    const local = [...known].map(id => this.entities.get(id)!)
      .filter(e => e?.space?.grid && this.floor(e.id)?.id === home?.id);
    const places: Chart['places'] = local.map(e => ({ id: e.id, name: e.name, x: e.space!.grid![0], y: e.space!.grid![1],
      visited: visited.has(e.id), here: e.id === here, area: this.entities.get(e.space!.parent ?? '')?.name ?? '' }));
    const edges: Chart['edges'] = [], seen = new Set<string>();
    for (const w of ways) {
      const key = [w.passage, ...[w.from, w.to].sort()].join('|');
      const a = places.find(p => p.id === w.from), b = places.find(p => p.id === w.to);
      if (seen.has(key) || (!a && !b)) { continue; }
      seen.add(key);
      if (a && b) { edges.push(this.edge(w, visited)); continue; }
      const inside = (a ?? b)!, outside = a ? w.to : w.from, there = this.floor(outside);
      const id = `beyond:${outside}`;
      if (!places.some(p => p.id === id)) {
        const [dx, dy] = this.direction(home, there);
        let step = 1;
        while (places.some(p => p.x === inside.x + dx * step && p.y === inside.y + dy * step)) { step++; }
        // A way out to a settlement is named for it; one out into open country or into a site, for the place it
        // reaches (the crypt, the bailey), since a site has more than one door.
        const open = !there || ['wilderness', 'region', 'site', 'level'].includes(there.space?.kind ?? '');
        const name = (open ? this.entities.get(outside)?.name : there.name) ?? outside, rise = this.rise(home, there);
        places.push({ id, name, x: inside.x + dx * step,
          y: inside.y + dy * step, visited: false, here: false, area: '', external: true, ...rise ? { rise } : {} });
      }
      edges.push({ ...this.edge(w, visited), from: inside.id, to: id });
    }
    const level = home?.space?.kind === 'level' ? { level: home.name, levels: this.levels(home, visited) } : {};
    return { ...(places.length ? { chart: { places, edges, ...level } } : {}), ...this.region(ways, visited, here) };
  }
  // A site's levels, top to bottom, as the company knows them: each it has stood on.
  private levels(home: Entity, visited: Set<string>): NonNullable<Chart['levels']> {
    const on = new Set([...visited].map(id => this.floor(id)?.id));
    return this.stack(home).filter(l => on.has(l.id) || l.id === home.id)
      .map(l => ({ name: l.name, here: l.id === home.id }));
  }
  private stack(level: Entity): Entity[] {
    return [...this.entities.values()].filter(e => e.space?.kind === 'level' && e.space.parent === level.space?.parent);
  }
  // Whether a way out of one level of a site goes up or down: to a level above it in the site, or below.
  private rise(home: Entity | undefined, there: Entity | undefined): 'up' | 'down' | undefined {
    if (home?.space?.kind !== 'level' || there?.space?.kind !== 'level' || there.space.parent !== home.space.parent) {
      return undefined;
    }
    const stack = this.stack(home);
    return stack.indexOf(there) > stack.indexOf(home) ? 'down' : 'up';
  }
  private edge(w: WayInfo, visited: Set<string>) {
    return { id: w.passage, name: w.name, from: w.from, to: w.to, status: w.status, oneWay: w.oneWay,
      explored: visited.has(w.from) && visited.has(w.to) };
  }
  private direction(from?: Entity, to?: Entity): [number, number] {
    const a = from?.space?.grid ?? [0, 0], b = to?.space?.grid ?? [a[0] + 1, a[1]];
    const dx = Math.sign(b[0] - a[0]), dy = Math.sign(b[1] - a[1]);
    return dx || dy ? [dx, dy] : [1, 0];
  }
  // Records the area containing a place on the region chart; returns the area's id when it can be drawn.
  private mark(areas: Map<string, RegionChart['areas'][number]>, id: string, visited: Set<string>, here?: string) {
    const a = this.regionalArea(id);
    if (!a?.space?.grid) { return undefined; }
    const row = areas.get(a.id) ?? { id: a.id, name: a.name, kind: a.space.kind, x: a.space.grid[0],
      y: a.space.grid[1], visited: false, here: a.id === here, ...this.form(a.id, 'landform') };
    row.visited ||= visited.has(id);
    areas.set(a.id, row);
    this.within.set(id, a.id);
    return a.id;
  }
  private readonly within = new Map<string, string>();
  // What land an area is (landform: land_river…), or a region's terrain, when the world says.
  private form(id: string, relation: 'landform' | 'terrain'): { form?: string } {
    const f = this.world.one(relation, id);
    return f ? { form: f.replace(/^.*__/, '').replace(/^land_/, '') } : {};
  }
  // The region a place lies in (or the plane, for a place in one with no region): one region is drawn at a time.
  // The country a place lies in, for its map: the outermost region over it (a province's places, an adventure's
  // valley installed within a country, are drawn on that country's land: Mission 18's Gate B).
  private regionOf(id: string | undefined): string | undefined {
    if (!id) { return undefined; }
    const line = Spatial.ancestry(this.entities, id);
    return (line.findLast(e => e.space!.kind === 'region') ?? line.find(e => e.space!.kind === 'plane'))?.id;
  }
  // A way of the country drawn on its chart: both ends in it, and not across its open country.
  private charted(w: WayInfo, home: string | undefined): boolean {
    return this.regionOf(w.from) === home && this.regionOf(w.to) === home && !this.overland(w);
  }
  // A way across the open country (see RegionTracts): the land itself, not a line on it.
  private overland(w: WayInfo): boolean { return this.world.one('passageKind', w.passage) === 'way_overland'; }
  // What the company has looked out over (see LandModel.explored).
  surveys(): Surveys {
    return { surveyed: this.looked('surveyed'), well: this.looked('surveyedWell'), dim: this.looked('surveyedDim') };
  }
  // The places the company stands in a country's relation to (a country's own, named for its module: region__surveyed).
  private looked(end: string): string[] {
    const name = this.world.module.relations.find(r => r.name.endsWith(`__${end}`))?.name;
    return name ? this.world.related(name, this.actor).map(r => r.args[1]!) : [];
  }
  private told(passage: string): boolean {
    return this.world.related('revealedBy').some(r => r.args[0] === passage
      && this.world.test(ModuleWriter.call('knows', this.actor, r.args[1]!)));
  }
  private trail(edges: Map<string, RegionChart['edges'][number]>, w: WayInfo, land: LandModel) {
    const key = [w.from, w.to].sort().join('|'), course = land.course(w.from, w.to);
    if (course && !edges.has(key)) {
      edges.set(key, { from: w.from, to: w.to, label: `${w.name} · ${this.duration(w.passage)}`, status: w.status,
        ...course });
    }
  }
  private region(ways: WayInfo[], visited: Set<string>, place: string): { region?: RegionChart } {
    const areas = new Map<string, RegionChart['areas'][number]>(), edges = new Map<string, RegionChart['edges'][number]>();
    const here = this.regionalArea(place)?.id, home = this.regionOf(here);
    const chart = home ? AuthoredLand.of(this.world.module, home) : undefined;
    const land = chart ? new LandModel(chart, this.entities) : undefined;
    for (const v of [...visited].filter(v => this.regionOf(v) === home)) { this.mark(areas, v, visited, here); }
    // What the company has been told of (a site named to it, leadsTo) is on its map too, before it has been there.
    const told = this.leads().filter(p => this.regionOf(p) === home);
    for (const t of told) { this.mark(areas, t, visited, here); }
    for (const w of ways.filter(x => this.charted(x, home))) {
      const a = this.mark(areas, w.from, visited, here), b = this.mark(areas, w.to, visited, here);
      // A trail within a stretch of wild country is drawn on the land too, from landmark to landmark, once the company
      // has walked from either end of it or been told it (not merely for knowing the country's roads).
      if (a && a === b && land && (visited.has(w.from) || visited.has(w.to) || this.told(w.passage))) {
        this.trail(edges, w, land);
      }
      if (!a || !b || a === b) { continue; }
      const key = [a, b].sort().join('|');
      if (!edges.has(key)) {
        edges.set(key, { from: a, to: b, label: `${w.name} · ${this.duration(w.passage)}`, status: w.status,
          ...land?.course(w.from, w.to, w.passage), ...w.reason ? { reason: w.reason } : {} });
      }
    }
    // Each area where it stands on the land, where the land is drawn (an authored region's grid is not its land's).
    for (const a of areas.values()) {
      const cell = chart?.places[a.id];
      if (chart && cell !== undefined) { a.x = cell % chart.width; a.y = Math.floor(cell / chart.width); }
    }
    const terrain = home ? this.form(home, 'terrain').form : undefined;
    return areas.size > 1 || (chart && areas.size) ? { region: { areas: [...areas.values()], edges: [...edges.values()],
      within: Object.fromEntries(this.within), ...terrain ? { terrain } : {},
      ...land ? { land: this.glossed(land.land({ visited, told, surveys: this.surveys() }, ways, place,
        [...areas.values()])) } : {} } } : {};
  }
  // A name is glossed (Westron for "battle gate") once the company knows the place by it: a ruin seen from a tower,
  // known only by its look, is not explained by a name it has not learned.
  private glossed(land: NonNullable<RegionChart['land']>): NonNullable<RegionChart['land']> {
    return { ...land, glosses: Object.fromEntries(Object.entries(land.glosses).filter(([id]) => this.learned(id))) };
  }
  private learned(id: string): boolean {
    const e = this.world.module.entities.find(x => x.id === id);
    return !e?.alias || ObservationText.known(this.world, e) === e.name;
  }
  // The places facts the company knows lead to.
  private leads(): string[] {
    const w = this.world;
    return w.relates('leadsTo') ? w.related('leadsTo')
      .filter(r => w.test(ModuleWriter.call('knows', this.actor, r.args[0]!))).map(r => r.args[1]!) : [];
  }
}
