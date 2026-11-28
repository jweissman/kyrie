import { ModuleSource } from './kyr-values';
import text from '../../data/generation/wild/roving.kyrt' with { type: 'text' };
import { Draw } from './land/draw';
import { Terrain, type Land } from './land/terrain';
import { KyrTemplates } from './kyr-template';
import { RegionGeography } from './region-geography';
import { RegionTracts } from './region-tracts';
import { RegionSites } from './region-sites';
import { RegionMeetings } from './region-meetings';
import { Vantage } from './vantage';
import type { Region } from './region-writer';
import { RegionKey } from './region-key';

// Who goes about the open country of a generated region, and comes upon a company crossing it (the owner's blocking
// report of 11 November: ordinary exploration felt empty; a meeting holds one stretch in ten, an animal one in eight of
// the rest, and nothing came to a company between them). A few rovers, one for about every forty stretches and never
// more than six, each drawn from data/generation/wild/roving.kyrt, each starting in a stretch of its own and ranging
// over those within a few hexes of it; one comes to the stretch the company is in, by day, on the watch's die, once
// (see the template). A danger ranges only away from the roads and the towns; the night's band, only in the dark.
export class RegionRovers {
  static readonly template = KyrTemplates.parse(text);
  static readonly most = 6;
  static readonly range = 3;
  static lines(region: Region): string[] {
    const land = RegionGeography.atlas(region).land, cells = RegionTracts.cells(region);
    const away = this.away.bind(this, land, [...RegionGeography.roads(region).flatMap(r => r.route.cells),
      ...region.settlements.flatMap(s => s.cell === undefined ? [] : [s.cell])]);
    const homes: number[] = [];
    for (const c of Draw.ranked(`${RegionKey.of(region)}:rovers`, cells)) {
      if (homes.length >= Math.min(this.most, Math.round(cells.length / 40))) { break; }
      if (homes.every(h => Terrain.distance(land, h, c) > this.range)) { homes.push(c); }
    }
    if (!homes.length) { return []; }
    const once = this.template.sections.filter(s => s.group === 'country').flatMap(s => s.lines);
    return [...once, ...homes.flatMap(home => this.write(region, home, cells.filter(c =>
      Terrain.distance(land, home, c) <= this.range), away)), ...this.road(region, land), ...this.night(region, land)];
  }
  // One band besides that goes up and down a stretch of the country's roads, away from its towns (roving.kyrt's road
  // group): drawn apart from the rest, so that every other rover is as it was.
  private static road(region: Region, land: Land): string[] {
    const towns = region.settlements.flatMap(s => s.cell === undefined ? [] : [s.cell]);
    const road = [...new Set(RegionGeography.roads(region).flatMap(r => r.route.cells))]
      .filter(c => towns.every(t => Terrain.distance(land, t, c) >= 2));
    const section = this.template.sections.find(s => s.group === 'road');
    if (!road.length || !section) { return []; }
    const home = Draw.ranked(`${RegionKey.of(region)}:rovers:road`, road)[0]!;
    const town = region.settlements.filter(s => s.cell !== undefined)
      .sort((a, b) => Terrain.distance(land, a.cell!, home) - Terrain.distance(land, b.cell!, home))[0];
    const values = { r: `wr${home}r`, home: RegionTracts.id(home), folk: region.ancestry, town: town?.name ?? region.name };
    const ranges = road.filter(c => Terrain.distance(land, home, c) <= this.range);
    return [...KyrTemplates.fill(section.lines, values), ...ranges.map(c => this.roams(values.r, c))];
  }
  // One band besides that goes about by night (roving.kyrt's night group: a pack, or the hungry dead), over a stretch
  // of the country away from its towns, roads and all: met only in the dark, once (the owner, 26 November: danger at
  // night, a little). Drawn apart from the rest, so that every other rover is as it was.
  private static night(region: Region, land: Land): string[] {
    const towns = region.settlements.flatMap(s => s.cell === undefined ? [] : [s.cell]);
    const open = RegionTracts.cells(region).filter(c => towns.every(t => Terrain.distance(land, t, c) >= 2));
    const options = this.template.sections.filter(s => s.group === 'night');
    if (!open.length || !options.length) { return []; }
    const key = `${RegionKey.of(region)}:rovers:night`, home = Draw.ranked(key, open)[0]!;
    const section = new Draw(key).weighted(options.map(o => [o, o.weight] as const));
    const values = { r: `wr${home}n`, home: RegionTracts.id(home) };
    const ranges = open.filter(c => Terrain.distance(land, home, c) <= this.range);
    return [...KyrTemplates.fill(section.lines, values),
      ...ranges.map(c => this.roams(values.r, c))];
  }
  // Where a rover goes about, declared as a value (ModuleSource: AX-04), its Kyr beside.
  private static roams(rover: string, c: number): string {
    return ModuleSource.asserted({ generator: 'region-rovers', construct: 'Initially' }, 'roams', rover,
      RegionTracts.id(c));
  }
  // Two stretches or more from any road or town (busy).
  private static away(land: Land, busy: number[], c: number): boolean {
    return busy.every(o => Terrain.distance(land, o, c) >= 2);
  }
  private static write(region: Region, home: number, ranges: number[], away: (c: number) => boolean): string[] {
    const land = RegionGeography.atlas(region).land, W = land.width, lead = RegionMeetings.lead(region, home);
    const danger = away(home);
    const options = this.template.sections.filter(s => s.group === 'any' && (lead || !s.said.includes('lead'))
      && (danger || !s.said.includes('danger')));
    if (!options.length) { return []; }
    const draw = new Draw(`${RegionKey.of(region)}:rover:${home}`), section = draw.weighted(options.map(o => [o, o.weight] as const));
    // A danger goes about only where it may be met: away from the roads and the towns.
    const where = section.said.includes('danger') ? ranges.filter(away) : ranges, she = draw.chance(0.5);
    const town = region.settlements.filter(s => s.cell !== undefined)
      .sort((a, b) => Terrain.distance(land, a.cell!, home) - Terrain.distance(land, b.cell!, home))[0];
    const values: Record<string, string> = { r: `wr${home}`, home: RegionTracts.id(home), folk: region.ancestry,
      town: town?.name ?? region.name, he: she ? 'she' : 'he', his: she ? 'her' : 'his', him: she ? 'her' : 'him' };
    if (lead && section.said.includes('lead')) {
      const at = lead.site.cell!;
      Object.assign(values, { site: lead.site.id, seen: RegionSites.seenAs(lead, region),
        toward: Vantage.bearing(at % W - home % W, Math.floor(at / W) - Math.floor(home / W)) });
    }
    return [...KyrTemplates.fill(section.lines, values),
      ...where.map(c => this.roams(`wr${home}`, c))];
  }
}
