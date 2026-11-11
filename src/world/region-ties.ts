import text from '../../data/generation/town/ties.kyrt' with { type: 'text' };
import { KyrTemplates } from './kyr-template';
import { RegionGeography } from './region-geography';
import { RegionRumours } from './region-rumours';
import { RegionSites } from './region-sites';
import type { Region } from './region-writer';

// What each settlement has to do with the nearest place in the country that is not a settlement, and what that place
// has to say back (data/generation/town/ties.kyrt): someone in the town wants something that is at the site; the site
// holds a trace that sends the company back; the town changes when it comes. One shape is drawn for each settlement,
// by its own key, so that nothing else the country draws is changed. The same abstraction, varied by the author's
// shapes: this fills the holes, the author writes the situations.
export class RegionTies {
  static readonly template = KyrTemplates.parse(text);
  static lines(region: Region): string[] {
    const seats = RegionGeography.seats(region).filter(x => x.site.cell !== undefined && !x.site.work?.great
      && !x.site.work?.deep && !x.site.work?.imperial);
    return region.settlements.flatMap(s => {
      const near = RegionRumours.nearest(region, s, seats)[0];
      if (!near) { return []; }
      const values = { t: s.id, town: s.name, site: near.site.id, sitename: near.site.name,
        where: RegionSites.where(near, region) };
      return KyrTemplates.choose(this.template, `${region.name}:${s.id}:tie`, values)
        .flatMap(x => KyrTemplates.fill(x.lines, values));
    });
  }
}
