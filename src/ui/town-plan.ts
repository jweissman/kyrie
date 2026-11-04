import { Spatial } from '../spatial';
import type { Entity } from '../lang/module';
import type { World } from '../lang/world';
import type { Plan, Screen } from './screen-types';

type Cell = Plan['cells'][number];

// The plan of the town or the building the company is in, above ground (the owner, 3 November: a town read like a
// wiki, its way list thirty-three long, and nothing said where anything lay; NVR-20, a plan of every structure;
// OWN-81, the navigation census's blocker). Each of its places is a cell on its grid: a room of the town where its
// grid sets it, a building one cell (gone into by its door), and, inside a building, its rooms and the doors out. Two
// set on one cell, and one set nowhere, are moved to the nearest free cell beside a place they lead to. Only places
// the company has been to, or has a way to from here, are drawn; the screen already knows which (its exits and its
// walks about the town), so nothing is routed here.
export class TownPlan {
  // The building each building's cell stands for.
  private stands = new Map<Cell, string>();
  private lines = new Map<string, Set<string>>();
  constructor(private entities: Map<string, Entity>, public links: [string, string][]) {}
  static of(screen: Screen, entities: Map<string, Entity>, world: World, visited: Set<string>): Pick<Screen, 'plan'> {
    const here = screen.place.id, line = Spatial.ancestry(entities, here);
    if (!here || entities.get(here)?.space?.shelter === 'underground') { return {}; }
    const within = line.slice(1).filter(e => e.space?.kind === 'building' || e.space?.kind === 'settlement');
    const known = new Set([here, ...visited, ...screen.exits.map(e => e.destination.id),
      ...(screen.around ?? []).map(d => d.id)]);
    // A building of a room or two is better shown as where it stands in the town (the guest-hall and its door out
    // had been a plan of two cells).
    for (const enclosure of within) {
      const plan = new TownPlan(entities, []);
      // Only the ways with an end in the town or the building: a drawn country has thousands.
      plan.links = world.related('connects').map(r => [r.args[1]!, r.args[2]!] as [string, string])
        .filter(([a, b]) => plan.inside(a, enclosure.id) || plan.inside(b, enclosure.id));
      const drawn = plan.draw(enclosure, here, known, visited);
      const rooms = drawn.cells.filter(c => !c.door).length;
      if (drawn.kind === 'building' && rooms < 3 && enclosure !== within.at(-1)) { continue; }
      return drawn.cells.length > 1 ? { plan: drawn } : {};
    }
    return {};
  }
  private draw(within: Entity, here: string, known: Set<string>, visited: Set<string>): Plan {
    const kids = [...this.entities.values()].filter(e => e.space?.parent === within.id && e.space.shelter !== 'underground');
    const rooms = kids.filter(e => e.type === 'place' && e.space!.kind === 'room' && known.has(e.id));
    const buildings = kids.filter(e => e.space!.kind === 'building')
      .flatMap(b => { const door = this.door(b, known); return door ? [{ b, door }] : []; });
    const cells: Cell[] = rooms.map(r => this.cell(r.id, r.name, r, { here: r.id === here, been: visited.has(r.id) }));
    for (const { b, door } of buildings) {
      const c = this.cell(door, b.name, b, { indoors: true, building: true, here: this.inside(here, b.id),
        been: [...visited].some(v => this.inside(v, b.id)) });
      cells.push(c); this.stands.set(c, b.id);
    }
    // Inside a building, its doors out, each to the place outside it leads to.
    if (within.space?.kind === 'building') {
      for (const [a, b] of this.links) {
        const [inner, outer] = this.inside(a, within.id) ? [a, b] : [b, a];
        if (!this.inside(inner, within.id) || this.inside(outer, within.id) || cells.some(c => c.id === outer)) {
          continue;
        }
        const o = this.entities.get(outer);
        if (o && o.space?.shelter !== 'underground') {
          cells.push(this.cell(outer, o.name, undefined, { door: true, been: visited.has(outer) }));
        }
      }
    }
    const lanes = this.lanes(cells, within);
    this.settle(cells, lanes);
    return { name: within.name, kind: within.space!.kind === 'building' ? 'building' : 'settlement', cells, lanes };
  }
  // A building's door is the room of it a place outside leads into, the first the company knows.
  private door(b: Entity, known: Set<string>): string | undefined {
    for (const [x, y] of this.links) {
      for (const [inner, outer] of [[x, y], [y, x]] as const) {
        if (this.inside(inner, b.id) && !this.inside(outer, b.id) && known.has(inner)) { return inner; }
      }
    }
    return undefined;
  }
  private cell(id: string, name: string, e: Entity | undefined, o: Partial<Cell>): Cell {
    // A room of a building that says nothing of its shelter is indoors.
    const grid = e?.space?.grid, shelter = e?.space?.shelter
      ?? (e && Spatial.ancestry(this.entities, e.id).slice(1).some(a => a.space?.kind === 'building') ? 'indoors' : '');
    return { id, name, x: grid?.[0] ?? NaN, y: grid?.[1] ?? NaN, indoors: shelter === 'indoors',
      here: false, been: false, ...o };
  }
  private inside(id: string, of: string): boolean {
    let line = this.lines.get(id);
    if (!line) { line = new Set(Spatial.ancestry(this.entities, id).map(e => e.id)); this.lines.set(id, line); }
    return line.has(of);
  }
  // The ways between cells, each once: a way to a room of a building is a way to the building.
  private lanes(cells: Cell[], within: Entity): Plan['lanes'] {
    const seen = new Set<string>(), lanes: Plan['lanes'] = [];
    for (const [a, b] of this.links) {
      const x = this.owner(cells, within, a), y = this.owner(cells, within, b), key = [x?.id, y?.id].sort().join('|');
      if (!x || !y || x === y || seen.has(key)) { continue; }
      seen.add(key); lanes.push({ from: x.id, to: y.id });
    }
    return lanes;
  }
  // The cell a place is drawn in: its own; a room of a building, the building's; a door out, the place it leads to.
  private owner(cells: Cell[], within: Entity, id: string): Cell | undefined {
    return cells.find(c => c.id === id && !c.building)
      ?? cells.find(c => c.building && this.inside(id, this.stands.get(c)!))
      ?? (this.inside(id, within.id) ? undefined : cells.find(c => c.id === id));
  }
  // Every cell to a cell of its own: where its grid sets it if that is free, else the nearest free cell to that; one
  // with no grid beside the first placed cell it has a way to; else on the row below all the rest.
  private settle(cells: Cell[], lanes: Plan['lanes']) {
    const taken = new Set<string>(), placed = new Set<Cell>();
    for (const c of cells.filter(c => !isNaN(c.x)).sort((a, b) => Number(b.here) - Number(a.here))) {
      if (!taken.has(`${c.x},${c.y}`)) { this.put(c, [c.x, c.y], taken, placed); }
    }
    for (let left = cells.filter(c => !placed.has(c)), pass = 0; left.length && pass < 3; pass++) {
      for (const c of left) {
        const by = !isNaN(c.x) ? c : lanes.flatMap(l => l.from === c.id ? [l.to] : l.to === c.id ? [l.from] : [])
          .map(id => cells.find(o => o.id === id && placed.has(o))).find(Boolean);
        if (by) { this.put(c, this.free(taken, by.x, by.y), taken, placed); }
      }
      left = cells.filter(c => !placed.has(c));
    }
    const bottom = Math.max(0, ...[...placed].map(c => c.y)) + 1;
    cells.filter(c => !placed.has(c)).forEach((c, i) => this.put(c, [i, bottom], taken, placed));
  }
  private put(c: Cell, [x, y]: [number, number], taken: Set<string>, placed: Set<Cell>) {
    c.x = x; c.y = y; taken.add(`${x},${y}`); placed.add(c);
  }
  private free(taken: Set<string>, x: number, y: number): [number, number] {
    for (let r = 1; r < 8; r++) {
      const ring: [number, number][] = [[x + r, y], [x, y + r], [x - r, y], [x, y - r], [x + r, y + r],
        [x - r, y + r], [x + r, y - r], [x - r, y - r]];
      const open = ring.find(([a, b]) => !taken.has(`${a},${b}`));
      if (open) { return open; }
    }
    return [x, y + 8];
  }
}
