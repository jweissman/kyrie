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

// Who goes about the open country of a generated region, and comes upon a company crossing it (the owner's blocking
// report of 11 November: ordinary exploration felt empty; a meeting holds one stretch in ten, an animal one in eight of
// the rest, and nothing came to a company between them). A few rovers, one for about every forty stretches and never
// more than six, each drawn from data/generation/wild/roving.kyrt, each starting in a stretch of its own and ranging
// over those within a few hexes of it; one comes to the stretch the company is in, by day, on the watch's die, once
// (see the template). A danger ranges only away from the roads and the towns.
export class RegionRovers {
  static readonly template = KyrTemplates.parse(text);
  static readonly most = 6;
  static readonly range = 3;
  static lines(region: Region): string[] {
    const land = RegionGeography.atlas(region).land, cells = RegionTracts.cells(region);
    const away = this.away.bind(this, land, [...RegionGeography.roads(region).flatMap(r => r.route.cells),
      ...region.settlements.flatMap(s => s.cell === undefined ? [] : [s.cell])]);
    const draw = new Draw(`${region.name}:rovers`), homes: number[] = [];
    for (const c of draw.shuffle(cells)) {
      if (homes.length >= Math.min(this.most, Math.round(cells.length / 40))) { break; }
      if (homes.every(h => Terrain.distance(land, h, c) > this.range)) { homes.push(c); }
    }
    if (!homes.length) { return []; }
    const once = this.template.sections.filter(s => s.group === 'country').flatMap(s => s.lines);
    return [...once, ...homes.flatMap(home => this.write(region, home, cells.filter(c =>
      Terrain.distance(land, home, c) <= this.range), away))];
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
    const draw = new Draw(`${region.name}:rover:${home}`), section = draw.weighted(options.map(o => [o, o.weight] as const));
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
      ...where.map(c => `  Initially Assert roams(${values.r}, ${RegionTracts.id(c)}).`)];
  }
}
