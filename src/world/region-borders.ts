import borders from '../../data/generation/scenes/borders.json';
import { RegionGeography } from './region-geography';
import { RegionRoads } from './region-roads';
import { Draw } from './land/draw';
import type { Border } from './land/borders';
import type { Region } from './region-writer';

// The roads out of a region: from the settlement nearest each side, an old road to the edge of the region, marked
// as the kingdom after the makers marked its bounds, or as the land itself is marked (a cairn on a pass, a beacon on
// stilts in a fen), no two borders of a country alike (data/generation/scenes/borders.json). The folk know what the
// country beyond is called and what kind of country it is, and little more; what is there is drawn the first time a
// company goes on (see Frontier).
export class RegionBorders {
  static lines(region: Region): string[] {
    const marks = this.marks(region);
    return (RegionGeography.atlas(region).borders ?? [])
      .flatMap((b, i) => this.border(b, region, marks[i % marks.length]!));
  }
  // The marks a country's borders draw from: the kingdom's first, then the land's, in an order of their own.
  private static marks(region: Region): string[] {
    const s = region.history?.successors;
    const t = borders.terrain as Record<string, string[]>, k = borders.kingdom as Record<string, string[]>;
    const land = new Draw(`${region.name}:borders`).shuffle([...t[region.terrain] ?? [], ...t.plain!]);
    const kingdom = s ? new Draw(`${region.name}:borders:kingdom`).shuffle(k[s.kind] ?? []).slice(0, 1) : [];
    return [...kingdom, ...land].map(m => m.replaceAll('{region}', region.name).replaceAll('{kingdom}', s?.name ?? region.name));
  }
  static room(b: Border): string { return `edge_${b.side}`; }
  private static border(b: Border, region: Region, mark: string): string[] {
    const q = JSON.stringify, id = this.room(b), [x, y] = RegionGeography.spot(region, b.cell);
    const from = region.settlements[b.seat]!, beyond = region.beyond?.[b.side];
    const there = beyond ? ` Beyond it the road goes on ${b.side} into ${beyond.name}, ${RegionGeography.terrain(beyond.terrain)} country, the folk say. Few of them have been.` : '';
    return [`  Place ${id}_land ${q(`the ${b.side}ern marches of ${region.name}`)} is wilderness within region at ${x}, ${y}.`,
      `  Place ${id} ${q(`the ${b.side}ern edge of ${region.name}`)} is room within ${id}_land at 0, 0.`,
      `  Passage ${id}_road ${q(`the old road ${b.side}`)} is road between ${from.id}_green and ${id} taking ${RegionRoads.time(Math.max(60, b.road.hours * RegionRoads.minutesPerHour))}.`,
      `  Observe ${id}_scene at ${id} when true ${q(`${mark}${there}`)}.`, ...this.rumour(b, beyond, from.id)];
  }
  // What the innkeeper of the town the road leaves from says of an authored country beyond, asked: a hook into it,
  // known from then as heard from them.
  private static rumour(b: Border, beyond: NonNullable<Region['beyond']>[Border['side']], town: string): string[] {
    if (!beyond?.rumour || !beyond.heard) { return []; }
    const q = JSON.stringify, id = `${this.room(b)}_beyond`, keeper = `${town}_innkeeper`;
    return [`  Discovery ${id} ${q(beyond.heard)}.`, `  Initially Assert leadsTo(${id}, ${this.room(b)}).`,
      `  Topic ${id}_told with ${keeper} ${q(`Ask {${keeper}} about the road ${b.side}`)} when not knows(actor, ${id}) {`,
      `    Says ${q(beyond.rumour.replaceAll('{keeper}', `{${keeper}}`))}.`, `    On discuss { Assert knows(actor, ${id}). }`, '  }'];
  }
}
