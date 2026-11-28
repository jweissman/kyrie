import { AuthoredLand } from '../world/authored-land';
import { Spatial } from '../lang/spatial';
import { EntityIndex } from '../lang/entity-index';
import { WaysInto } from './ways-into';
import { WorldMemo } from '../lang/world-memo';
import { KeptParts } from './kept-parts';
import { ActionTime } from '../campaign/action-time';
import { ObservationText } from '../lang/observation-text';
import type { Entity, LandChart } from '../lang/module';
import type { World } from '../lang/world';
import { PassageModel, type WayInfo } from './passage-model';
import { KnownCountry } from './known-country';
import { LandModel, type Surveys } from './land-model';
import type { Chart, RegionChart } from './screen-types';
import { ChartHere, type Standing } from './chart-here';

// Maps from canonical geography at two scales. Local: the rooms of the settlement, wilderness or site the company is
// in, with stubs for ways that lead elsewhere. Region: those areas and the known routes between them, with travel
// times. Only what the company has seen, or knows from a map (wayfinding), is drawn.
export class ChartModel {
  static readonly areaKinds = ['settlement', 'wilderness', 'site'];
  static readonly regional = ['way_road', 'way_path', 'way_track', 'way_causeway', 'way_bridge', 'way_ford', 'way_ferry'];
  constructor(private world: World, private actor: string, private entities: Map<string, Entity>) {}
  // What the company knows of the country, through the knowledge door (OR-741): never read of the world here.
  private get country(): KnownCountry { return KnownCountry.of(this.world, this.actor); }
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
  // stands: where the asker has read them, the country the company stands in, whose open country it may go across (see
  // across), and whether it is in the dark there, as the ways tell what bars them (see PassageModel).
  // Read here where the asker has not, before the ways are read, so that the chart's and every other asker's are one.
  ways(visited: Set<string>, roam = false,
    stands: { home?: string; dark?: boolean } = { home: this.home(), dark: PassageModel.dark(this.world, this.actor) }):
    WayInfo[] {
    const { home, dark } = stands;
    // Read once for a state of the world, whoever asks: the routes (Itineraries.graph) and the plan (build) had each
    // read them for every page (Mission 21's validation profile).
    // What they read is noted wherever they are asked again (see WorldMemo).
    // Read in the order of the key, whoever asks first: read in the asker's order, the chart drew the ways and the
    // stubs beyond them in the order of whoever had asked first in that world (OR-862).
    const sorted = [...visited].sort(), key = `${this.actor}|${roam}|${home ?? ''}|${dark ?? ''}|${sorted.join(',')}`;
    return ChartModel.read.of(this.world, key, () => this.read(new Set(sorted), { roam, home, dark }));
  }
  private home(): string | undefined { return this.regionOf(this.world.one('at', this.actor)); }
  private static readonly read = new WorldMemo<WayInfo[]>();
  private read(visited: Set<string>, at: { roam: boolean; home?: string; dark?: boolean }): WayInfo[] {
    const model = new PassageModel(this.world, this.actor, this.entities, at.dark);
    const seen = [...[...visited].flatMap(from => model.ways(from)), ...this.toldWays(model, visited),
      ...this.kind(model, ChartModel.roads), ...this.across(model, visited, at)];
    if (!this.country.wayfinding) { return seen; }
    return [...seen, ...this.kind(model, ChartModel.regional)];
  }
  // The ways told: a track hidden until its way is known, once someone has told it; the ways a fact tells, landmark
  // by landmark (leadsVia); and the ways into a place the company has been told of, from where its own track starts,
  // and into the wild country it is said to lie in, as far as its edge. Before, a starting town told of seventeen
  // things, and only the two march-stones could be set out for (M16).
  // Not from under the ground where the company has not been: a crawl from a cave beside a town into a barrow told of
  // is no way the company knows of, and the journey had gone by it (AR-21's one way-finder, test/small/one-way-finder).
  private toldWays(model: PassageModel, visited: Set<string>): WayInfo[] {
    const w = this.world;
    const passages = new Set([...this.directions(),
      ...this.country.told.flatMap(place => Spatial
        .ancestry(this.entities, place).filter(e => e.id === place || e.space?.kind === 'wilderness')
        .flatMap(e => this.into(e.id)))]);
    return w.related('connects').filter(c => passages.has(c.args[0]!)
      && (visited.has(c.args[1]!) || this.entities.get(c.args[1]!)?.space?.shelter !== 'underground'))
      .flatMap(c => model.ways(c.args[1]!).filter(x => x.passage === c.args[0] && x.to === c.args[2]));
  }
  // Across the open country the company knows (see LandModel.explored): the ways between any two stretches of it it
  // has seen, walked or not, so that a place seen from high ground can be set out toward over the land between.
  private across(model: PassageModel, visited: Set<string>, at: { roam: boolean; home?: string }): WayInfo[] {
    const { roam, home } = at, chart = home ? AuthoredLand.of(this.world.module, home) : undefined;
    const prefix = chart && Object.keys(chart.places).find(id => LandModel.tract.test(id))?.replace(/\d+$/, '');
    if (!chart || !prefix) { return []; }
    const known = roam ? Object.values(chart.places)
      : new LandModel(chart, this.entities).explored(visited, this.surveys());
    const tracts = new Set([...known].map(c => `${prefix}${c}`));
    // Planning toward a place, from each stretch into whatever stands on it too (a town, a site, a march-stone, onto
    // the road across it): a journey across the country had no way off it into the place it set out for, and went by
    // the roads round (the owner, 16 November: OR-35).
    return [...[...tracts].filter(t => !visited.has(t) && this.entities.has(t))
      .flatMap(t => model.ways(t).filter(w => tracts.has(w.to) || (roam && this.overland(w)))),
    ...roam ? this.out(model, tracts) : []];
  }
  // The land of the country the company stands in, and the cells of it it knows (see LandModel.known): what a journey
  // across it plans over as known, and the rest as it is reckoned (see Overland).
  land(visited: Set<string>): { chart: LandChart; known: Set<number> } | undefined {
    const home = this.regionOf(this.world.one('at', this.actor));
    const chart = home ? AuthoredLand.of(this.world.module, home) : undefined;
    return chart && { chart, known: new LandModel(chart, this.entities)
      .known({ visited, sighted: this.sighted(), surveys: this.surveys() }) };
  }
  // From wherever stands on the open country (a town's green, a site, a road), the way out into the stretch it stands
  // in, walked or not: the road into a town, or a shop in it, is joined to the country about it by the town (from the
  // road in, every hex had said "You know no way on": the navigation review).
  private out(model: PassageModel, tracts: Set<string>): WayInfo[] {
    const w = this.world, overland = new Set(w.related('passageKind').filter(r => r.args[1] === 'way_overland')
      .map(r => r.args[0]!));
    const out = w.related('connects').filter(c => overland.has(c.args[0]!) && tracts.has(c.args[2]!) && !tracts.has(c.args[1]!));
    const passages = new Set(out.map(c => c.args[0]!));
    return [...new Set(out.map(c => c.args[1]!))].flatMap(from => model.ways(from)
      .filter(x => passages.has(x.passage) && tracts.has(x.to)));
  }
  // The ways into a place from outside it.
  private into(place: string): readonly string[] {
    return WaysInto.of(this.world.related('connects'), EntityIndex.of(this.world.module.entities).byId, place);
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
    const m = ActionTime.passage(this.world, passage);
    return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`;
  }
  // The page's chart, kept from one world to the next while nothing it read has been written and the company has been
  // where it had been, standing on the same plan (the same level or area, above or below ground, in the same country:
  // see KeptParts); where on it the company stands is marked on the plan kept (ChartHere). A step within a town had
  // drawn the whole chart again (OR-1601).
  static kept(world: World, actor: string, entities: Map<string, Entity>, at: { visited: Set<string>; here: string }) {
    const model = new ChartModel(world, actor, entities), stands = model.standing(at.here);
    if (entities !== ObservationText.presented(world)) { return model.marked(model.plan(at.visited, stands), stands); }
    const from = [stands.home?.id, stands.below, stands.region, stands.across, stands.dark, ...at.visited]
      .join('\u0000');
    const plan = KeptParts.of(world, `chart:${actor}`, from,
      () => new ChartModel(world, actor, ObservationText.presented(world)).plan(at.visited, stands));
    return ChartHere.same(world.module, actor, model.marked(plan, stands));
  }
  build(visited: Set<string>, here: string): { chart?: Chart; region?: RegionChart } {
    const stands = this.standing(here);
    return this.marked(this.plan(visited, stands), stands);
  }
  // Where the company stands, as the chart is drawn from it: the plan it is on, whether it is below ground there, the
  // country it is in (aboard a vessel, where she is), and the country whose open country it may go across.
  private standing(here: string): Standing {
    const home = this.floor(here), place = this.afloat(here), area = this.regionalArea(place)?.id;
    return { here, home, below: this.under(here) && home?.space?.kind !== 'level', place, area,
      region: this.regionOf(area), across: this.home(), dark: PassageModel.dark(this.world, this.actor) };
  }
  // A plan with where the company stands on it (see ChartHere).
  private marked(plan: { chart?: Chart; region?: RegionChart }, stands: Standing) {
    const chart = stands.region ? AuthoredLand.of(this.world.module, stands.region) : undefined;
    return ChartHere.marked(plan, stands, chart && new LandModel(chart, this.entities));
  }
  // The chart as it is drawn from where the company stands, with nowhere on it marked as where it is (see marked).
  private plan(visited: Set<string>, stands: Standing): { chart?: Chart; region?: RegionChart } {
    if (!this.world.module.relations.some(r => r.name === 'connects')) { return {}; }
    const ways = this.ways(visited, false, { home: stands.across, dark: stands.dark }), home = stands.home;
    const known = new Set([...visited, ...ways.map(w => w.to), ...ways.map(w => w.from)]);
    // Below ground in no level of a site (a cellar, a crypt under a town), the plan is of what is below: the ways up
    // are ways out of it (the owner's checklist, interior orientation and a route to safety).
    const below = stands.below;
    const local = [...known].map(id => this.entities.get(id)!)
      .filter(e => e?.space?.grid && this.floor(e.id)?.id === home?.id && (!below || this.under(e.id)));
    const places: Chart['places'] = local.map(e => ({ id: e.id, name: e.name, x: e.space!.grid![0], y: e.space!.grid![1],
      visited: visited.has(e.id), here: false, area: this.entities.get(e.space!.parent ?? '')?.name ?? '' }));
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
        const up = below && !this.under(outside), [dx, dy] = up ? [0, -1] : this.direction(home, there);
        let step = 1;
        while (places.some(p => p.x === inside.x + dx * step && p.y === inside.y + dy * step)) { step++; }
        // A way out to a settlement is named for it; one out into open country or into a site, for the place it
        // reaches (the crypt, the bailey), since a site has more than one door.
        const open = !there || ['wilderness', 'region', 'site', 'level'].includes(there.space?.kind ?? '');
        const name = (open || up ? this.entities.get(outside)?.name : there.name) ?? outside;
        const rise = up ? 'up' as const : this.rise(home, there);
        places.push({ id, name, x: inside.x + dx * step,
          y: inside.y + dy * step, visited: false, here: false, area: '', external: true, ...rise ? { rise } : {} });
      }
      edges.push({ ...this.edge(w, visited), from: inside.id, to: id });
    }
    const level = home?.space?.kind === 'level' ? { level: home.name, levels: this.levels(home, visited) } : {};
    return { ...(places.length ? { chart: { places, edges, ...level } } : {}), ...this.region(ways, visited, stands) };
  }
  private under(id: string): boolean { return this.entities.get(id)?.space?.shelter === 'underground'; }
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
  private mark(areas: Map<string, RegionChart['areas'][number]>, id: string, visited: Set<string>) {
    const a = this.regionalArea(id);
    if (!a?.space?.grid) { return undefined; }
    const row = areas.get(a.id) ?? { id: a.id, name: a.name, kind: a.space.kind, x: a.space.grid[0],
      y: a.space.grid[1], visited: false, here: false, ...this.form(a.id, 'landform') };
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
    const c = this.country;
    return { surveyed: c.looked('surveyed'), well: c.looked('surveyedWell'), dim: c.looked('surveyedDim') };
  }
  private told(passage: string): boolean { return this.country.toldOf(passage); }
  private trail(edges: Map<string, RegionChart['edges'][number]>, w: WayInfo, land: LandModel) {
    const key = [w.from, w.to].sort().join('|'), course = land.course(w.from, w.to);
    if (course && !edges.has(key)) {
      edges.set(key, { from: w.from, to: w.to, label: `${w.name} · ${this.duration(w.passage)}`, status: w.status,
        ...course });
    }
  }
  // Aboard a vessel (decks: a ship's decks, a place that is also a thing somewhere), where the company is on the map is
  // where she is: alongside, at the quay on the country's land; under way, at her station on the sea's chart. Her own
  // plan is still the local one (the Dorothea's voyage had been on no map at all: doc/imbar/19-sea-region.md).
  private afloat(place: string): string {
    const w = this.world;
    for (const r of w.relates('decks') ? w.related('decks') : []) {
      const at = w.one('at', r.args[0]!);
      if (at && this.inside(place, r.args[1]!)) { return at; }
    }
    return place;
  }
  private region(ways: WayInfo[], visited: Set<string>, stands: Standing): { region?: RegionChart } {
    const areas = new Map<string, RegionChart['areas'][number]>(), edges = new Map<string, RegionChart['edges'][number]>();
    const home = stands.region;
    const chart = home ? AuthoredLand.of(this.world.module, home) : undefined;
    const land = chart ? new LandModel(chart, this.entities, this.joined()) : undefined;
    for (const v of [...visited].filter(v => this.regionOf(v) === home)) { this.mark(areas, v, visited); }
    // What the company has been told of (a site named to it, leadsTo) is on its map too, before it has been there.
    const told = this.leads().filter(p => this.regionOf(p) === home), routes = this.routes();
    for (const t of told) { this.mark(areas, t, visited); }
    const drawn = this.drawn(ways, visited, routes);
    for (const w of drawn.filter(x => this.charted(x, home))) {
      const a = this.mark(areas, w.from, visited), b = this.mark(areas, w.to, visited);
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
    // Each area where it stands on the land, where the land is drawn (an authored region's grid is not its land's); one
    // with no cell of its own, where what it lies in stands: a province's towns at its way in (Cobble Ring and Lowmere
    // had been drawn by their own grid, in the far corner of the country: the navigation review).
    for (const a of areas.values()) {
      const cell = chart?.places[a.id] ?? land?.cell(a.id);
      if (chart && cell !== undefined) { a.x = cell % chart.width; a.y = Math.floor(cell / chart.width); }
    }
    const terrain = home ? this.form(home, 'terrain').form : undefined;
    return areas.size > 1 || (chart && areas.size) ? { region: { areas: [...areas.values()], edges: [...edges.values()],
      within: Object.fromEntries(this.within), ...terrain ? { terrain } : {},
      ...land ? { land: this.glossed(land.land({ visited, told, sighted: this.sighted(), routes,
        surveys: this.surveys() }, drawn, [...areas.values()])) } : {} } } : {};
  }
  // The ways the map draws, of those the company knows (see ways): each it has stood at either end of, and each whose
  // course it was told or knows as from a map (see routes). The country's roads, which a journey may follow, are not
  // therefore drawn whole, nor the towns at their ends named, until the company comes to them or learns of them (the
  // owner's playtest, 25 November: "things were unfolding that were nowhere near where I was, and I hadn't explored
  // yet"; OR-741). Where the company has been everywhere, or knows the country as from a map, every way is drawn.
  private drawn(ways: WayInfo[], visited: Set<string>, routes: readonly string[]): WayInfo[] {
    const told = new Set(routes);
    return ways.filter(w => visited.has(w.from) || visited.has(w.to) || told.has(w.passage));
  }
  // The places each is joined to by a way, for where a place with no cell of its own stands (see LandModel.stands).
  private joined(): Map<string, string[]> {
    const out = new Map<string, string[]>();
    for (const c of this.world.related('connects')) { out.set(c.args[1]!, [...out.get(c.args[1]!) ?? [], c.args[2]!]); }
    return out;
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
  // The places it has seen with its own eyes, from afar: from high ground, or looking out over the open country (a
  // sign perceived teaches its fact as witnessed), not only been told of (see LandModel.land).
  private sighted(): string[] { return [...this.country.sighted]; }
  // The ways whose course the company knows, not only that they are there: a track's secret told it, the directions a
  // fact gives landmark by landmark, and with wayfinding every road and path of the country, as from a map. Not the
  // ways into a place merely heard of, which a journey toward it may take (see toldWays), nor the country's roads,
  // which its folk would direct anyone along (see LandModel.land).
  private routes(): string[] {
    const w = this.world, told = this.directions();
    if (!this.country.wayfinding) { return told; }
    return [...told, ...w.related('passageKind').filter(r => ChartModel.regional.includes(r.args[1]!))
      .map(r => r.args[0]!)];
  }
  // The ways told: a track hidden until its way is known, once someone has told it; and the ways a fact tells,
  // landmark by landmark (leadsVia).
  private directions(): string[] { return [...this.country.directions]; }
  // The places facts the company knows lead to; and the places its aims name, a site by its outside (an aim to bring
  // the crown out from under Lapistumul had left the barrow on the map as "a barrow, not yet made out": Mission 19).
  private leads(): string[] { return [...this.country.told, ...this.aimed()]; }
  private aimed(): string[] {
    const w = this.world, named = this.country.aimed();
    const sites = new Set([...named].flatMap(id => this.siteOf(id) ?? []));
    // No site named, no way out of one to find: every way of the world had been gone through for none (OR-860).
    const outsides = !sites.size ? [] : w.related('connects').flatMap(r => [[r.args[1]!, r.args[2]!], [r.args[2]!, r.args[1]!]] as const)
      .flatMap(([a, b]) => sites.has(this.siteOf(a) ?? '') && !this.siteOf(b) ? [b] : []);
    // The site an aim names is on the map, heard of (never its rooms: the way in is for the company to find): "Bring
    // the crown out of Nocsrecs" had named a barrow the map did not show (the owner's evidence sessions, 7 November).
    return [...new Set([...[...named].filter(id => this.entities.get(id)?.space && !this.siteOf(id)), ...sites,
      ...outsides])];
  }
  // The site a place is in, worked out once a chart for each place (a way's two ends, every way of the world).
  private siteOf(id: string): string | undefined {
    if (!this.sites.has(id)) { this.sites.set(id, Spatial.ancestry(this.entities, id).find(e => e.space?.kind === 'site')?.id); }
    return this.sites.get(id);
  }
  private readonly sites = new Map<string, string | undefined>();
}
