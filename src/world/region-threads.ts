import text from '../../data/generation/town/threads.kyrt' with { type: 'text' };
import { Draw } from './land/draw';
import { KyrTemplates } from './kyr-template';
import { RegionGeography } from './region-geography';
import { RegionRumours } from './region-rumours';
import { RegionSites } from './region-sites';
import type { Region } from './region-writer';

// Intimations of a larger world in each settlement (data/generation/town/threads.kyrt): a coin, a credential, a
// letter, a chronicle, a veteran's tale, a preacher, a find, a levy. A different one is drawn for each of a country's
// settlements, none twice, by the country's own key, so that two seeds' towns carry different things and nothing else
// the country draws is changed. The author's text says what is held and by whom; none of it is resolved.
export class RegionThreads {
  static readonly template = KyrTemplates.parse(text);
  static lines(region: Region): string[] {
    const options = new Draw(`${region.name}:threads`).shuffle([...new Set(this.template.sections.map(s => s.option))]);
    const seats = RegionGeography.seats(region).filter(x => x.site.cell !== undefined && !x.site.work?.great
      && !x.site.work?.deep && !x.site.work?.imperial);
    return ['  Measure heard_threads(group).', ...region.settlements.flatMap((s, i) => {
      const option = options[i % options.length]!, near = RegionRumours.nearest(region, s, seats)[0];
      const values = { t: s.id, town: s.name, kingdom: region.history?.successors.name ?? 'the old kingdom',
        deity: region.deity, ...near ? { site: near.site.id, sitename: near.site.name,
          where: RegionSites.where(near, region) } : {} };
      return this.template.sections.filter(x => x.option === option).flatMap(x => KyrTemplates.fill(x.lines, values));
    })];
  }
}
