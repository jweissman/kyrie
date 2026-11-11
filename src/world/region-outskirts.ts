import text from '../../data/generation/town/outskirts.kyrt' with { type: 'text' };
import deep from '../../data/generation/town/outskirts-deep.kyrt' with { type: 'text' };
import { KyrTemplates } from './kyr-template';
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
    return [...KyrTemplates.choose(this.template, `${region.name}:${s.id}:outskirts`, all),
      ...KyrTemplates.choose(this.deepened, `${region.name}:${s.id}:outskirts-deep`, all)]
      .flatMap(x => KyrTemplates.fill(x.lines, all));
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
