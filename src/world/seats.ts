import type { World } from '../lang/world';
import { EntityIndex } from '../lang/entity-index';
import { Canon } from '../canon/canon';
import { WorldGrid } from './world-grid';
import { WorldShape } from './world-shape';

// Where a thing points (see ItemKind.points): the canon's identity, what it is called, and where the world builds it,
// as the place a module seated it in once that place is in the world, and the cell of the grid whose country it is
// (or will be, before anyone has gone there: WorldShape.seat). Never a coordinate of its own.
export interface Pointing {
  identity: string; name: string; place?: string; cell?: [number, number];
}
// Where the canon's identities are built in a world, and which way they lie from the company: the Dun Rìerdan
// waystone points to Dun Rì (dun_ri), and so to wherever this world built the City of Seven Towers (its seat's
// country's chief town), never to a city of its own.
export class Seats {
  // The place a world seats an identity in: where a module installed said it is (seatOf(identity, place)); for one
  // with no place of its own yet, the place of the identity it is part of or seated in (a tower, its city's).
  static place(world: World, identity: string, seen = new Set<string>()): string | undefined {
    if (seen.has(identity)) { return undefined; }
    seen.add(identity);
    const own = world.one('seatOf', identity);
    if (own) { return own; }
    for (const up of [...world.related('seatedIn', identity), ...world.related('partOf', identity)]) {
      const there = this.place(world, up.args[1]!, seen);
      if (there) { return there; }
    }
    return undefined;
  }
  // Where a kind of thing points in this world, if it points anywhere: its identity, and the place and country the
  // world builds it in.
  static pointed(world: World, kind: string): Pointing | undefined {
    const identity = Canon.items[Canon.resolve('items', kind)]?.points;
    if (!identity) { return undefined; }
    const byId = EntityIndex.of(world.module.entities).byId, place = this.place(world, identity);
    const cell = (place && this.cell(world, place)) ?? WorldShape.seat(identity);
    return { identity, name: byId.get(identity)?.name ?? identity, ...place ? { place } : {}, ...cell ? { cell } : {} };
  }
  // What the thing says of it, from where the company stands: "It points north, toward Dun Rìerdan." Where the
  // company is in the city's country, it points there; in the city, it is still.
  static line(world: World, kind: string, at = world.one('at', 'party')): string | undefined {
    const p = this.pointed(world, kind);
    if (!p) { return undefined; }
    const here = at && this.cell(world, at);
    if (p.place && at && this.within(world, at, p.place)) { return `It is still: ${p.name} is here.`; }
    if (!here || !p.cell) { return `It points toward ${p.name}.`; }
    const way = this.way(here, p.cell);
    return way ? `It points ${way}, toward ${p.name}.` : `It points toward ${p.name}, in this country.`;
  }
  // The cell of the grid whose country a place is in: the generated country (region, x0ym1) it lies within, or the
  // country a province of the first lies within; none, for an authored country beyond a march or a plane.
  static cell(world: World, place: string): [number, number] | undefined {
    const byId = EntityIndex.of(world.module.entities).byId;
    for (let p: string | undefined = byId.get(place)?.type === 'place' ? place : world.one('at', place); p;
      p = byId.get(p)?.space?.parent) {
      const country = /^(\w+?)__region$/.exec(p);
      const cell = country && WorldGrid.at(country[1]!);
      if (cell) { return cell; }
    }
    return undefined;
  }
  private static within(world: World, place: string, of: string): boolean {
    const byId = EntityIndex.of(world.module.entities).byId;
    for (let p: string | undefined = place; p; p = byId.get(p)?.space?.parent) { if (p === of) { return true; } }
    return false;
  }
  // Which way one cell of the grid lies from another (north is -y): "north", "north-east", none where they are one.
  private static way([x, y]: [number, number], [tx, ty]: [number, number]): string | undefined {
    const ns = ty < y ? 'north' : ty > y ? 'south' : '', ew = tx > x ? 'east' : tx < x ? 'west' : '';
    return [ns, ew].filter(Boolean).join('-') || undefined;
  }
}
