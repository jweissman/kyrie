import { RegionGeography } from './region-geography';
import { RegionRoads } from './region-roads';
import type { Border } from './land/borders';
import type { Region } from './region-writer';

// The roads out of a region: from the settlement nearest each side, an old road to the edge of the region, where a
// march-stone stands. The folk know what the country beyond is called and what kind of country it is, and little
// more; what is there is drawn the first time a company goes on (see Frontier).
export class RegionBorders {
  static lines(region: Region): string[] {
    return (RegionGeography.atlas(region).borders ?? []).flatMap(b => this.border(b, region));
  }
  static room(b: Border): string { return `edge_${b.side}`; }
  private static border(b: Border, region: Region): string[] {
    const q = JSON.stringify, id = this.room(b), [x, y] = RegionGeography.spot(region, b.cell);
    const from = region.settlements[b.seat]!, beyond = region.beyond?.[b.side];
    const there = beyond ? ` Beyond it the road goes on ${b.side} into ${beyond.name}, ${RegionGeography.terrain(beyond.terrain)} country, the folk say. Few of them have been.` : '';
    return [`  Place ${id}_land ${q(`the ${b.side}ern marches of ${region.name}`)} is wilderness within region at ${x}, ${y}.`,
      `  Place ${id} ${q(`the ${b.side}ern edge of ${region.name}`)} is room within ${id}_land at 0, 0.`,
      `  Passage ${id}_road ${q(`the old road ${b.side}`)} is road between ${from.id}_green and ${id} taking ${RegionRoads.time(Math.max(60, b.road.hours * RegionRoads.minutesPerHour))}.`,
      `  Observe ${id}_scene at ${id} when true ${q(`A march-stone as tall as a man stands by the road. On this side it is cut with the sign of ${region.name}; on the far side, with a sign you do not know.${there}`)}.`];
  }
}
