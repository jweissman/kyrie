import type { Entity, Module } from './lang/module';
import { EntityIndex } from './lang/entity-index';
import { Spatial } from './spatial';

// Which hex of its country's land a place stands at, and whether a way from one place to another crosses from one hex
// to the next. One reading for the page, which leaves such a way to the map (see Passages), and for the campaign,
// which carries one out only as a leg of a journey set out on from the map (see Campaign.execute and Travel): the
// owner, 9 November, "the world map handles travel between hexes ... enforce this as a structural invariant", and the
// quest-intent and travel-contract review of that day, which found the rule kept by the page alone.
// It holds over a generated country's land, drawn in hexes of open country (its tracts) that the map crosses. An
// authored country's own map (the Long Man's road end and green, Sarn's fern plains) is its author's, its walks between
// its places its own; which of them are journeys is that author's to say, and is left to Mission 20 (holding every
// authored land to it at once had turned the walks of every authored adventure into refusals).
export class HexBoundary {
  // A hex is the cell of the land a place stands at: its own, or else its site's, its settlement's or its wild
  // country's. A road runs over many cells and stands at none: going onto it or off it is a journey too. A place on no
  // land drawn (a ship's deck, a house between the worlds) is on no hex, and going to it crosses none.
  static hex(module: Module, id: string): string | undefined {
    const byId = EntityIndex.of(module.entities).byId, line = Spatial.ancestry(byId, id);
    const land = line.findLast(e => e.space!.kind === 'region');
    const chart = land ? this.land(module, land.id) : undefined, cell = this.cell(module, id);
    if (chart && cell !== undefined) { return `${land!.id}:${cell}`; }
    const road = chart?.roads && line.find(e => chart.roads[e.id] !== undefined);
    return road ? `${land!.id}:road:${road.id}` : undefined;
  }
  static cell(module: Module, id: string): number | undefined {
    const line = Spatial.ancestry(EntityIndex.of(module.entities).byId, id);
    const land = line.findLast(e => e.space!.kind === 'region');
    const chart = land ? this.land(module, land.id) : undefined;
    return chart?.places ? line.map(e => chart.places[e.id] ?? (e.space!.kind === 'site' ? this.door(module, e.id)
      : undefined)).find(c => c !== undefined) : undefined;
  }
  // The cell a site the chart does not draw stands in: that of the place outside it its way in opens onto. A
  // toll-house's hall, and the hobs' cave behind it, had stood in the middle of their wild country, a hex from their
  // own doorstep, so the page left the way in to the map: a player invited in found no way in (Mission 20's cold play).
  private static readonly doors = new WeakMap<Module, Map<string, number>>();
  private static door(module: Module, site: string): number | undefined {
    let doors = this.doors.get(module);
    if (!doors) { this.doors.set(module, doors = this.opened(module)); }
    return doors.get(site);
  }
  private static opened(module: Module): Map<string, number> {
    const byId = EntityIndex.of(module.entities).byId, out = new Map<string, number>();
    for (const c of module.initial) {
      if (c.kind !== 'assert' || c.call.name !== 'connects') { continue; }
      const [, a, b] = c.call.args;
      for (const [inside, outside] of [[a!, b!], [b!, a!]] as const) {
        const site = this.siteOf(byId, inside);
        if (!site || out.has(site) || this.siteOf(byId, outside)) { continue; }
        const cell = this.cell(module, outside);
        if (cell !== undefined) { out.set(site, cell); }
      }
    }
    return out;
  }
  private static siteOf(byId: Map<string, Entity>, id: string): string | undefined {
    return Spatial.ancestry(byId, id).find(e => e.space!.kind === 'site')?.id;
  }
  // A generated country's land: drawn with it, in tracts of open country.
  private static land(module: Module, region: string) {
    const chart = module.charts?.[region];
    return chart && Object.keys(chart.places).some(id => /__t\d+$/.test(id)) ? chart : undefined;
  }
  static crosses(module: Module, origin: string, destination: string): boolean {
    const a = this.hex(module, origin), b = this.hex(module, destination);
    return !!a && !!b && a !== b;
  }
}
