import type { Entity, Module } from '../../lang/module';
import type { Ledger, Provenance } from './ledger';

// A region module as the assembler sees it: its installation id, its parsed source, what it exports (only exported
// places can be bound by kits) and the facts its author fixed in its manifest (a chokepoint, a landmark, the terrain).
export interface RegionSource {
  install: string; module: Module; exports: Record<string, string>; commitments?: string[][];
}
type Edges = Map<string, { to: string; ticks: number }[]>;

// Reads a region's places and ways into the ledger: its settlements, wild country and sites, the rooms within them,
// the rooms on its roads, which rooms adjoin, and the hours between every two exported places by the quickest known
// way. The same reading serves an authored region and a generated one.
export class Geography {
  static readonly apart = 999;
  static read(ledger: Ledger, region: RegionSource): void {
    const by: Provenance = { by: `region:${region.install}` }, module = region.module;
    const ref = new Map(Object.entries(region.exports)
      .map(([name, local]) => [local, Geography.id(region.install, name)]));
    const places = module.entities.filter(e => e.space);
    const company = module.company?.id;
    if (company && ref.get(company)) { ledger.commit('company', [ref.get(company)!], by); }
    for (const place of places) { this.area(ledger, { place, places, ref }, by); }
    const edges = this.edges(module);
    this.roads(ledger, { places, ref, edges }, by);
    this.distances(ledger, { places, ref, edges }, by);
    for (const [fact, ...args] of region.commitments ?? []) {
      ledger.commit(fact!, args.map(a => region.exports[a] ? Geography.id(region.install, a) : a),
        { ...by, why: 'fixed by its author' });
    }
  }
  // An exported area is a settlement, wild country or a site; an exported room is within the area above it.
  private static area(ledger: Ledger, at: { place: Entity; places: Entity[]; ref: Map<string, string> },
    by: Provenance) {
    const { place, places, ref } = at, id = ref.get(place.id);
    if (!id) { return; }
    const kind = place.space!.kind;
    if (kind === 'region') { ledger.commit('region', [id], by); }
    if (kind === 'settlement') { ledger.commit('settlement', [id], by); }
    if (kind === 'wilderness') { ledger.commit('wilds', [id], by); }
    if (kind === 'site') { ledger.commit('site', [id, 'site'], by); }
    if (kind !== 'room') { return; }
    const area = this.owner(places, place);
    if (area && ref.get(area.id)) { ledger.commit('within', [id, ref.get(area.id)!], by); }
  }
  // The settlement, wild country or site a room belongs to, through buildings and levels.
  private static owner(places: Entity[], place: Entity): Entity | undefined {
    let parent = places.find(p => p.id === place.space?.parent);
    while (parent && !['settlement', 'wilderness', 'site'].includes(parent.space!.kind)) {
      parent = places.find(p => p.id === parent!.space?.parent);
    }
    return parent;
  }
  // A ledger id for an exported entity, and the import reference that installs a module against it.
  static id(install: string, name: string): string { return `${install}__${name}`; }
  static ref(id: string): string { return id.replace('__', '.'); }
  // Every way between places, with its time in watches. A way hidden from the company is still a way: what it knows
  // is its own affair, and the world is laid out the same either way.
  private static edges(module: Module): Edges {
    const ticks = new Map(module.initial.filter(c => c.kind === 'set' && c.call.name === 'travelTime')
      .map(c => [c.call.args[0]!, c.kind === 'set' && c.value.kind === 'number' ? c.value.value : 1]));
    const edges: Edges = new Map();
    for (const c of module.initial) {
      if (c.kind !== 'assert' || c.call.name !== 'connects') { continue; }
      const [way, from, to] = c.call.args as [string, string, string];
      edges.set(from, [...edges.get(from) ?? [], { to, ticks: ticks.get(way) ?? 1 }]);
    }
    return edges;
  }
  // Rooms directly in wild country are waypoints on the roads; a settlement's square is its most connected open room.
  private static roads(ledger: Ledger, at: { places: Entity[]; ref: Map<string, string>; edges: Edges },
    by: Provenance) {
    const { places, ref, edges } = at;
    for (const room of places.filter(p => p.space!.kind === 'room' && ref.get(p.id))) {
      const parent = places.find(p => p.id === room.space!.parent);
      if (parent?.space!.kind === 'wilderness' && edges.get(room.id)?.length) { ledger.commit('waypoint', [ref.get(room.id)!], by); }
      for (const next of edges.get(room.id) ?? []) {
        if (ref.get(next.to)) { ledger.commit('adjacent', [ref.get(room.id)!, ref.get(next.to)!], by); }
      }
    }
    for (const town of places.filter(p => p.space!.kind === 'settlement' && ref.get(p.id))) {
      const open = places.filter(p => p.space!.kind === 'room' && p.space!.parent === town.id && ref.get(p.id))
        .sort((a, b) => (edges.get(b.id)?.length ?? 0) - (edges.get(a.id)?.length ?? 0));
      if (open[0]) { ledger.commit('square', [ref.get(town.id)!, ref.get(open[0].id)!], by); }
    }
  }
  // Hours between exported places by the quickest known way (rounded up); an area is as near as its nearest room.
  private static distances(ledger: Ledger, at: { places: Entity[]; ref: Map<string, string>; edges: Edges },
    by: Provenance) {
    const { places, ref, edges } = at;
    const rooms = places.filter(p => p.space!.kind === 'room');
    const owner = new Map(rooms.map(r => [r.id, this.owner(places, r)?.id]));
    const best = new Map<string, number>();
    for (const room of rooms.filter(r => ref.get(r.id) || ref.get(owner.get(r.id) ?? ''))) {
      for (const [other, ticks] of this.reach(room.id, edges)) {
        for (const a of [room.id, owner.get(room.id)]) {
          for (const b of [other, owner.get(other)]) {
            if (!a || !b || a === b || !ref.get(a) || !ref.get(b)) { continue; }
            const key = `${ref.get(a)}|${ref.get(b)}`;
            best.set(key, Math.min(best.get(key) ?? Infinity, ticks));
          }
        }
      }
    }
    // Places with no way between them are a world apart.
    const exported = [...new Set([...rooms, ...places.filter(p => p.space!.kind !== 'room')].map(p => ref.get(p.id))
      .filter((id): id is string => !!id))];
    for (const a of exported) {
      for (const b of exported) { if (a !== b && !best.has(`${a}|${b}`)) { best.set(`${a}|${b}`, Geography.apart * 6); } }
    }
    ledger.measures([...best].map(([key, ticks]) => ({ fact: 'hours', args: key.split('|'), value: Math.ceil(ticks / 6) })),
      by);
  }
  // Watches from one room to every room reachable from it (Dijkstra over a small graph).
  private static reach(from: string, edges: Edges): Map<string, number> {
    const done = new Map<string, number>(), frontier = new Map([[from, 0]]);
    while (frontier.size) {
      const [room, ticks] = [...frontier].reduce((a, b) => (b[1] < a[1] ? b : a));
      frontier.delete(room); done.set(room, ticks);
      for (const next of edges.get(room) ?? []) {
        if (done.has(next.to)) { continue; }
        frontier.set(next.to, Math.min(frontier.get(next.to) ?? Infinity, ticks + next.ticks));
      }
    }
    return done;
  }
}
