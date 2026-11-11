import text from '../../data/generation/town/outskirts.kyrt' with { type: 'text' };
import deep from '../../data/generation/town/outskirts-deep.kyrt' with { type: 'text' };
import conflict from '../../data/generation/town/conflict.kyrt' with { type: 'text' };
import troubles from '../../data/generation/town/troubles.kyrt' with { type: 'text' };
import neighbours from '../../data/generation/town/neighbours.kyrt' with { type: 'text' };
import { KyrTemplates } from './kyr-template';
import { Terrain } from './land/terrain';
import { RegionBonds } from './region-bonds';
import { SettlementWriter } from './settlement-writer';
import { RegionGeography } from './region-geography';
import { RegionSites } from './region-sites';
import type { Region, Settlement } from './region-writer';

// Two places a short walk from the town the company begins in, to go and look at (the owner, 10 November): the Hall,
// the house of whoever holds the land now, and the first makers' stones on the hill above the town. What they are is
// the author's, in data/generation/town/outskirts.kyrt; this fills in the town, its makers and kingdom, and what can
// be seen from the hill. Neither is an aim, nor on the way to one. Drawn by the town's own key, as the undertown is, so
// that nothing else the country draws is changed by them.
export class RegionOutskirts {
  static readonly template = KyrTemplates.parse(text);
  static readonly deepened = KyrTemplates.parse(deep);
  static readonly neighbourly = KyrTemplates.parse(neighbours);
  static readonly troubled = KyrTemplates.parse(troubles);
  static readonly contested = KyrTemplates.parse(conflict);
  static lines(region: Region, s: Settlement): string[] {
    const history = region.history, makers = history?.makers[0];
    if (!history || !makers) { return []; }
    const values: Record<string, string> = { t: s.id, town: s.name, old: makers.epithet,
      craft: makers.craft, belief: makers.belief, makersfact: `history_${makers.art}`,
      kingdom: history.successors.name, ...this.sight(region, s) };
    if (!values.sight) { return []; }
    // The deeper layer (outskirts-deep.kyrt) hangs on the first layer's ids; what needs the Empire's posting-house says
    // so itself ("if station") and is written only in a country that has one.
    const all = { ...values, ...this.station(region) };
    const peopled = this.peopled(region, s), key = `${region.name}:${s.id}`, filled = { ...all, ...this.others(region, s) };
    const sections = [...KyrTemplates.choose(this.template, `${key}:outskirts`, all),
      ...KyrTemplates.choose(this.deepened, `${key}:outskirts-deep`, all),
      ...peopled ? [...KyrTemplates.choose(this.neighbourly, `${key}:neighbours`, all),
        ...KyrTemplates.choose(this.troubled, `${key}:troubles`, all),
        ...KyrTemplates.choose(this.contested, `${key}:conflict`, filled)] : []];
    return [...sections.flatMap(x => KyrTemplates.fill(x.lines, filled)), ...peopled ? RegionBonds.lines(s.id) : []];
  }
  // The two settlements nearest the town, whom the bailiff of conflict.kyrt also collects from.
  private static others(region: Region, s: Settlement): Record<string, string> {
    const land = RegionGeography.atlas(region).land;
    const near = region.settlements.filter(x => x !== s && x.cell !== undefined && s.cell !== undefined)
      .sort((a, b) => Terrain.distance(land, s.cell!, a.cell!) - Terrain.distance(land, s.cell!, b.cell!));
    const [b, c] = [near[0] ?? s, near[1] ?? near[0] ?? s];
    return { b: b.id, bname: b.name, c: c.id, cname: c.name };
  }
  // Whether the town has an inn, a shrine and a shop, whose people the neighbours' talk is of.
  private static peopled(region: Region, s: Settlement): boolean {
    const rooms = SettlementWriter.rooms(region, s);
    return rooms.taproom && rooms.shrine && rooms.shop;
  }
  // The Empire's posting-house on the old road, where the country has one: its id, name and where it lies.
  private static station(region: Region): Record<string, string> {
    const site = region.sites.find(x => x.work?.plan === 'roadstation'), seat = site && RegionGeography.seats(region)
      .find(x => x.site === site);
    return site && seat
      ? { station: site.id, stationname: site.name, stationwhere: RegionSites.where(seat, region) } : {};
  }
  // The nearest of the country's works to the town that is not hidden from the folk, as it looks from a height, and
  // which way it lies.
  private static sight(region: Region, s: Settlement): Record<string, string> {
    if (s.cell === undefined) { return {}; }
    const from = RegionGeography.spot(region, s.cell), seats = RegionGeography.seats(region)
      .filter(x => x.site.cell !== undefined && x.site.work && !x.site.work.great && !x.site.work.deep
        && !x.site.work.imperial);
    const near = seats.map(x => ({ x, d: Math.hypot(...RegionGeography.spot(region, x.site.cell!)
      .map((v, i) => v - from[i]!)) })).sort((a, b) => a.d - b.d)[0]?.x;
    return near ? { sight: near.site.id, sightseen: RegionSites.seenAs(near, region),
      sightside: RegionGeography.compass(from, RegionGeography.spot(region, near.site.cell!)) } : {};
  }
}
