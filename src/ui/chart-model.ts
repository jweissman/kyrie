import { Spatial } from '../spatial';
import { ModuleWriter } from '../lang/module-writer';
import type { Entity } from '../lang/module';
import type { World } from '../lang/world';
import { PassageModel, type WayInfo } from './passage-model';
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
  private ways(visited: Set<string>): WayInfo[] {
    const model = new PassageModel(this.world, this.actor, this.entities);
    const seen = [...visited].flatMap(from => model.ways(from));
    if (!this.world.test(ModuleWriter.call('capable', this.actor, 'wayfinding'))) { return seen; }
    const relations = this.world.snapshot.relations;
    const mapped = relations.filter(r => r.name === 'passageKind' && ChartModel.regional.includes(r.args[1]!))
      .flatMap(r => relations.filter(c => c.name === 'connects' && c.args[0] === r.args[0]))
      .filter(c => model.visible(c.args[0]!))
      .flatMap(c => model.ways(c.args[1]!).filter(w => w.passage === c.args[0] && w.to === c.args[2]));
    return [...seen, ...mapped];
  }
  duration(passage: string): string {
    const ticks = Math.max(1, this.world.number(ModuleWriter.call('travelTime', passage)));
    return ticks >= 6 ? `${Math.floor(ticks / 6)}h${ticks % 6 ? ` ${(ticks % 6) * 10}m` : ''}` : `${ticks * 10}m`;
  }
  build(visited: Set<string>, here: string): { chart?: Chart; region?: RegionChart } {
    if (!this.world.module.relations.some(r => r.name === 'connects')) { return {}; }
    const ways = this.ways(visited), home = this.area(here);
    const known = new Set([...visited, ...ways.map(w => w.to), ...ways.map(w => w.from)]);
    const local = [...known].map(id => this.entities.get(id)!)
      .filter(e => e?.space?.grid && this.area(e.id)?.id === home?.id);
    const places: Chart['places'] = local.map(e => ({ id: e.id, name: e.name, x: e.space!.grid![0], y: e.space!.grid![1],
      visited: visited.has(e.id), here: e.id === here, area: this.entities.get(e.space!.parent ?? '')?.name ?? '' }));
    const edges: Chart['edges'] = [], seen = new Set<string>();
    for (const w of ways) {
      const key = [w.passage, ...[w.from, w.to].sort()].join('|');
      const a = places.find(p => p.id === w.from), b = places.find(p => p.id === w.to);
      if (seen.has(key) || (!a && !b)) { continue; }
      seen.add(key);
      if (a && b) { edges.push(this.edge(w, visited)); continue; }
      const inside = (a ?? b)!, outside = a ? w.to : w.from, there = this.area(outside);
      const id = `beyond:${outside}`;
      if (!places.some(p => p.id === id)) {
        const [dx, dy] = this.direction(home, there);
        let step = 1;
        while (places.some(p => p.x === inside.x + dx * step && p.y === inside.y + dy * step)) { step++; }
        places.push({ id, name: there?.name ?? this.entities.get(outside)?.name ?? outside, x: inside.x + dx * step,
          y: inside.y + dy * step, visited: false, here: false, area: '', external: true });
      }
      edges.push({ ...this.edge(w, visited), from: inside.id, to: id });
    }
    return { ...(places.length ? { chart: { places, edges } } : {}), ...this.region(ways, visited, home?.id) };
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
    const a = this.area(id);
    if (!a?.space?.grid) { return undefined; }
    const row = areas.get(a.id)
      ?? { id: a.id, name: a.name, x: a.space.grid[0], y: a.space.grid[1], visited: false, here: a.id === here };
    row.visited ||= visited.has(id);
    areas.set(a.id, row);
    return a.id;
  }
  private region(ways: WayInfo[], visited: Set<string>, here?: string): { region?: RegionChart } {
    const areas = new Map<string, RegionChart['areas'][number]>(), edges = new Map<string, RegionChart['edges'][number]>();
    for (const v of visited) { this.mark(areas, v, visited, here); }
    for (const w of ways) {
      const a = this.mark(areas, w.from, visited, here), b = this.mark(areas, w.to, visited, here);
      if (!a || !b || a === b) { continue; }
      const key = [a, b].sort().join('|');
      if (!edges.has(key)) { edges.set(key, { from: a, to: b, label: `${w.name} · ${this.duration(w.passage)}`, status: w.status }); }
    }
    return areas.size > 1 ? { region: { areas: [...areas.values()], edges: [...edges.values()] } } : {};
  }
}
